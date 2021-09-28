# Panda Bot (discord.js v13.1.0)

## Description
Bot that can play audio from SoundCloud, Spotify and Youtube over Discord voice channels.
- Written in TypeScript (node v16.6.1).

## Commands
- General: `game`, `help`, `info`, `ping`, `mc` 
- PandaPlayer: `clear`, `join`, `leave/disconnect/stop`, `pause`, `play`,  `queue/playlist`, `skip`, `unpause/resume`

## Installation
- Run `npm install` in root to install all dependencies.

## Configuration
- Create an `.env` file in root with the key `TOKEN=[Discord Bot Token]`.
- Change bot configurations [here](https://github.com/joaompfonseca/panda-bot/blob/master/src/bot/config.ts).
- Change bot slash commands [here](https://github.com/joaompfonseca/panda-bot/blob/master/src/bot/slash/config.ts).
- Messages are in `Portuguese`, but can be changed [here](https://github.com/joaompfonseca/panda-bot/blob/master/src/bot/commands/messages.ts).

## Starting the Bot
- Run `npm start` in root.
