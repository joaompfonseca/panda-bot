import { Playlist as Youtube_Playlist } from 'youtube-scrapper';
import { prefix } from '../config.js';
import { PandaRequest } from '../interfaces.js';

export const mError = {
    invalidArgs: 'Argumentos inválidos!',
    executeCmd: 'Ocorreu um erro ao executar o comando!',
    unknownCmd: 'Esse comando não existe. Pede ajuda para não passares vergonha novamente.'
};

export const mHelp: { [category: string]: { [term: string]: string } } = {
    Gerais: {
        help: 'é trivial',
        info: 'informação sobre mim',
        ping: 'digo pong',
        'mc [..]?': 'status do servidor',
        'game [..]?, [..]?,..': 'sugiro-te um jogo'
    },
    'Panda Player': {
        join: 'dj panda ao serviço',
        'leave/disconnect': 'volto para o gabinete',
        'play [..]': 'dou-te música',
        pause: 'para kit-kat',
        'unpause/resume': 'a festa continua',
        skip: 'salto para a próximo som',
        clear: 'limpo o lixo na playlist',
        queue: 'mostro o que está na playlist'
    }
};

export const mInfo = {
    title: 'Sobre mim',
    description: (clientId: string, ver: string) => `
        Para veres os comandos no cardápio, digita \`${prefix}help\`
        [Adiciona-me](https://discord.com/api/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands)
        [Changelog](https://github.com/joaompfonseca/panda-bot/blob/master/CHANGELOG.md)
        [Repositório](https://github.com/joaompfonseca/panda-bot)
        Versão atual - ${ver}`
};

export const mPing = {
    pinging: 'Pinging...',
    done: (ping: number) => `Pong! ${ping} ms`
};

export const mGame = [
    'CS:GO',
    'Team Fortress 2',
    'Portal 2',
    'Minecraft',
    'GTA V',
    'Xadrez'
];

export const mPanda = {
    join: {
        already: (vcId: string) => `Já estou conectado a <#${vcId}>! Não tens olhos na vista?`,
        paused: 'Estou em pausa!',
        userNotVC: 'Como é que queres que eu entre se não estás num canal de voz?'
    },
    connectTo: {
        connected: (vcId: string) => `Conectado a <#${vcId}>.`,
        disconnected: (vcId: string) => `Desconectado de <#${vcId}>.`
    },
    leave: {
        botNotVC: 'Como é que queres que eu saia se não estou num canal de voz?'
    },
    play: {
        emptyQuery: 'Nem sei o que te faço, então pedes-me para tocar nada?',
        userNotVC: 'Não me podes pedir discos antes de entrares num canal de voz!'
    },
    addToQueue: {
        invalidUrl: 'O link que me forneceste é inválido!',
        progress: (num: number) => `Estou a adicionar estes sons à playlist... \`${num}\` ${(num == 1) ? 'restante' : 'restantes'}.`,
        unavailable: 'O teu pedido encontra-se indisponível para mim.',
        success: (req: PandaRequest | Youtube_Playlist) => `Adicionei \`${req.title}\` à playlist.`,
        successNum: (num: number) => `Adicionei \`${num}\` ${(num == 1) ? 'som' : 'sons'} à playlist.`
    },
    start: {
        ageRestricted: 'Este som tem uma restrição de idade!',
        empty: 'A minha playlist está vazia!',
        ended: (req: PandaRequest) => `Terminou: \`${req.title}\`.`,
        paused: 'Estou em pausa!',
        playing: (req: PandaRequest) => `Agora: \`${req.title}\`.`,
        skipped: (req: PandaRequest) => `Saltei: \`${req.title}\`.`
    },
    pause: {
        already: 'Eu já estou na minha pausa, não me chateies.',
        botNotVC: 'Não estou num canal de voz!',
        notPlaying: 'Não posso parar se nem sequer comecei!',
        userNotVC: 'Não estás num canal de voz!'
    },
    resume: {
        already: 'Eu já estou a tocar, não me chateies.',
        botNotVC: 'Não estou num canal de voz!',
        notPlaying: 'Não posso continuar se nem sequer comecei!',
        userNotVC: 'Não estás num canal de voz!'
    },
    skip: {
        botNotVC: 'Não estou num canal de voz!',
        empty: 'A minha playlist está vazia!',
        success: (req: PandaRequest) => `Saltei: \`${req.title}\`.`,
        userNotVC: 'Não estás num canal de voz!'
    },
    clear: {
        already: 'Não há nada para limpar!',
        botNotVC: 'Não estou num canal de voz!',
        success: (num: number) => `Limpei \`${num}\` ${(num == 1) ? 'pedido' : 'pedidos'} da playlist.`,
        userNotVC: 'Não estás num canal de voz!'
    },
    getQueue: {
        closed: 'Interface da playlist fechada por inatividade.',
        empty: 'A minha playlist está vazia!'
    },
    getQueuePage: {
        button: {
            clear: '🧹',
            next: '▶',
            prev: '◀',
            reload: '⭮'
        },
        empty: 'A minha playlist está vazia!',
        pageCounter: (current: number, total: number) => `Página ${current}/${total}`,
        request: (req: PandaRequest, pos: number) => `${pos + 1}) ${req.title}`
    }
}