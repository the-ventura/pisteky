import config from "config"
import Client from 'discord.io'

const token = config.get('botToken')
const bot = Client({
    token,
    autorun: true
})

bot.on('ready', () => {
    console.log('Logged in as %s - %s\n', bot.username, bot.id)
})

bot.on('message', (user, userID, channelID, message, event) => {
    if (message === "ping") {
        bot.sendMessage({
            to: channelID,
            message: "pong"
        });
    }
})