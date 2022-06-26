// Deconstructed the constants we need in this file.

const { MessageEmbed, MessageAttachment } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const WolframAlphaAPI = require('wolfram-alpha-api');
const { wolfram_key } = require("../../../config.json");
const waApi = WolframAlphaAPI(wolfram_key);

/**
 * @type {import('../../../typings').SlashInteractionCommand}
 */
module.exports = {
    // The data needed to register slash commands to Discord.

    data: new SlashCommandBuilder()
        .setName("ask")
        .setDescription(
            "Ask the bot anything, and it will respond."
        )
        .addStringOption((option) =>
            option
                .setName("question")
                .setDescription("The specific question you want the bot to answer.")
                .setRequired(true)
        ),

    async execute(interaction) {
        /**
         * @type {string}
         * @description The "command" argument
         */
        let question = interaction.options.getString("question");

        /**
         * @type {MessageEmbed}
         * @description Help command's embed
         */

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
                .setFooter({ text: interaction.user.username, iconURL: interaction.user.avatarURL() });


            interaction.reply({
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
                .setFooter({ text: interaction.user.username, iconURL: interaction.user.avatarURL() });


            interaction.reply({
                embeds: [Embed],
            });
        })

    },
};
