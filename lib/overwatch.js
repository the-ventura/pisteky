import oversmash from 'oversmash'
import { sortBy, takeRight, get, sampleSize } from 'lodash'

const ow = oversmash({
  // So we get pretty % values displayed
  percentsToInts: false
})

export async function getPlayerStats (username, platform = 'pc') {
  const profile = await ow.player(username)
  const details = await ow.playerStats(username, platform)

  const topHeroes = mostPlayedHeroesFromStats(details.stats.competitive)

  return {
    portrait: profile.accounts[0].portrait,
    level: profile.accounts[0].level,
    ranks: details.stats.competitiveRank,
    endorsementLevel: details.stats.endorsementLevel,
    gamesWon: details.stats.gamesWon,
    topHeroes
  }
}

export function relevantStatsFromHero (stats) {
  const segment = stats.hero
  const keys = sampleSize(Object.keys(segment), 3)

  return keys.map(k => {
    return {
      rawName: k,
      name: k.replace(/_/g, ' '),
      value: segment[k]
    }
  })
}

function mostPlayedHeroesFromStats (heroes) {
  const heroNames = Object.keys(heroes)

  const topHeroes = sortBy(heroNames, name => {
    const timePlayed = get(heroes[name], 'game.time_played')

    if (name === 'all' || !timePlayed) return -1

    return stringPeriodInMinutes(timePlayed)
  })

  return takeRight(topHeroes, 3).map(name => heroes[name])
}

function stringPeriodInMinutes (timeString) {
  if (timeString.indexOf(':') === -1) return -1

  const parts = timeString.split(':')
  const hoursAsMinutes = parts.length > 2 ? parseInt(parts[0]) * 60 : 0
  const minutes = parts.length > 2 ? parseInt(parts[1]) : parseInt(parts[0])

  return minutes + hoursAsMinutes
}
