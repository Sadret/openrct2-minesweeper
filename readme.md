# OpenRCT2 Minesweeper

An OpenRCT2 plug-in to play Minesweeper within RCT.

## Installation

1. Make sure that your OpenRCT2 version is up-to-date. You need at least version `0.3.3` or a recent development version.
2. Go to the [releases](https://github.com/Sadret/openrct2-minesweeper/releases) page and download the `minesweeper-1.0.0.js` file from the latest release. Save it in the `plugin` subfolder of your OpenRCT2 user directory.\
On Windows, this is usually at `C:Users\{User}\Documents\OpenRCT2\plugin`.
3. Start OpenRCT2 and open a scenario. The plug-in can be found in the map menu in the upper toolbar of OpenRCT2.

## Rules and Gameplay

The game consists of a rectangular grid of covered square fields. Under each square, there is either a mine, or a number that indicates the amount of mines in the surrounding 8 squares.\
The goal is to find the position of all mines without letting any of them explode.

Click once on a covered field to flag it as containing a mine. Click once again to open the field and reveal what is under it.\
For faster gameplay, if you click on a number that is surrounded by the corresponding number of flags, all remaining covered neighbours will be opened.

If you open a field that contains a mine, it will explode. Then, the game is over and you lose. The game is won, when you have opened all fields that do not contain a mine. (Note that it is not neccessary to flag all mines.)

## Settings

Grid sizes: Tiny, Small, Medium, Large and Huge.\
Difficulties: Beginner, Advanced and Expert.

The number of mines that are placed in the grid is affected by both the grid size and the difficulty.

## User Interface

Above the game grid, there are five additional elements:
- The number of mines that are left in the field and not marked yet. (This number will go down for each flag you place, even if you did a mistake and it has no mine under it.)
- The Settings button: Opens the Settings window, where you can choose the size and difficulty of the game.
- The New Game button: Click it to restart the game.
- The Highscores button: Opens the Highscores window, where you can find the fastest times and other statistics about your games.
- The time since the beginning of the game. The timer starts when you first click a square and stops when you open a mine or win the game.

## Planned Features

- Whatever you propose.

Subscribe to my YouTube channel to learn about upcoming features:
[Sadret Gaming](https://www.youtube.com/channel/UCLF2DGVDbo_Od5K4MeGNTRQ/)

## Support Me

If you find any bugs or if you have any ideas for improvements, you can open an issue on GitHub or contact me on Discord: Sadret#2502.

If you like this plug-in, please leave a star on GitHub.

If you really want to support me, you can [buy me a coffee](https://www.BuyMeACoffee.com/SadretGaming).

## Copyright and License

Copyright (c) 2021 Sadret\
The OpenRCT2 plug-in "Minesweeper" is licensed under the GNU General Public License version 3.
