# Panda Bot (discord.js-12.5.3)

## Description
Bot that can play youtube audio and soundcloud tracks over Discord voice channels.
- Written in JavaScript.
- Messages are in `Portuguese`, but can be changed [here (General)](https://github.com/joaompfonseca/panda-bot/blob/master/src/bot/commands/messages.js) 
               and [here (PandaPlayer)](https://github.com/joaompfonseca/panda-bot/blob/master/src/bot/voice/pandaPlayer.js).

## Commands
- General: `help`, `ping`, `mc`, `game`
- PandaPlayer: `join`, `leave/disconnect`, `play`, `pause`, `resume`, `skip`, `clear`, `queue`

## Installation
- Run `npm install` in root to install all dependencies.

## Configuration
- Create an `.env` file in root with the keys `TOKEN=[Discord Bot Token]` and `MCSERVER=[Minecraft Server IP]`.

## Starting the Bot
- Run `node .` in root.
