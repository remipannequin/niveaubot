'use strict';

/**
 * NiveauBot, a discord bot that get river levels from the french vigicrues webservice.
 * 
 * Interaction:
 * The bot listing for the following commands:
 * ! niveau <river>
 */

// Import the discord.js module
const { Client, Intents } = require('discord.js');

// Create an instance of a Discord client
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const fs = require('fs');

//Module where we parse commands, query hydro services, and format response
const rivers = require('./rivers');

/**
 * The ready event is vital, it means that only _after_ this will your bot start reacting to information
 * received from Discord
 */
client.on('ready', () => {
  console.log('NiveauBot connecté !');
});



// Create an event listener for messages
client.on('message', message => {
  // If the message is "ping"
  // TODO: create a function that match a regexp and return content
  if (message.content.startsWith('!')) {
    let cmd = rivers.parseCmd(message.content);
    if (cmd != null) {
        // Send response to the same channel
        rivers.query(cmd, msg => message.channel.send(msg));
    }
  }
});


fs.readFile('token', (err, data) => {
    if (err) throw err;
    let token = data.toString().trim();
    console.log(`Got token "${token}"`);
    client.login(token);
});


// URL to join the bot to a server:
// https://discord.com/api/oauth2/authorize?client_id=830348846202093579&scope=bot&permissions=3072