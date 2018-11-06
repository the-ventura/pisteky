import { usersInVoiceChannel } from './users'
import config from 'config'
import { sample, every } from 'lodash'

export function chooseGame (client, message, options, pick = true) {
  const users = usersInVoiceChannel(message.member.voiceChannel)
  if (users.length === 0 && !options.noplayers) { return undefined }
  const userCount = users.length
  const games = config.get('games')
  return pick ? sample(filterGames(games, userCount, options)) : filterGames(games, userCount, options)
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

function filterGames (games, numberOfPlayers, options) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = days[(new Date()).getDay()]
  return games.filter(game => checkConditions(game, today, numberOfPlayers, options))
}

function checkConditions (game, today, numberOfPlayers, options) {
  return every([
    hasTheRightAmmountOfPlayers(game, numberOfPlayers, options),
    isTheCorrectDay(game, today, options),
    matchesTheOptions(game, options)
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
