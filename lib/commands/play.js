import { chooseGame, launcherForGame } from '../game-chooser'
import { RichEmbed } from 'discord.js'

export const play = {
  name: 'Play',
  help: 'Chooses a game to play when everyone is just a bit too indecisive',
  usage: '!play',
  execute (client, message) {
    const game = chooseGame(client, message.member.guild.id)
    if (game) {
      const launcher = launcherForGame(game)

      // If we have game launcher details, we can build a rich embed with
      // a banner image, and a link to directly open the game on steam:
      if (launcher) {
        const embed = new RichEmbed()

        embed.setTitle(game.name)

        // We may not always have a banner image:
        if (launcher.banner) {
          embed.setImage(launcher.banner)
        }

        message.channel.send(`You should play **${game.name}**: ${launcher.url}`, embed)
      } else {
        message.channel.send(`You should play ${game.name}`)
      }
    } else {
      message.channel.send('I don\'t know, whatever you feel like...')
    }
  }
}
