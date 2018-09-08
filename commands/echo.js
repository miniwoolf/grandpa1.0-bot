module.exports = {
    name: 'echo',
    description: 'echo!',
    execute(message) {
        message.channel.send('echo!');
    },
};
