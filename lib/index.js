import config from 'config'
import { messageIsACommand, getMessageCommand } from './messaging'
import { playSampleIfExists } from './commands/voice'
import { loadSamples, disconnectIfActiveVoiceConnection } from './voice'
import * as commands from './commands'

const token = config.get('botToken')
const Discord = require('discord.js')
const client = new Discord.Client()

client.on('ready', async () => {
  // Preload the samples list
  await loadSamples()

  console.log('Ready!')
  client.user.setUsername(config.get('botName'))
})

client.login(token)

client.on('message', async message => {
  if (message.content[0] === '>') {
    await playSampleIfExists(message.content.substr(1).split(' ')[0], message)
  } else if (messageIsACommand(message)) {
    const command = getMessageCommand(message)
    if (command in commands) {
      await commands[command].execute(client, message)
    }
  }
})

client.on('error', error => console.log(error))

// Allow the bot to disconnect from the voice channel, if it's connected to one.
// If we don't exit gracefully, the bot disconnects only after the 60 second (?)
// timeout imposed by Discord
const onExit = (code = 0) => {
  disconnectIfActiveVoiceConnection()

  process.exit(code)
}

process.once('exit', onExit)
process.once('SIGTERM', onExit)
process.once('SIGINT', onExit)
