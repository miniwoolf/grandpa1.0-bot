// fs is Node's native file system module
const fs = require('fs');

const Discord = require('discord.js');

// stores key/value pairs outside of bot code
const { prefix, token, responseObject } = require('./config.json');

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

// reads messages and runs addtional code when certain conditions are met
client.on('message', message => {

	// console.log("[#" + message.channel.name + "] " + message.author.username + "/" + message.member.nickname + ": " + message.content);

	// If the message either doesn't start with the prefix or 
	// was sent by a bot, exit early.
	if (/*!message.content.startsWith(prefix) || */ message.author.bot) return;

	// Creates an args variable that removes the prefix 
	// and then splits the message into an array by spaces
	const args = message.content.slice(prefix.length).split(/ +/);

	/* Creates a command variable by calling args.shift(), 
	which will take the first element in the array and return it, 
	while also removing it from the original array (so that 
	you don't have the command name string inside the args array) */
	const commandName = args.shift().toLowerCase();

	// allows use of command aliases
	const command = client.commands.get(commandName)
        || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    var regex = /(oof|yikes)\b/
	var found = message.content.match(regex);
	if (found[0] != "") {
	    message.react('487488039132856320');
	}

	console.log(found);

	// If the message isn't a real command, exit early.
	if (!command) return;

	/* when you try to use a guildOnly command inside a DM, 
	you'll get the appropriate response which will also 
	prevent your bot from throwing an error */
	if (command.guildOnly && message.channel.type !== 'text') {
    return message.reply('I can\'t execute that command inside DMs, my man');
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

	// creates variable with current timestamp
	const now = Date.now();
	// creates variable that .get()s the Collection for the triggered command
	const timestamps = cooldowns.get(command.name);
	/* creates variable that gets the cooldown time 
	(which here defaults to 3sec if left blank) then 
	converts it to the proper amount of milliseconds */
	const cooldownAmount = (command.cooldown || 3) * 1000;

	/* If the timestamps Collection doesn't have the message author's ID, 
	set it in with the current timestamp and create a setTimeout() to 
	automatically delete it later, depending on that command's cooldown number. */
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

});

// login to Discord with your app's token
client.login(token);
