import express from 'express'

export function app() {
    const app = express();

    app.get('/', (req, res) => {
        res.send('Bot is online!');
    });
    app.listen(3000, () => {
        console.log('Server is running!');
    });
}