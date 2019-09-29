import { userProfile } from '../users'
import { chooseGame, launcherForGame } from '../game-chooser'
import { RichEmbed } from 'discord.js'
import { getPlayerStats, relevantStatsFromHero } from '../overwatch'
import { startCase } from 'lodash'

export const ow = {
  name: 'Overwatch',
  help: 'Spits out some overwatch stats about yourself',
  usage: `!ow`,
  async execute (client, message) {
    const username = userProfile(message.author).overwatch.username
    const stats = await getPlayerStats(username, 'pc')
    const embed = new RichEmbed()
      .setColor('#0099ff')
      .setTitle(`Stats for ${username}`)
      .setThumbnail(stats.portrait)
      .addField('Games Won', stats.gamesWon, true)
      .addField('Level', stats.level, true)
      .addField('Endorsement level', stats.endorsementLevel, true)
      .addField('Support rank', stats.ranks.support, true)
      .addField('Tank rank', stats.ranks.tank, true)
      .addField('Damage rank', stats.ranks.damage, true)

    stats.topHeroes.forEach(h => {
      const gamesWon = h.game.games_won
      const timePlayed = h.game.time_played

      embed
        .addBlankField()
        .addField(startCase(h.name), `${gamesWon} games won, ${timePlayed} played (this season)`)

      relevantStatsFromHero(h).forEach(group => {
        embed.addField(startCase(group.name), group.value, true)
      })
    })

    message.channel.send(embed)
  }
}

export const play = {
  name: 'Play',
  help: 'Chooses a game to play when everyone is just a bit too indecisive',
  usage: `!play`,
  async execute (client, message) {
    const game = await chooseGame(message)

    if (game) {
      const embed = new RichEmbed()

      embed.setTitle(game.name).setImage(game['header_image'])

      message.channel.send(`You should play **${game.name}**: steam://rungameid/${game['steam_appid']}`, embed)
    } else {
      message.channel.send('I don\'t know, whatever you feel like...')
    }
  }
}
