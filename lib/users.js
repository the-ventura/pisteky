export function isBot (member) {
  return member.user.bot
}

export function isNotBot (member) {
  return !isBot(member)
}

export function isOnline (member) {
  return member.presence.status === 'online'
}

export function activeUsers (client) {
  const numberOfUsers = client.guilds.get('505065602021589003').members.filter(member => isNotBot(member) && isOnline(member)).size
  return numberOfUsers === 0 ? 1 : numberOfUsers
}
