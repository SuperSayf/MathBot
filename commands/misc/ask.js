/**
* @type {import('../../typings').LegacyCommand}
*/

const { MessageAttachment, MessageEmbed } = require("discord.js");
const WolframAlphaAPI = require('wolfram-alpha-api');
const { wolfram_key } = require("../../config.json");
const waApi = WolframAlphaAPI(wolfram_key);

module.exports = {
    name: "ask",
    // Refer to typings.d.ts for available properties.

    execute(message, args) {

        // Get the question from the args
        let question = args.join(" ");

        // Using the getImage function, get the image of the answer.
        waApi.getSimple(question).then((url) => {
            // Extract the base64 string from the url
            const sfbuff = new Buffer.from(url.split(",")[1], 'base64');

            // Find the image file and send it
            const imageAttachment = new MessageAttachment(sfbuff, 'image.png');

            const Embed = new MessageEmbed()
                .setTitle(`${question}`)
                .setColor(0x4286f4)
                .setImage(`attachment://image.png`)
                .setTimestamp()
                .setFooter({ text: message.author.username, iconURL: message.author.avatarURL() });


            message.channel.send({
                embeds: [Embed],
                files: [imageAttachment]
            });

            // If the promise fails, log the error
        }).catch((error) => {
            const Embed = new MessageEmbed()
                .setTitle(`${question}`)
                .setDescription(`${error}`)
                .setColor(0x4286f4)
                .setTimestamp()
                .setFooter({ text: message.author.username, iconURL: message.author.avatarURL() });


            message.channel.send({
                embeds: [Embed],
            });
        })

    },
};