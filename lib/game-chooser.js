import { activeUsers } from './users'
import config from 'config'
import { sample, every } from 'lodash'

const battleNetGameBanners = {
  // Overwatch
  Pro: 'https://d1u1mce87gyfbn.cloudfront.net/media/wallpaper/logo-burst-wide.jpg',
  DST2: 'https://www.destinythegame.com/content/dam/atvi/bungie/destiny2/common/D1_Logo-White.png'
}

export function chooseGame (client, guildId) {
  const users = activeUsers(client, guildId)
  const userCount = users.length
  const games = config.get('games')
  return sample(filterGames(games, userCount))
}

export function launcherForGame (game) {
  const launcher = game.launcher
  if (!launcher) return null

  if (launcher.steamAppId) {
    return {
      banner: `https://steamcdn-a.akamaihd.net/steam/apps/${launcher.steamAppId}/header.jpg`,
      url: `steam://rungameid/${launcher.steamAppId}`
    }
  } else if (launcher.battleNetGame) {
    return {
      banner: battleNetGameBanners[launcher.battleNetGame],
      url: `battlenet://${launcher.battleNetGame}`
    }
  } else {
    throw new Error(`Don't know how to gather launcher details for ${game.name} (${launcher})`)
  }
}

function filterGames (games, numberOfPlayers) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = days[(new Date()).getDay()]
  return games.filter(game => checkConditions(game, today, numberOfPlayers))
}

function checkConditions (game, today, numberOfPlayers) {
  return every([
    hasTheRightAmmountOfPlayers(game, numberOfPlayers),
    isTheCorrectDay(game, today)
  ])
}

function hasTheRightAmmountOfPlayers (game, numberOfPlayers) {
  return (numberOfPlayers >= game.minimumPlayers) && (numberOfPlayers <= game.maximumPlayers)
}

function isTheCorrectDay (game, today) {
  return game.availableDays.includes(today)
}
