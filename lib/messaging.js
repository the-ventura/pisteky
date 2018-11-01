import { invert, pickBy } from 'lodash'

export function messageIsACommand (message) {
  return message.content.startsWith('!')
}

export function getMessageCommand (message) {
  return message.content.substr(1).split(' ')[0]
}

export function messageArguments (message, expectedArgs = {}) {
  // Expected args are of the following format:
  // { key: type }
  // type can be 'flag', 'map' or int
  const args = message.content.split(' ').slice(1)
  let tally = args
  if (args.length === 0) { return {} }

  let options = {}
  // First lets deal with non positionals
  args.forEach((arg, index) => {
    if (arg in expectedArgs) {
      const argType = expectedArgs[arg]

      if (argType === 'map') {
        options[arg] = args[index + 1]
        tally[index] = null
        tally[index + 1] = null
      } else {
        options[arg] = 'true'
        tally[index] = null
      }
    }
  })

  // Now we deal with the positionals
  const positionals = tally.filter(x => x)
  const expectedPositionals = invert(pickBy(expectedArgs, Number.isInteger))

  // There should be as many provided positionals as expected
  const numberOfExpectedPositionals = Object.keys(expectedPositionals).length
  const numberOfPositionals = positionals.length
  if (numberOfPositionals !== numberOfExpectedPositionals) { throw new Error(`Expected ${numberOfExpectedPositionals} arguments but got ${numberOfPositionals}`) }

  for (const positional in expectedPositionals) {
    options[expectedPositionals[positional]] = positionals[positional - 1]
  }
  return options
}
