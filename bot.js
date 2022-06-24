// Declare constants which will be used throughout the bot.

const fs = require("fs");
const { Client, Collection, Intents, MessageEmbed } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { token, client_id, test_guild_id } = require("./config.json");
const { leaderboard_channel_id } = require("./config.json");
const leaderboard = require("./schemas/leaderboard");

/**
 * From v13, specifying the intents is compulsory.
 * @type {import('./typings').Client}
 * @description Main Application Client */

// @ts-ignore
const client = new Client({
	// Please add all intents you need, more detailed information @ https://ziad87.net/intents/
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

/**********************************************************************/
// Below we will be making an event handler!

/**
 * @description All event files of the event handler.
 * @type {String[]}
 */

const eventFiles = fs
	.readdirSync("./events")
	.filter((file) => file.endsWith(".js"));

// Loop through all files and execute the event when it is actually emmited.
for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client));
	} else {
		client.on(
			event.name,
			async (...args) => await event.execute(...args, client)
		);
	}
}

/**********************************************************************/
// Define Collection of Commands, Slash Commands and cooldowns

client.commands = new Collection();
client.slashCommands = new Collection();
client.buttonCommands = new Collection();
client.selectCommands = new Collection();
client.contextCommands = new Collection();
client.modalCommands = new Collection();
client.cooldowns = new Collection();
client.triggers = new Collection();

// MongoDB connection
require("./mongo.js")();

/**********************************************************************/
// Registration of Message-Based Legacy Commands.

/**
 * @type {String[]}
 * @description All command categories aka folders.
 */

const commandFolders = fs.readdirSync("./commands");

// Loop through all files and store commands in commands collection.

for (const folder of commandFolders) {
	const commandFiles = fs
		.readdirSync(`./commands/${folder}`)
		.filter((file) => file.endsWith(".js"));
	for (const file of commandFiles) {
		const command = require(`./commands/${folder}/${file}`);
		client.commands.set(command.name, command);
	}
}

/**********************************************************************/
// Registration of Slash-Command Interactions.

/**
 * @type {String[]}
 * @description All slash commands.
 */

const slashCommands = fs.readdirSync("./interactions/slash");

// Loop through all files and store slash-commands in slashCommands collection.

for (const module of slashCommands) {
	const commandFiles = fs
		.readdirSync(`./interactions/slash/${module}`)
		.filter((file) => file.endsWith(".js"));

	for (const commandFile of commandFiles) {
		const command = require(`./interactions/slash/${module}/${commandFile}`);
		client.slashCommands.set(command.data.name, command);
	}
}

/**********************************************************************/
// Registration of Context-Menu Interactions

/**
 * @type {String[]}
 * @description All Context Menu commands.
 */

const contextMenus = fs.readdirSync("./interactions/context-menus");

// Loop through all files and store context-menus in contextMenus collection.

for (const folder of contextMenus) {
	const files = fs
		.readdirSync(`./interactions/context-menus/${folder}`)
		.filter((file) => file.endsWith(".js"));
	for (const file of files) {
		const menu = require(`./interactions/context-menus/${folder}/${file}`);
		const keyName = `${folder.toUpperCase()} ${menu.data.name}`;
		client.contextCommands.set(keyName, menu);
	}
}

/**********************************************************************/
// Registration of Button-Command Interactions.

/**
 * @type {String[]}
 * @description All button commands.
 */

const buttonCommands = fs.readdirSync("./interactions/buttons");

// Loop through all files and store button-commands in buttonCommands collection.

for (const module of buttonCommands) {
	const commandFiles = fs
		.readdirSync(`./interactions/buttons/${module}`)
		.filter((file) => file.endsWith(".js"));

	for (const commandFile of commandFiles) {
		const command = require(`./interactions/buttons/${module}/${commandFile}`);
		client.buttonCommands.set(command.id, command);
	}
}

/**********************************************************************/
// Registration of Modal-Command Interactions.

/**
 * @type {String[]}
 * @description All modal commands.
 */

const modalCommands = fs.readdirSync("./interactions/modals");

// Loop through all files and store modal-commands in modalCommands collection.

for (const module of modalCommands) {
	const commandFiles = fs
		.readdirSync(`./interactions/modals/${module}`)
		.filter((file) => file.endsWith(".js"));

	for (const commandFile of commandFiles) {
		const command = require(`./interactions/modals/${module}/${commandFile}`);
		client.modalCommands.set(command.id, command);
	}
}

/**********************************************************************/
// Registration of select-menus Interactions

/**
 * @type {String[]}
 * @description All Select Menu commands.
 */

const selectMenus = fs.readdirSync("./interactions/select-menus");

// Loop through all files and store select-menus in selectMenus collection.

for (const module of selectMenus) {
	const commandFiles = fs
		.readdirSync(`./interactions/select-menus/${module}`)
		.filter((file) => file.endsWith(".js"));
	for (const commandFile of commandFiles) {
		const command = require(`./interactions/select-menus/${module}/${commandFile}`);
		client.selectCommands.set(command.id, command);
	}
}

/**********************************************************************/
// Registration of Slash-Commands in Discord API

const rest = new REST({ version: "9" }).setToken(token);

const commandJsonData = [
	...Array.from(client.slashCommands.values()).map((c) => c.data.toJSON()),
	...Array.from(client.contextCommands.values()).map((c) => c.data),
];

(async () => {
	try {
		console.log("Started refreshing application (/) commands.");

		await rest.put(
			/**
			 * By default, you will be using guild commands during development.
			 * Once you are done and ready to use global commands (which have 1 hour cache time),
			 * 1. Please uncomment the below (commented) line to deploy global commands.
			 * 2. Please comment the below (uncommented) line (for guild commands).
			 */

			Routes.applicationGuildCommands(client_id, test_guild_id),

			/**
			 * Good advice for global commands, you need to execute them only once to update
			 * your commands to the Discord API. Please comment it again after running the bot once
			 * to ensure they don't get re-deployed on the next restart.
			 */

			// Routes.applicationGuildCommands(client_id)

			{ body: commandJsonData }
		);

		console.log("Successfully reloaded application (/) commands.");
	} catch (error) {
		console.error(error);
	}
})();

/**********************************************************************/
// Registration of Message Based Chat Triggers

/**
 * @type {String[]}
 * @description All trigger categories aka folders.
 */

const triggerFolders = fs.readdirSync("./triggers");

// Loop through all files and store triggers in triggers collection.

for (const folder of triggerFolders) {
	const triggerFiles = fs
		.readdirSync(`./triggers/${folder}`)
		.filter((file) => file.endsWith(".js"));
	for (const file of triggerFiles) {
		const trigger = require(`./triggers/${folder}/${file}`);
		client.triggers.set(trigger.name, trigger);
	}
}

// Set the leaderboard channel.

client.on('ready', client => {
	client.channels.cache.get(leaderboard_channel_id).messages.fetch({ limit: 10 }).then(messages => {
		if (messages.size > 0 && messages.first().author.id === client.user.id) {
			(async () => {
				try {
					const leaderboardData = await leaderboard.find({});

					if (leaderboardData.length > 0) {
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
						// Get the first embed in the channel
						const message = messages.first();
						// List all the users in the leaderboard and their respective points.
						const leaderboardEmbed = new MessageEmbed().setColor(0x4286f4);
						leaderboardEmbed.setTitle("🏆Leaderboard🏆");
						// Sort the leaderboard by points
						leaderboardEmbed.setDescription("No users have been added to the leaderboard yet.");

						message.edit({ embeds: [leaderboardEmbed] });
					}

				} catch (error) {
					console.error(error);
				}
			})();
		} else {
			(async () => {
				const leaderboardData = await leaderboard.find({});

				if (leaderboardData.length > 0) {
					// Create a new message and send it to the leaderboard channel.
					const leaderboardEmbed = new MessageEmbed().setColor(0x4286f4);
					leaderboardEmbed.setTitle("🏆Leaderboard🏆");
					// Sort the leaderboard names by points.
					leaderboardData.sort((a, b) => b.points - a.points);
					leaderboardEmbed.addFields({ name: "Name", value: leaderboardData.map(user => `${user.name}`).join("\n"), inline: true }, { name: "Points", value: leaderboardData.map(user => `${user.points}`).join("\n"), inline: true });

					client.channels.cache.get(leaderboard_channel_id).send({ embeds: [leaderboardEmbed] });
				} else {
					// Create a new message and send it to the leaderboard channel.
					const leaderboardEmbed = new MessageEmbed().setColor(0x4286f4);
					leaderboardEmbed.setTitle("🏆Leaderboard🏆");
					// Sort the leaderboard by points
					leaderboardEmbed.setDescription("No users have been added to the leaderboard yet.");

					client.channels.cache.get(leaderboard_channel_id).send({ embeds: [leaderboardEmbed] });
				}
			})();
		}
	}
	);
})

// Login into your client application with bot's token.

client.login(token);

