module.exports = {
    name: 'echo',
    description: 'Echo bot will echo for you!',
    aliases: ['echo?', 'echo!'],
    execute(message) {
        message.channel.send('echo!');
    },
};