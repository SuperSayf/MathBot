// Deconstructed the constants we need in this file.

const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

/**
 * @type {import('../../../typings').SlashInteractionCommand}
 */
module.exports = {
    // The data needed to register slash commands to Discord.

    data: new SlashCommandBuilder()
        .setName("add-points")
        .setDescription(
            "Add points to a user."
        )
        .addUserOption((option) =>
            option
                .setName("user")
                .setDescription("The user to add points to.")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("points")
                .setDescription("The amount of points to add.")
                .setRequired(true)
        ),

    async execute(interaction) {
        /**
         * @type {string}
         * @description The "user" argument
         */
        let user = interaction.options.getUser("user");
        let points = interaction.options.getString("points");

        /**
         * @type {MessageEmbed}
         * @description Help command's embed
         */
        const Embed = new MessageEmbed().setColor(0x4286f4);

        if (user) {
            console.log(user);
            console.log(points);
            Embed.setTitle(`Added ${points} points to ${user.username}`);
        } else {
            Embed.setTitle("Failed to add points.");
        }

        // Replies to the interaction!

        await interaction.reply({
            embeds: [Embed],
        });
    },
};
