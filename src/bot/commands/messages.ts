import { prefix } from '../config.js';
import { PandaRequest } from '../interfaces.js';

export const mError = {
    invalidArgs: 'Argumentos inválidos!',
    executeCmd: 'Ocorreu um erro ao executar o comando!',
    unknownCmd: 'Esse comando não existe. Pede ajuda para não passares vergonha novamente.'
};

export const mGame = [
    'CS:GO',
    'Team Fortress 2',
    'Portal 2',
    'Minecraft',
    'GTA V',
    'Xadrez'
];

export const mHelp: { [category: string]: { [term: string]: string } } = {
    Gerais: {
        'game [..]?, [..]?,..': 'sugiro-te um jogo',
        help: 'é trivial',
        info: 'informação sobre mim',
        ping: 'digo pong',
        'mc [..]?': 'status do servidor'
    },
    'Panda Player': {
        clear: 'limpo o lixo na playlist',
        join: 'dj panda ao serviço',
        'leave/disconnect/stop': 'volto para o gabinete',
        pause: 'para kit-kat',
        'play [..]': 'dou-te música',
        'queue/playlist [..]?': 'mostro o que está na playlist',
        skip: 'salto para a próximo som',
        'unpause/resume': 'a festa continua'
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

export const mPanda = {
    addToPlaylist: {
        invalidUrl: 'O link que me forneceste é inválido!',
        unavailable: 'O teu pedido encontra-se indisponível para mim.',
        success: (req: string) => `Adicionei \`${req}\` à playlist.`,
    },
    clear: {
        already: 'Não há nada para limpar!',
        botNotVC: 'Não estou num canal de voz!',
        notSameVC: 'Não estamos no mesmo canal de voz!',
        success: (num: number) => `Limpei \`${num}\` ${(num == 1) ? 'pedido' : 'pedidos'} da playlist.`,
        userNotVC: 'Não estás num canal de voz!'
    },
    collect: {

    },
    connectTo: {
        connected: (vcId: string) => `Conectado a <#${vcId}>.`,
        disconnected: (vcId: string) => `Desconectado de <#${vcId}>.`
    },
    getPlayerPanel: {
        noNextRequest: '🔇 Nada. Pede-me um som!',
        queue: {
            emoji: '📋',
            label: 'Lista'
        },
        request: (req: PandaRequest) => `🔊 ${(req.title.length > 57) ? (req.title.substring(0, 57 - 3) + '...') : (req.title + ' '.repeat(57 - req.title.length))}`,
        skip: {
            emoji: '⏭',
            label: 'Saltar'
        },
        stop: {
            emoji: '⏹',
            label: 'Parar'
        },
        toggle: {
            emoji: '⏯',
            label: 'Tocar/Pausar'
        }
    },
    getPlaylistPage: {
        clear: {
            emoji: '🧹',
            label: 'Limpar'
        },
        empty: 'A minha playlist está vazia!',
        info: (page: number, totalPages: number, totalRequests: number, totalDuration: string) => `Página ${page}/${totalPages} | ${totalRequests} ${(totalRequests == 1)? 'som' : 'sons'} | Duração total [${totalDuration}]`,
        next: {
            emoji: '▶',
            label: 'Seguinte'
        },
        previous: {
            emoji: '◀',
            label: 'Anterior'
        },
        reload: {
            emoji: '🔄',
            label: 'Atualizar'
        },
        request: (pos: number, req: PandaRequest) => `${pos}) ${(req.title.length > 56 - pos.toString().length - req.formatedDuration.length) ? (req.title.substring(0, 56 - pos.toString().length - req.formatedDuration.length - 3) + '...') : (req.title + ' '.repeat(56 - pos.toString().length - req.formatedDuration.length - req.title.length))} [${req.formatedDuration}]`
    },
    join: {
        already: (vcId: string) => `Já estou conectado a <#${vcId}>! Não tens olhos na vista?`,
        playing: (vcId: string) => `Não posso entrar no teu canal de voz porque estou a tocar um som em <#${vcId}>!`,
        userNotVC: 'Não estás num canal de voz!'
    },
    leave: {
        botNotVC: 'Não estou num canal de voz!',
        notSameVC: 'Não estamos no mesmo canal de voz!',
        userNotVC: 'Não estás num canal de voz!'
    },
    pause: {
        already: 'Eu já estou na minha pausa, não me chateies.',
        botNotVC: 'Não estou num canal de voz!',
        notPlaying: 'Não posso parar se nem sequer comecei!',
        notSameVC: 'Não estamos no mesmo canal de voz!',
        userNotVC: 'Não estás num canal de voz!'
    },
    play: {
        emptyQuery: 'Nem sei o que te faço, então pedes-me para tocar nada?',
        notSameVC: 'Não estamos no mesmo canal de voz!',
        userNotVC: 'Não estás num canal de voz!'
    },
    playlist: {

    },
    skip: {
        botNotVC: 'Não estou num canal de voz!',
        empty: 'A minha playlist está vazia!',
        notSameVC: 'Não estamos no mesmo canal de voz!',
        success: (req: PandaRequest) => `Saltei: \`${req.title}\`.`,
        userNotVC: 'Não estás num canal de voz!'
    },
    start: {
        ageRestricted: 'Este som tem uma restrição de idade!',
        empty: 'A minha playlist está vazia!',
        ended: (req: PandaRequest) => `Terminou: \`${req.title}\`.`,
        paused: 'Estou em pausa!'
    },
    stop: {
        botNotVC: 'Não estou num canal de voz!',
        notSameVC: 'Não estamos no mesmo canal de voz!',
        userNotVC: 'Não estás num canal de voz!'
    },
    unpause: {
        already: 'Eu já estou a tocar, não me chateies.',
        botNotVC: 'Não estou num canal de voz!',
        notPlaying: 'Não posso continuar se nem sequer comecei!',
        notSameVC: 'Não estamos no mesmo canal de voz!',
        userNotVC: 'Não estás num canal de voz!'
    }
}