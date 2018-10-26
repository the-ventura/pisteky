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
  return client.guilds.get('505065602021589003').members.filter(member => isNotBot(member) && isOnline(member)).size
}
