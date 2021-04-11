'use strict';

/**
 * A ping pong bot, whenever you send "ping", it replies "pong".
 */

// Import the discord.js module
const { Client, Intents } = require('discord.js');

// Create an instance of a Discord client
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// Use node-fetch to get river level data
const fetch = require('node-fetch');

const fs = require('fs');


//bot.on('message', message => {
//  if (message.content === 'niveau Moselle') {
//    rsp = query('Moselle')
//    message.reply(rsp)
//  }
//})



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
  if (message.content === 'Niveau Moselle ?') {
    // Send "pong" to the same channel
    query("Moselle", message.channel);
  }
  if (message.content === 'Niveau Madon ?') {
    // Send "pong" to the same channel
    query("Madon", message.channel);
  }
});




function queryRiverLevel(stationid, channel) {
    let url = `http://www.vigicrues.gouv.fr/services/observations.json?CdStationHydro=${stationid}&FormatDate=iso&GrdSerie=Q`
    console.log('querying station '+stationid)
        
    resp = fetch(url)
        .then(resp => resp.json())
        .then(json => processLevel(json))
        .then(curlev => displayLevel(curlev, channel))
   //TODO make this function return a Promise (with the requested value inside)
}

function displayLevel(obs, channel) {
    channel.send(`Débit à ${obs['DtObsHydro']}: ${obs['ResObsHydro']} m3/s`)
}



//Extract the last value
function processLevel(json) {
    obs = json['Serie']['ObssHydro']
    return obs[obs.length-1]
    
}


//TODO add the station ID in a config file

function query(river, channel) {
    
    switch (river) {
        case "Moselle":
            queryRiverLevel("A550061001", channel);
            break;
        case "Madon":
            queryRiverLevel("A543101001", channel);
            break;
        default:
            //TODO ?
    }
     
}




fs.readFile('token', (err, data) => {
    if (err) throw err;
    let token = data.toString().trim();
    console.log(`Got token "${token}"`);
    client.login(token);
});


// Log our bot in using the token from https://discord.com/developers/applications


// URL to join the bot to a server:
// https://discord.com/api/oauth2/authorize?client_id=830348846202093579&scope=bot&permissions=3072