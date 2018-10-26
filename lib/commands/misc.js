import { map } from 'lodash'
import * as commands from './'
import { activeUsers } from '../users'

export const ping = {
  name: 'Ping',
  help: 'Pings the bot',
  usage: '!ping',
  execute (client, message) {
    message.channel.send('Pong')
  }
}
export const users = {
  name: 'Users',
  help: 'Returns the current online user count, users that are away or in do not disturb mode will not be counted',
  usage: '!users',
  execute (client, message) {
    message.channel.send(`There are currently ${activeUsers(client)} online users`)
  }
}

export const help = {
  name: 'Help',
  help: 'Lists all available commands',
  usage: '!help',
  execute (client, message) {
    message.channel.send(map(commands, command => {
      return `**${command.name}**\n\tUsage: ${command.usage}\n\tDescription: ${command.help}`
    }))
  }
}
