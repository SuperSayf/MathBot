// Deconstructed the constants we need in this file.

const { MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const leaderboard = require("../../../schemas/leaderboard");
const { leaderboard_channel_id } = require("../../../config.json");

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
        .addIntegerOption((option) =>
            option
                .setName("points")
                .setDescription("The amount of points to add.")
                .setRequired(true)
        ).setDefaultMemberPermissions(0),

    async execute(interaction) {
        /**
         * @type {string}
         * @description The "user" argument
         */
        let user = interaction.options.getUser("user");
        let points = interaction.options.getInteger("points");

        /**
         * @type {MessageEmbed}
         * @description Help command's embed
         */
        const Embed = new MessageEmbed().setColor(0x4286f4);

        // Check if the user is in mongoDB
        const userData = await leaderboard.findOne({ id: user.id });

        if (userData === null) {
            // If the user is not in mongoDB, create a new user
            const newUser = new leaderboard({
                id: user.id,
                name: user.username,
                points: points,
            });

            await newUser.save();

            Embed.setTitle("User added!");
            Embed.setDescription(`${user.username} has been added to the leaderboard with ${points} points`);
        } else {
            // If the user is in mongoDB, add points to the user
            userData.points += points;

            await userData.save();

            Embed.setTitle("Points added!");
            Embed.setDescription(`${points} points has been added  to ${user.username}`);
        }

        const client = interaction.client;

        const leaderboardData = await leaderboard.find({});

        client.channels.cache.get(leaderboard_channel_id).messages.fetch({ limit: 10 }).then(messages => {
            if (messages.size > 0 && messages.first().author.id === client.user.id) {
                // Get the first embed in the channel
                const message = messages.first();
                // List all the users in the leaderboard and their respective points.
                const leaderboardEmbed = new MessageEmbed().setColor(0x4286f4);
                leaderboardEmbed.setTitle("🏆Leaderboard🏆");
                // Sort the leaderboard names by points.
                leaderboardData.sort((a, b) => b.points - a.points);
                leaderboardEmbed.addFields({ name: "Name", value: leaderboardData.map(user => `${user.name}`).join("\n"), inline: true }, { name: "Points", value: leaderboardData.map(user => `${user.points}`).join("\n"), inline: true });

                message.edit({ embeds: [leaderboardEmbed] });
            } else {
                // Create a new message and send it to the leaderboard channel.
                const leaderboardEmbed = new MessageEmbed().setColor(0x4286f4);
                leaderboardEmbed.setTitle("🏆Leaderboard🏆");
                // Sort the leaderboard names by points.
                leaderboardData.sort((a, b) => b.points - a.points);
                leaderboardEmbed.addFields({ name: "Name", value: leaderboardData.map(user => `${user.name}`).join("\n"), inline: true }, { name: "Points", value: leaderboardData.map(user => `${user.points}`).join("\n"), inline: true });

                client.channels.cache.get(leaderboard_channel_id).send({ embeds: [leaderboardEmbed] });
            }
        }
        );


        // Replies to the interaction!

        await interaction.reply({
            embeds: [Embed],
        });
    },
};
