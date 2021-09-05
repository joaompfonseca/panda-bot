import { ApplicationCommandData } from "discord.js";

export const commands: ApplicationCommandData[] = [
    /* General */
    {
        name: 'help',
        description: 'é trivial'
    },
    {
        name: 'info',
        description: 'informação sobre mim'
    },
    {
        name: 'ping',
        description: 'digo pong'
    },
    {
        name: 'mc',
        description: 'status do servidor',
        options: [{
            name: 'ip',
            description: 'ip de um servidor diferente',
            type: 'STRING',
            required: false
        }]
    },
    {
        name: 'game',
        description: 'sugiro-te um jogo',
        options: [{
            name: 'jogos',
            description: 'diz-me os teus jogos (separados por vírgulas)',
            type: 'STRING',
            required: false
        }]
    },
    /* Panda Player */
    {
        name: 'join',
        description: 'dj panda ao serviço'
    },
    {
        name: 'leave',
        description: 'volto para o gabinete'
    },
    {
        name: 'play',
        description: 'dou-te música',
        options: [{
            name: 'som',
            description: 'nome ou url',
            type: 'STRING',
            required: true
        }]
    },
    {
        name: 'pause',
        description: 'para kit-kat'
    },
    {
        name: 'unpause',
        description: 'a festa continua'
    },
    {
        name: 'skip',
        description: 'salto para a próximo som'
    },
    {
        name: 'clear',
        description: 'limpo o lixo na playlist'
    },
    {
        name: 'queue',
        description: 'mostro o que está na playlist'
    }
];