import { chooseGame } from '../game-chooser'
export const play = {
  name: 'Play',
  help: 'Chooses a game to play when everyone is just a bit too indecisive',
  usage: '!play',
  execute (client, message) {
    const game = chooseGame(client)
    if (game) {
      message.channel.send(`You should play ${game.name}`)
    } else {
      message.channel.send('I don\'t know, whatever you feel like...')
    }
  }
}
