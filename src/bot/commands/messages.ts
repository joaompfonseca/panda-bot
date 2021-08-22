import { PandaRequest } from "../interfaces";

export const mError = {
    invalidArgs: 'Argumentos inválidos!',
    executeCmd: 'Ocorreu um erro ao executar o comando!',
    unknownCmd: 'Esse comando não existe. Pede ajuda para não passares vergonha novamente.'
};

export const mHelp: { [category: string]: { [term: string]: string } } = {
    Gerais: {
        help: 'é trivial',
        ping: 'digo pong',
        mc: 'status do servidor',
        'game [..]?, [..]?,..': 'sugiro-te um jogo'
    },
    'Panda Player': {
        join: 'dj panda ao serviço',
        'leave/disconnect': 'volto para o gabinete',
        'play [..]': 'dou-te música',
        pause: 'para kit-kat',
        resume: 'a festa continua',
        skip: 'salto para a próximo som',
        clear: 'limpo o lixo na playlist',
        queue: 'mostro o que está na playlist'
    }
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
        userNotVC: 'Como é que queres que eu entre se não estás num canal de voz?'
    },
    connectTo: {
        success: (vcId: string) => `Conectado a <#${vcId}>.`
    },
    leave: {
        botNotVC: 'Como é que queres que eu saia se não estou num canal de voz?',
        success: (vcId: string) => `Desconectado de <#${vcId}>.`
    },
    play: {
        emptyQuery: 'Nem sei o que te faço, então pedes-me para tocar nada?',
        userNotVC: 'Não me podes pedir discos antes de entrares num canal de voz!'
    },
    addToQueue: {
        notFound: 'Não encontrei nada que correspondesse ao teu pedido.',
        success: (req: PandaRequest) => `Adicionei \`${req.title}\` à playlist.`
    },
    start: {
        currentReq: (req: PandaRequest) => `Agora: \`${req.title}\`.`,
        isPaused: 'Estou em pausa!',
        emptyQueue: 'A minha playlist está vazia!',
        endedReq: (req: PandaRequest) => `Terminou: \`${req.title}\`.`
    },
    pause: {
        already: 'Eu já estou na minha pausa, não me chateies.',
        botNotVC: 'Não estou num canal de voz!',
        notPlaying: 'Não posso parar se nem sequer comecei!',
        success: 'Finalmente uma pausa, já não era sem tempo!',
        userNotVC: 'Não estás num canal de voz!'
    },
    resume: {
        already: 'Eu já estou a tocar, não me chateies.',
        botNotVC: 'Não estou num canal de voz!',
        notPlaying: 'Não posso continuar se nem sequer comecei!',
        success: 'Estou a tocar novamente!',
        userNotVC: 'Não estás num canal de voz!'
    },
    skip: {
        botNotVC: 'Não estou num canal de voz!',
        notPlaying: 'Não posso saltar sem primeiro estar a tocar!',
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
        currentReq: (req: PandaRequest) => `Agora: \`${req.title}\`.`,
        emptyQueue: 'A minha playlist está vazia!',
        nextReq: (req: PandaRequest) => `Depois: \`${req.title}\``
    }
}