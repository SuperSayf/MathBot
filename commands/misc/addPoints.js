// Deconstructing prefix from config file to use in help command
const { prefix } = require("./../../config.json");

// Deconstructing MessageEmbed to create embeds within this command
const { MessageEmbed } = require("discord.js");

/**
 * @type {import('../../typings').LegacyCommand}
 */
module.exports = {
    name: "addPoints",
    description: "Add points to a user.",
    aliases: ["user"],
    usage: "[@ the user] [amount of points]",
    cooldown: 5,

    execute(message, args) {
        const { commands } = message.client;

        // If there are no args, it means it needs whole help command.

        if (!args.length) {
            /**
             * @type {MessageEmbed}
             * @description Help command embed object
             */

            let helpEmbed = new MessageEmbed()
                .setColor(0x4286f4)
                .setURL(process.env.URL)
                .setTitle("List of all my commands")
                .setDescription(
                    "`" + commands.map((command) => command.name).join("`, `") + "`"
                )

                .addField(
                    "Usage",
                    `\nYou can send \`${prefix}help [command name]\` to get info on a specific command!`
                );
        }

        // If argument is provided, check if it's a command.

        /**
         * @type {String}
         * @description First argument in lower case
         */

        const name = args[0].toLowerCase();

        const command =
            commands.get(name) ||
            commands.find((c) => c.aliases && c.aliases.includes(name));

        // If it's an invalid command.

        if (!command) {
            return message.reply({ content: "That's not a valid command!" });
        }

        /**
         * @type {MessageEmbed}
         * @description Embed of Help command for a specific command.
         */

        let commandEmbed = new MessageEmbed()
            .setColor(0x4286f4)
            .setTitle("Command Help");

        if (command.description)
            commandEmbed.setDescription(`${command.description}`);

        if (command.aliases)
            commandEmbed
                .addField("Aliases", `\`${command.aliases.join(", ")}\``, true)
                .addField("Cooldown", `${command.cooldown || 3} second(s)`, true);
        if (command.usage)
            commandEmbed.addField(
                "Usage",
                `\`${prefix}${command.name} ${command.usage}\``,
                true
            );

        // Finally send the embed.

        message.channel.send({ embeds: [commandEmbed] });
    },
};
