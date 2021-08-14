exports.helpJson = {
    data: {
        'Gerais': {
            'help': 'é trivial',
            'ping': 'digo pong',
            'mc': 'status do servidor',
            'game ?[...],[...]': 'sugiro-te um jogo'
        },
        'Panda Player': {
            'join': 'dj panda ao serviço',
            'leave/disconnect': 'volto para o gabinete',
            'play [...]': 'dou-te música',
            'pause': 'para kit-kat',
            'resume': 'a festa continua',
            'skip': 'salto para a próximo som',
            'clear': 'limpo o lixo na playlist',
            'queue': 'mostro o que está na playlist'
        }
    }
}

exports.pingJson = {
    pinging: 'Pinging...',
    done: (ping) => `Pong! ${ping} ms`
}

exports.gameJson = {
    data: [
        'CS:GO',
        'Team Fortress 2',
        'Portal 2',
        'Minecraft',
        'GTA V',
        'Xadrez'
    ],
    error: {
        invalidArguments: 'Argumentos inválidos!'
    }
}

exports.invalidJson = 'Esse comando não existe. Pede ajuda para não passares vergonha novamente.';