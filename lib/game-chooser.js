import config from 'config'
import SteamAPI from 'steamapi'
import { usersInVoiceChannel } from './users'
import { sample, every, map, flattenDeep, intersectionBy, filter } from 'lodash'

let gameDetailsCache = {}
let userGamesCache = {}

const steam = new SteamAPI(config.get('steam.token'))
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function chooseGame (client, message, options, pick = true) {
  const users = usersInVoiceChannel(message.member.voiceChannel)
  const userCount = users.length
  if (userCount === 0 && !options.noplayers) { return undefined }
  const gamesToPlay = filterGames(config.get('games'), userCount, options, userGamePreferences(users))
  return pick ? sample(gamesToPlay) : gamesToPlay
}

export async function commonGamesOnSteam () {
  let gameSets = []

  for (let steamID of config.get('steam.accounts')) {
    if (userGamesCache[steamID]) {
      gameSets.push(userGamesCache[steamID])
    } else {
      const games = await steam.getUserOwnedGames(steamID)
      userGamesCache[steamID] = games
      gameSets.push(games)
    }
  }

  const commonGames = intersectionBy(...gameSets, g => g.appID)
  let gameDetails = []

  for (let app of commonGames) {
    if (gameDetailsCache[app.appID]) {
      gameDetails.push(gameDetailsCache[app.appID])
    } else {
      try {
        const details = await steam.getGameDetails(app.appID)
        gameDetailsCache[app.appID] = details
        gameDetails.push(details)
      } catch (err) {
        console.log(`Could not get details for ${app.name}#${app.appID}`)
      }
    }
  }

  const multiplayerGames = filter(gameDetails, g => {
    // Is Multi-Player or Co-Op
    return filter(g.categories, cat => cat.id === 1 || cat.id === 9).length > 0
  })

  return map(multiplayerGames, g => g.name)
}

function userGamePreferences (users) {
  const userPrefs = config.get('users')
  return flattenDeep(map(map(users, user => user.id), id => typeof userPrefs[id] === 'undefined' ? [] : userPrefs[id].dislikes))
}

export function launcherForGame (game) {
  const launcher = game.launcher
  if (!launcher) return null

  if (launcher.steamAppId) {
    return {
      banner: `https://steamcdn-a.akamaihd.net/steam/apps/${launcher.steamAppId}/header.jpg`,
      url: `steam://rungameid/${launcher.steamAppId}`
    }
  } else {
    throw new Error(`Don't know how to gather launcher details for ${game.name} (${launcher})`)
  }
}

function filterGames (games, numberOfPlayers, options, disliked) {
  const today = days[(new Date()).getDay()]
  return games.filter(game => checkConditions(game, today, numberOfPlayers, options, disliked))
}

function checkConditions (game, today, numberOfPlayers, options, disliked) {
  return every([
    hasTheRightAmmountOfPlayers(game, numberOfPlayers, options),
    isTheCorrectDay(game, today, options),
    matchesTheOptions(game, options),
    isDisliked(disliked, game)
  ])
}

function hasTheRightAmmountOfPlayers (game, numberOfPlayers, options) {
  return options.noplayers ? true : (numberOfPlayers >= game.minimumPlayers) && (numberOfPlayers <= game.maximumPlayers)
}

function isTheCorrectDay (game, today, options) {
  return options.nocal ? true : game.availableDays.includes(today)
}

function matchesTheOptions (game, options) {
  for (const option in options) {
    if (option in game) {
      if (String(game[option]).toLowerCase() !== options[option].toLowerCase()) { return false }
    }
  }
  return true
}

function isDisliked (dislikedGames, game) {
  return !dislikedGames.includes(game.name)
}
