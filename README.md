# Panda Bot (discord.js-12.5.3)

## Description
Bot that can play youtube audio and soundcloud tracks over Discord voice channels.
- Written in JavaScript (node v16.6.2).
- Messages are in `Portuguese`, but can be changed [here](https://github.com/joaompfonseca/panda-bot/blob/master/src/bot/commands/messages.js) (General)
               and [here](https://github.com/joaompfonseca/panda-bot/blob/master/src/bot/voice/pandaPlayer.js) (PandaPlayer).

## Commands
- General: `help`, `ping`, `mc`, `game`
- PandaPlayer: `join`, `leave/disconnect`, `play`, `pause`, `resume`, `skip`, `clear`, `queue`

## Installation
- Run `npm install` in root to install all dependencies.

## Configuration
- Create an `.env` file in root with the keys `TOKEN=[Discord Bot Token]` and `MCSERVER=[Minecraft Server IP]`.

## Starting the Bot
- Run `node .` in root.
