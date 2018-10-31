import { playSampleInVoiceChannel, isValidSample, listSamples } from '../voice'

const samplePattern = /!say ([\w\d]+)/

export const say = {
  name: 'Say',
  help: 'Tells the bot to say something in your voice channel',
  usage: '!say [sample]',
  async execute (client, message) {
    if (!message.member.voiceChannel) {
      return message.channel.send('You need to be in a voice channel to use this command')
    }

    const sampleMatch = message.content.match(samplePattern)
    if (!sampleMatch) return null

    const sampleName = sampleMatch[1]

    if (isValidSample(sampleName)) {
      await playSampleInVoiceChannel(sampleName, message.member.voiceChannel)
    } else {
      message.channel.send(`Sorry, I'm not familiar with that sample`)
    }
  }
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
