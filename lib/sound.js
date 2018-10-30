const voice = {
  channel: null, // The voice channel we're connected to
  connection: null // The voice connection, if one is active
}

export async function joinVoice (client) {
  // Naively assume the voice channel we want is the first one we find:
  voice.channel = client.channels.find(ch => ch.type === 'voice')

  if (voice.channel) {
    voice.connection = await voice.channel.join()
    console.log('Joined voice channel')
  } else {
    console.log('Could not find a voice channel to join')
  }
}

export function hasVoiceChannel () {
  return voice.channel !== null
}

export function hasVoiceConnection () {
  return voice.connection !== null
}
