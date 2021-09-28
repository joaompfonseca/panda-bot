# Changelog
All notable changes to this project will be documented in this file.

## [0.4.0] - 2021-09-28
### Added
- New `leave` command alias: `stop`.
- New player panel when song is playing with `play/pause`, `skip`, `stop` and `queue` buttons.  
- New `queue` command interface. If opened through the player panel, buttons for page navigation, refreshing and clearing will appear, but only to the user that pressed the button.
- Support for Soundcloud albums and playlists.

### Changed
- Now registering (/) commands checks for deleted commands and removes them.
- Now the default Minecraft server ip address is changed in Bot's `config` file instead of the `.env` file. 
- Now `leave` command clears queue.
- Now `queue` command accepts user given page number.
- Now adding playlists from Spotify is faster.

### Fixed
- `mc` command not correctly handing null description and samplePlayers.
- Typo in changelog.

## [0.3.3] - 2021-09-17
### Fixed
- `mc` command reporting Minecraft server as offline when no players were online.
- Asynchronous functions are now handled as such.

## [0.3.2] - 2021-09-08
### Fixed
- Bot crashing due to audio stream connection issues.

## [0.3.1] - 2021-09-07
### Fixed
- Panda Player messages being edited instead of creating a new one.  

## [0.3.0] - 2021-09-05
### Added
- Support for slash commands.
- New custom classes for better implementation of slash commands.
- New slash command configuration file and register on startup (disabled in Bot's `config` file).

### Changed
- Now Bot configuration file is named `config` instead of `bot-config`.

## [0.2.2] - 2021-09-03
### Fixed
- Spotify album and playlist adding counter.
- Link to add Bot in `info` command refers to current instance.

## [0.2.1] - 2021-09-01
### Changed
- Now `version` command is `info` command.
- Now `info` command gives more information about the Bot.

## [0.2.0] - 2021-08-31
### Added
- New `version` command.

### Changed
- Description in `README.md` and `package.json`.
- Now `mc` command accepts user given ip address, defaults to the one in `.env` if none is provided.
- Now `play` command supports Spotify tracks, albums and playlists.

## [0.1.1] - 2021-08-31
### Added
- Description to `package.json`.

### Changed
- Description in `README.md`.

### Removed
- Unused dependency from `package.json`.

### Fixed
- Minor TypeScript errors.

## [0.1.0] - 2021-08-31
### Added
- New messages for error filtering.

### Changed
- Now using youtube-scrapper and ytdl-core-discord instead of yt-search and ytdl-core.
- Now `skip` command checks for empty queue instead of player status.

### Fixed
- Error message being undefined when requesting an invalid SoundCloud track link.
- Age restricted videos not being skipped and removed from queue.

## [0.0.0] - 2021-08-29
### Added
- Author to `package.json`.
- New `CHANGELOG.md` to document all notable changes to this project.

## [0.0.0-13.1.0] - 2021-08-24
### Changed
- Now using discord.js v13.1.0 instead of discord.js v12.5.3.

## [0.0.0-12.5.3] - 2021-08-24

[0.3.3]: https://github.com/joaompfonseca/panda-bot/compare/v0.3.2...v0.3.3
[0.3.2]: https://github.com/joaompfonseca/panda-bot/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/joaompfonseca/panda-bot/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/joaompfonseca/panda-bot/compare/v0.2.2...v0.3.0
[0.2.2]: https://github.com/joaompfonseca/panda-bot/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/joaompfonseca/panda-bot/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/joaompfonseca/panda-bot/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/joaompfonseca/panda-bot/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/joaompfonseca/panda-bot/compare/v0.0.0...v0.1.0
[0.0.0]: https://github.com/joaompfonseca/panda-bot/compare/v0.0.0-13.1.0...v0.0.0
[0.0.0-13.1.0]: https://github.com/joaompfonseca/panda-bot/compare/v0.0.0-12.5.3...v0.0.0-13.1.0
[0.0.0-12.5.3]: https://github.com/joaompfonseca/panda-bot/releases/tag/v0.0.0-12.5.3