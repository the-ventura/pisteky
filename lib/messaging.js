export function messageIsACommand (message) {
  return message.content.startsWith('!')
}

export function getMessageCommand (message) {
  return message.content.substr(1).split(' ')[0]
}
