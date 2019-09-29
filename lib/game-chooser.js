import config from 'config'
import SteamAPI from 'steamapi'
import weighted from 'weighted'
import { promisify } from 'util'
import { readFile, writeFile } from 'fs'
import { usersInVoiceChannel, userProfile } from './users'
import { intersectionBy, filter, mean, fromPairs } from 'lodash'

const cacheFile = 'tmp/games-cache.json'

let gameDetailsCache = {}
let userGamesCache = {}

const readFileAsync = promisify(readFile)
const writeFileAsync = promisify(writeFile)

const steam = new SteamAPI(config.get('steam.token'))

export async function chooseGame (message) {
  let gamesNormalizedPlaytimes = {}

  const users = usersInVoiceChannel(message.member.voiceChannel).map(userProfile)
  const ids = users.map(u => u.steamId)

  const commonGames = await commonGamesOnSteam(ids)

  for (let id of ids) {
    const userGames = await gamesForUser(id)

    userGames.forEach(g => {
      if (typeof gamesNormalizedPlaytimes[g.appID] === 'undefined') {
        gamesNormalizedPlaytimes[g.appID] = [g.playTime]
      } else {
        gamesNormalizedPlaytimes[g.appID].push(g.playTime)
      }
    })
  }

  // Collect total combined play time for available common games, for all
  // players in the current group:
  const weightedGames = fromPairs(commonGames.map(g => {
    const appID = g['steam_appid']
    return [appID, mean(gamesNormalizedPlaytimes[appID])]
  }))

  return gameDetails(weighted.select(weightedGames))
}

export async function warmupCache () {
  try {
    const cache = JSON.parse(await readFileAsync(cacheFile))
    gameDetailsCache = cache.details
    userGamesCache = cache.user
  } catch (err) {
    console.log('Could not find a steam games cache to preload')
  }
}

async function dumpCache () {
  await writeFileAsync(cacheFile, JSON.stringify({
    details: gameDetailsCache,
    user: userGamesCache
  }))
}

async function gamesForUser (steamAccountID) {
  if (userGamesCache[steamAccountID]) {
    return userGamesCache[steamAccountID]
  } else {
    const games = await steam.getUserOwnedGames(steamAccountID)
    userGamesCache[steamAccountID] = games

    return userGamesCache[steamAccountID]
  }
}

async function gameDetails (appID) {
  if (gameDetailsCache[appID]) {
    return gameDetailsCache[appID]
  } else {
    try {
      const details = await steam.getGameDetails(appID)
      gameDetailsCache[appID] = details
      return gameDetailsCache[appID]
    } catch (err) {
      console.log(`Could not get details for ${appID}`)

      // We already know we can't hit these, so to save on API trips, add
      // a dummy entry to the cache:
      gameDetailsCache[appID] = { err: 'No data' }
      return gameDetailsCache[appID]
    }
  }
}

export async function commonGamesOnSteam (steamAccountIds) {
  let sets = []
  let details = []

  // Collect games for each of the steamAccountIDs
  for (let steamID of steamAccountIds) {
    sets.push(await gamesForUser(steamID))
  }

  // Find common games amongst all players:
  const commonGames = intersectionBy(...sets, g => g.appID)

  // Collect details for all common games, so we can figure out
  // game categories, get header images, etc:
  for (let app of commonGames) {
    details.push(await gameDetails(app.appID))
  }

  // Filter out anything singleplayer:
  const multiplayerGames = filter(details, g => {
    // Ignore dummy cache entries:
    if (g.err) { return false }

    // Is Multi-Player or Co-Op
    return filter(g.categories, cat => cat.id === 1 || cat.id === 9).length > 0
  })

  // Store this cache in a file for later
  await dumpCache()
  return multiplayerGames
}
