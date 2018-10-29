import { times, random } from 'lodash'

const rollPattern = /((\d+)x)?d(\d+)/i
const roller = (die) => {
  // Returns a positive, non-zero random integer
  return () => random(die) || 1
}

// Given an array of strings, parses said strings into rolls, and
// returns a list with the results
//
// Example input:
//  ['d20', '2xd4']
//
// Example output:
//  [
//   { roll: 'd20', results: [18] },
//   { roll: '2xd4', results: [4, 2] }
//  ]
export function rollDiceFromStrings (rolls) {
  return rolls.map(roll => {
    const parts = roll.match(rollPattern)

    if (!parts) {
      return { roll, results: [] }
    }

    const die = Math.min(parseInt(parts[3] || 0), 9999)
    const count = Math.min(parseInt(parts[2] || 1), 15)

    return {
      roll,
      die: `d${die}`,
      count: count,
      results: times(count, roller(die))
    }
  })
}
