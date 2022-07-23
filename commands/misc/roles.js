/**
 * @type {import('../../typings').LegacyCommand}
 */

const { Client, Collection, Intents, MessageEmbed, MessageButton, MessageActionRow, MessageComponent } = require("discord.js");

module.exports = {
    name: "roles",
    // Refer to typings.d.ts for available properties.

    execute(message, args) {

        const roleEmbed = new MessageEmbed().setColor(0x4286f4);

        roleEmbed.setTitle("🎖️ Roles: DE or Stats? 🎖️");

        roleEmbed.setDescription("Indicate whether you are doing Statistics (📊) or Differential Equations (⚔️) this semester. This will give you access to the relevant channels for those subjects");

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setStyle("PRIMARY")
                    .setCustomId("Stats")
                    .setLabel("Stats")
                    .setEmoji("📊"),
            )
            .addComponents(
                new MessageButton()
                    .setStyle("PRIMARY")
                    .setCustomId("DE")
                    .setLabel("DE")
                    .setEmoji("⚔️"),
            )

        message.channel.send({ embeds: [roleEmbed], components: [row] });

    },
};
