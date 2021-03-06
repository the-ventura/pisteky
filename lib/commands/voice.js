import {
  playSampleInVoiceChannel,
  isValidSample,
  listSamples,
  stopActiveDispatcher,
  playYoutubeInVoiceChannel,
  playYoutubePlaylistInVoiceChannel,
  disconnectIfActiveVoiceConnection,
  joinPopulatedVoiceChannel
} from '../voice'

export async function playSampleIfExists (sampleName, message) {
  if (isValidSample(sampleName)) {
    await playSampleInVoiceChannel(sampleName, message.member.voiceChannel)
  } else {
    message.channel.send(`Sorry, I'm not familiar with that sample`)
  }

  message.delete()
}

export const samples = {
  name: 'Samples',
  help: 'List the available voice samples',
  usage: '!samples',
  async execute (client, message) {
    const codeBlock = '```'
    message.channel.send(`Here's the available samples: ${codeBlock}\n${listSamples().join('\n')}\n${codeBlock}`)
  }
}

export const yt = {
  name: 'Yt',
  help: 'Tells the bot to play the audio from the given youtube video in the voice channel',
  usage: '!yt [url] [limitSecs]',
  async execute (client, message) {
    const parts = message.content.split(' ')
    const url = parts[1]
    const limit = parseInt(parts[2]) // Ignored if this is a playlist link

    if (!message.member.voiceChannel) {
      return message.channel.send('You need to be in a voice channel to use this command')
    }

    // Janky way to check if this is an explicit playlist link, or a direct link (which may
    // include a list=xyz reference)
    if (url.match(/youtube\.com\/playlist\?/)) {
      await playYoutubePlaylistInVoiceChannel({ url }, message.member.voiceChannel)
    } else {
      await playYoutubeInVoiceChannel({ url, limit }, message.member.voiceChannel)
    }
  }
}

export const stop = {
  name: 'Stop',
  help: 'Tells the bot to shut up',
  usage: '!stop',
  async execute (client, message) {
    stopActiveDispatcher()
    message.delete()
  }
}

export const join = {
  name: 'Join',
  help: 'Force joins the channel',
  usage: '!join',
  async execute (client, message) {
    disconnectIfActiveVoiceConnection()
    joinPopulatedVoiceChannel(client)
  }
}
