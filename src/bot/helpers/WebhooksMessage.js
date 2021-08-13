const Discord = require('discord.js');





module.exports = class WebhooksMessage {

    /**
     * 
     * @param {Discord.Interaction} interaction 
     */
    constructor(interaction) {
        this.interaction = interaction;
    }

}

/*  let disGuild = await client.guilds.fetch(interaction.guild_id);
    let chat = {
        reply: true,
        newMsgDel: false,
        send: async msg => {
            if (chat.reply) {
                let url = `https://discord.com/api/v8/interactions/${interaction.id}/${interaction.token}/callback`;
                let json = { type: 4, data: { content: msg } };
                if (msg instanceof Discord.MessageEmbed)
                    json.data = { embeds: [msg] };

                r = await axios.post(url, json = json);

                chat.reply = false;
                chat.newMsgDel = true;
                let newMsg = {
                    createdTimestamp: Date.now(),
                    delete: () => {
                        return
                        //let url = `https://discord.com/api/v8/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`;
                        //axios.delete(url);
                    }
                };
                return newMsg;
            }
            if (chat.newMsgDel) {
                let url = `https://discord.com/api/v8/webhooks/${interaction.application_id}/${interaction.token}/messages/@original`;
                let json = { content: msg };
                axios.patch(url, json = json);
                return;
            }
            return disGuild.channels.cache.get(interaction.channel_id).send(msg);
        }
    }
    let userVState = disGuild.voiceStates.cache.get(interaction.member.user.id);
    let userVC = null;
    if (userVState != undefined) {
        let userVCID = userVState.channelID;
        userVC = disGuild.channels.cache.get(userVCID);
    }
    let msg = {
        createdTimestamp: Date.now(),
        channel: chat,
        member: {
            voice: {
                channel: userVC
            }
        }
    }*/