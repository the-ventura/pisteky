import { activeUsers } from '../users'

export const ping = {
  execute (client, message) {
    message.channel.send('Pong')
  }
}
export const users = {
  execute (client, message) {
    message.channel.send(`There are currently ${activeUsers(client)} online users`)
  }
}
