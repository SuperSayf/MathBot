/**
 * @type {import('../../../typings').ButtonInteractionCommand}
 */

const leaderboard = require("../../../schemas/leaderboard");
const { leaderboard_channel_id } = require("../../../config.json");
const { MessageEmbed } = require("discord.js");

module.exports = {
    id: "Approval_2",

    async execute(interaction) {

        const client = interaction.client;

        // Access the embed of the message
        const embed = interaction.message.embeds[0];

        // Get the user's id from the embed, take only numbers
        let userId = embed.description.match(/\d+/g).join("");
        //Get the user details from the userId
        const user = client.users.cache.get(userId);

        const points = 2;

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
        } else {
            // If the user is in mongoDB, add points to the user
            userData.points += points;

            await userData.save();
        }

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

        // Delete the message
        await interaction.message.delete();

        return;
    },
};
