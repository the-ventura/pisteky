export function messageIsACommand (message) {
  return message.content.startsWith('!')
}

export function getMessageCommand (message) {
  return message.content.substr(1).split(' ')[0]
}

export function messageArguments (message, expectedArgs = {}) {
  // Expected args are of the following format:
  // { key: type }
  // type can be 'flag' or 'map'
  const args = message.content.split(' ').slice(1)
  if (args.length === 0) { return {} }

  let realArgs = {}
  args.forEach((arg, index) => {
    if (arg in expectedArgs) {
      const argType = expectedArgs[arg]

      if (argType === 'map') {
        realArgs[arg] = args[index + 1]
      } else {
        realArgs[arg] = 'true'
      }
    }
  })
  return realArgs
}
