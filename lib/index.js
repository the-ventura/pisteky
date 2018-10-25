import config from "config"

const token = config.get('botToken')
const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
    console.log('Ready!');
});

client.login(token);

client.on('message', message => {
  console.log(message.content);
});
