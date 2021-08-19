export const mError = {
    invalidArgs: 'Argumentos inválidos!',
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