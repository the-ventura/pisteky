import { activeUsers } from './users'
import config from 'config'
import { sample } from 'lodash'

export function chooseGame (client, guildId) {
  const userCount = activeUsers(client, guildId)
  const games = config.get('games')
  return filterGames(games, userCount)
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

function filterGames (games, numberOfPlayers) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = days[(new Date()).getDay()]
  const availableGames = games.filter(game => {
    return (numberOfPlayers >= game.minimumPlayers) && (numberOfPlayers <= game.maximumPlayers) && (game.availableDays.includes(today))
  })
  return sample(availableGames)
}
