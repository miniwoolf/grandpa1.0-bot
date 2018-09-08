// fs is Node's native file system module
const fs = require('fs');

const Discord = require('discord.js');

// stores key/value pairs outside of bot code
const { prefix, token } = require('./config.json');

// create a new Discord client
const client = new Discord.Client();

// allows encapsulation of commands
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    // set a new item in the Collection
    // with the key as the command name and the value as the exported module
    client.commands.set(command.name, command);
}

// enables cooldown/mandatory wait feature on commands
const cooldowns = new Discord.Collection();

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

	/* when you try to use a guildOnly command inside a DM, 
	you'll get the appropriate response which will also 
	prevent your bot from throwing an error */
	if (command.guildOnly && message.channel.type !== 'text') {
    return message.reply('I can\'t execute that command inside DMs!');
}

	// Whenever you set args to true in one of your command files, 
	// it'll perform this check and supply feedback if necessary
    if (command.args && !args.length) {
        let reply = `You didn't provide any arguments, ${message.author}!`;

        if (command.usage) {
            reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
        }

        return message.channel.send(reply);
	}

	// cooldown follow-up
	if (!cooldowns.has(command.name)) {
	    cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (!timestamps.has(message.author.id)) {
		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
	}
	else {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
		}

		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
	}

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
