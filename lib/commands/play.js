export const play = {
  name: 'Play',
  help: 'Chooses a game to play when everyone is just a bit too indecisive',
  usage: '!play',
  execute (client, message) {
    message.channel.send('I don\'t know, whatever you feel like...')
  }
}
