import config from 'config'

const users = config.get('users')

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

export function userProfile (discordUser) {
  if (typeof users[discordUser.username] === 'undefined') {
    throw new Error(`No user profile for '${discordUser.name}'`)
  }

  return users[discordUser.username]
}

export function usersInVoiceChannel (voiceChannel) {
  return voiceChannel ? voiceChannel.members.filter(member => isNotBot(member) && isOnline(member)).map(member => member.user) : []
}
