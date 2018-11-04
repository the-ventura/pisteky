import config from 'config'
import { messageIsACommand, getMessageCommand } from './messaging'
import { loadSamples } from './voice'
import * as commands from './commands'
import { createTable } from './db'
import { tableHeaders } from './rocket'

const token = config.get('botToken')
const Discord = require('discord.js')
const client = new Discord.Client()

client.on('ready', async () => {
  // Preload the samples list
  await loadSamples()

  console.log('Ready!')
  client.user.setUsername(config.get('botName'))
  await createTable('db/database.db', tableHeaders) // creates table to Rocket League
})

client.login(token)

client.on('message', async message => {
  if (messageIsACommand(message)) {
    const command = getMessageCommand(message)
    if (command in commands) {
      await commands[command].execute(client, message)
    }
  }
})

client.on('error', error => console.log(error))
