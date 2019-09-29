import config from 'config'
import SteamAPI from 'steamapi'
import { promisify } from 'util'
import { readFile, writeFile } from 'fs'
import { usersInVoiceChannel, userProfile } from './users'
import { intersectionBy, filter, sample } from 'lodash'

const cacheFile = 'tmp/games-cache.json'

let gameDetailsCache = {}
let userGamesCache = {}

const readFileAsync = promisify(readFile)
const writeFileAsync = promisify(writeFile)

const steam = new SteamAPI(config.get('steam.token'))

export async function chooseGame (message) {
  const users = usersInVoiceChannel(message.member.voiceChannel).map(userProfile)
  return sample(await commonGamesOnSteam(users.map(u => u.steamId)))
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

export async function commonGamesOnSteam (steamAccountIds) {
  let gameSets = []

  for (let steamID of steamAccountIds) {
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
        // We already know we can't hit these, so to save on API trips, add
        // a dummy entry to the cache:
        gameDetailsCache[app.appID] = { err: 'No data' }
      }
    }
  }

  const multiplayerGames = filter(gameDetails, g => {
    // Ignore dummy cache entries:
    if (g.err) { return false }

    // Is Multi-Player or Co-Op
    return filter(g.categories, cat => cat.id === 1 || cat.id === 9).length > 0
  })

  // Store this cache in a file for later - this is particularly useful
  // in local development:
  await dumpCache()
  return multiplayerGames
}
