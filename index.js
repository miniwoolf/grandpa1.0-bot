// fs is Node's native file system module
const fs = require('fs');

const Discord = require('discord.js');

// stores key/value pairs outside of bot code
const { prefix, token } = require('./config.json');

// create a new Discord client
const client = new Discord.Client();

// allows use of commands in a separate folder
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    // set a new item in the Collection
    // with the key as the command name and the value as the exported module
    client.commands.set(command.name, command);
}

// when the client is ready, run this code
// this event will trigger whenever your bot:
// - finishes logging in
// - reconnects after disconnecting
client.on('ready', () => {
    console.log('Ready!');
});

// reads messages
client.on('message', message => {

	// If the message either doesn't start with the prefix or 
	// was sent by a bot, exit early.
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	// Create an args variable that slices off 
	// the prefix entirely and then splits it into an array by spaces
	const args = message.content.slice(prefix.length).split(/ +/);

	/* Create a command variable by calling args.shift(), 
	which will take the first element in array and return it 
	while also removing it from the original array (so that 
	you don't have the command name string inside the args array) */
	const commandName = args.shift().toLowerCase();

	if (!client.commands.has(commandName)) return;

	const command = client.commands.get(commandName);

	try {
	    command.execute(message, args);
	}
	catch (error) {
	    console.error(error);
	    message.reply('there was an error trying to execute that command!');
	}

    //console.log("[#" + message.channel.name + "] " + message.author.username + "/" + message.member.nickname + ": " + message.content);
    //console.log(message.content);
});

// login to Discord with your app's token
client.login(token);
