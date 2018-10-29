import { map } from 'lodash'
import config from 'config'
import * as commands from './'
import { activeUsers } from '../users'
import { rollDiceFromStrings } from '../roll'

export const ping = {
  name: 'Ping',
  help: 'Pings the bot',
  usage: '!ping',
  execute (client, message) {
    message.channel.send('Pong')
  }
}

export const roll = {
  name: 'Roll',
  help: 'Rolls one or more dice of various types',
  usage: '!roll 2xd20 d4 2xd10',
  execute (client, message) {
    const rolls = message.content.split(' ').slice(1)
    const results = rollDiceFromStrings(
      rolls.length > 0 ? rolls : ['d6']
    )

    const resultsBody = results.map(r => {
      return `${r.die} x ${r.count}: **${r.results.join(', ')}**`
    })

    message.channel.send(`Here you go:\n${resultsBody.join('\n')}\n`)
  }
}

export const users = {
  name: 'Users',
  help: 'Returns the current online user count, users that are away or in do not disturb mode will not be counted',
  usage: '!users',
  execute (client, message) {
    message.channel.send(`There are currently ${activeUsers(client, message.member.guild.id).length} online users`)
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

export const health = {
  name: 'Health',
  help: 'Print bot information',
  usage: '!help',
  execute (client, message) {
    message.channel.send(`Hi, I'm ${config.get('botName')} and I'm on version ${config.get('botVersion')}`)
  }
}
