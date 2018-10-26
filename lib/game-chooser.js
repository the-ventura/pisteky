import { activeUsers } from './users'
import config from 'config'
import { sample } from 'lodash'

export function chooseGame (client) {
  const userCount = activeUsers(client)
  const games = config.get('games')
  return filterGames(games, userCount)
}

function filterGames (games, numberOfPlayers) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = days[(new Date()).getDay()]
  const availableGames = games.filter(game => {
    return (numberOfPlayers >= game.minimumPlayers) && (numberOfPlayers <= game.maximumPlayers) && (game.availableDays.includes(today))
  })
  return sample(availableGames)
}
