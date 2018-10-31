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
  return client.guilds.get(guildId).members.filter(member => isNotBot(member) && isOnline(member)).map(member => member.user)
}

export function usersInVoiceChannel (client, message) {
  const voiceChannel = client.channels.get(message.member.voiceChannelID)
  return voiceChannel ? voiceChannel.members.filter(member => isNotBot(member) && isOnline(member)).map(member => member.user) : []
}
