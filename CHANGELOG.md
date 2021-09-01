# Changelog
All notable changes to this project will be documented in this file.

## [0.2.1] - 2021-09-01
### Changed
- Now `version` command is `info` command.
- Now `info` command gives more information about the Bot.

## [0.2.0] - 2021-08-31
### Added
- New `version` command.

### Changed
- Description in `README.md` and `package.json`.
- Now `game` command accepts user given ip address, defaults to the one in `.env` if none is provided.
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

[0.2.1]: https://github.com/joaompfonseca/panda-bot/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/joaompfonseca/panda-bot/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/joaompfonseca/panda-bot/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/joaompfonseca/panda-bot/compare/v0.0.0...v0.1.0
[0.0.0]: https://github.com/joaompfonseca/panda-bot/compare/v0.0.0-13.1.0...v0.0.0
[0.0.0-13.1.0]: https://github.com/joaompfonseca/panda-bot/compare/v0.0.0-12.5.3...v0.0.0-13.1.0
[0.0.0-12.5.3]: https://github.com/joaompfonseca/panda-bot/releases/tag/v0.0.0-12.5.3