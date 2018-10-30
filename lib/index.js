import config from 'config'
import { messageIsACommand, getMessageCommand } from './messaging'
import { joinVoice } from './sound'
import * as commands from './commands'

const token = config.get('botToken')
const Discord = require('discord.js')
const client = new Discord.Client()

client.on('ready', async () => {
  console.log('Ready!')
  client.user.setUsername(config.get('botName'))

  // Automatically ensure we are in the voice channel at startup:
  await joinVoice(client)
})

client.login(token)

client.on('message', message => {
  if (messageIsACommand(message)) {
    const command = getMessageCommand(message)
    if (command in commands) {
      commands[command].execute(client, message)
    }
  }
})

client.on('error', error => console.log(error))
