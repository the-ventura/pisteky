export function isBot (member) {
  return member.user.bot
}

export function isNotBot (member) {
  return !isBot(member)
}

export function isOnline (member) {
  return member.presence.status === 'online'
}

export function activeUsers (client, guildId) {
  const numberOfUsers = client.guilds.get(guildId).members.filter(member => isNotBot(member) && isOnline(member)).size
  return numberOfUsers === 0 ? 1 : numberOfUsers
}
