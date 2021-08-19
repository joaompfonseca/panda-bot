import express from 'express'

/**
 * Initializes the server.
 * @returns 
 */
export function app(): void {
    const app = express();

    app.get('/', (req, res) => {
        res.send('Bot is online!');
    });
    app.listen(3000, () => {
        console.log('Server is running!');
    });

    return;
}