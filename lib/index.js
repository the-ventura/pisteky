import config from 'config'
import { map } from 'lodash'
import { messageIsACommand, getMessageCommand } from './messaging'
import * as commands from './commands'

const token = config.get('botToken')
const Discord = require('discord.js')
const client = new Discord.Client()

client.on('ready', () => {
  console.log('Ready!')
  // console.log(client.guilds.get("505065602021589003").members.get("337349634936668161").presence.status)
})

client.login(token)

client.on('message', message => {
  if (messageIsACommand(message)) {
    const command = getMessageCommand(message)
    // Todo: error handling
    commands[command].execute(message)
  }
})
