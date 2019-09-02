import { chooseGame, launcherForGame, commonGamesOnSteam } from '../game-chooser'
import { RichEmbed } from 'discord.js'
import { messageArguments } from '../messaging'
import { map } from 'lodash'

const playArgs = {
  'competitive': 'flag',
  'style': 'map',
  'speed': 'map',
  'nocal': 'flag',
  'noplayers': 'flag'
}

function makeUsage (args) {
  return map(args, (val, key) => {
    return val === 'map' ? `[${key} value]` : `[${key}]`
  }).join(' ')
}

export const steamGames = {
  name: 'SteamGames',
  help: '[WORK IN PROGRESS, MAY BE SLOW!] List multi-player games on steam that everyone owns',
  usage: `!steamGames`,
  async execute (client, message) {
    const commonGames = await commonGamesOnSteam()
    message.channel.send(`[WORK IN PROGRESS] Everyone seems to have the following multi-player games: \n\`\`\`\n${commonGames.join(`\n`)}\`\`\``)
  }
}

export const play = {
  name: 'Play',
  help: 'Chooses a game to play when everyone is just a bit too indecisive',
  usage: `!play ${makeUsage(playArgs)}`,
  async execute (client, message) {
    const options = messageArguments(message, playArgs)
    const game = chooseGame(client, message, options)
    if (game) {
      const launcher = launcherForGame(game)

      // If we have game launcher details, we can build a rich embed with
      // a banner image, and a link to directly open the game on steam:
      if (launcher) {
        const embed = new RichEmbed()

        embed.setTitle(game.name).setImage(launcher.banner)

        message.channel.send(`You should play **${game.name}**: ${launcher.url}`, embed)
      } else {
        message.channel.send(`You should play ${game.name}`)
      }
    } else {
      message.channel.send('I don\'t know, whatever you feel like...')
    }
  }
}

export const games = {
  name: 'Games',
  help: 'Lists the available games for today with the especified conditions',
  usage: `!games ${makeUsage(playArgs)}`,
  execute (client, message) {
    const options = messageArguments(message, playArgs)
    const games = chooseGame(client, message, options, false)
    message.channel.send(`\`\`\`\n${map(games, game => game.name).join(`\n`)}\`\`\``)
  }
}
