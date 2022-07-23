/**
 * @type {import('../../../typings').ButtonInteractionCommand}
 */

module.exports = {
    id: "DE",

    async execute(interaction) {

        let outmsg = "Failed to add role!";

        // Get the member from the interaction
        const user = interaction.member;

        // Give the stats role to the user if he doesn't have it
        if (!user.roles.cache.has("994662342602281011")) {
            user.roles.add("994662342602281011");
            outmsg = "Added role!";
        } else {
            user.roles.remove("994662342602281011");
            outmsg = "Removed role!";
        }

        // Reply to the interaction with a message
        return interaction.reply({
            content: outmsg,
            ephemeral: true
        })
    },
};
