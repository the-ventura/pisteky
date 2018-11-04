import { messageArguments } from '../messaging'
import { logStats } from '../rocket'

export const rl = {
  name: 'Rl',
  help: 'Stores a rocket league score in a database',
  usage: '!rl 2-1 o f',
  async execute (client, message) {
    try {
      const options = messageArguments(message, { 'score': 1, 'o': 'flag', 'overtime': 'flag', 'f': 'flag', 'forfeit': 'flag' })
      const msg = await logStats(options)
      message.channel.send(`${msg.timestamp}`)
    } catch (error) {
      message.channel.send(`Whoops, ${error}`)
    }
  }
}
