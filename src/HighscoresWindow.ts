/*****************************************************************************
 * Copyright (c) 2021 Sadret
 *
 * The OpenRCT2 plug-in "Minesweeper" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import Modes from "./Modes";
import Persistence from "./Persistence";

function formatTime(t: number): string {
    t = Math.floor(t / 1000);
    return `${Math.floor(t / 60)}:${t % 60}`;
}

export default class HighscoresWindow {
    constructor() {
        const width = 512;
        const height = 358;

        const widgets: Widget[] = [];

        ["Best", "Mean", "Games", "Won", "Lost", "Resigned"].forEach((label, idx) =>
            widgets.push({
                type: "label",
                x: 113 + idx * 66,
                y: 20,
                height: 12,
                width: 64,
                text: "{BLACK}" + label,
            })
        );

        Modes.sizes.forEach((size, i) => {
            widgets.push({
                type: "label",
                x: 5,
                y: 36 + i * 64,
                height: 12,
                width: 106,
                text: "{BLACK}" + size,
            })
            Modes.difficulties.forEach((difficulty, j) => {
                widgets.push({
                    type: "label",
                    x: 5,
                    y: 52 + i * 64 + j * 16,
                    height: 12,
                    width: 106,
                    text: " - " + difficulty,
                });

                const hs = Persistence.getHighscore(i, j);
                [
                    hs.won === 0 ? "-" : formatTime(hs.bestTime),
                    hs.won === 0 ? "-" : formatTime(hs.totalTime / hs.won),
                    hs.games === 0 ? "-" : String(hs.games),
                    hs.games === 0 ? "-" : `${hs.won} (${Math.round(hs.won / hs.games * 100)}%)`,
                    hs.games === 0 ? "-" : `${hs.lost} (${Math.round(hs.lost / hs.games * 100)}%)`,
                    hs.games === 0 ? "-" : `${hs.games - hs.won - hs.lost} (${Math.round((hs.games - hs.won - hs.lost) / hs.games * 100)}%)`,
                ].forEach((label, idx) =>
                    widgets.push({
                        type: "label",
                        x: 113 + idx * 66,
                        y: 52 + i * 64 + j * 16,
                        height: 12,
                        width: 64,
                        text: label,
                    })
                );
            });
        });

        return ui.openWindow({
            classification: "minesweeper-highscores",
            width: width,
            height: height,
            x: (ui.width - width) / 2,
            y: (ui.height - height) / 2,
            title: "Minesweeper - Highscores",
            widgets: widgets,
        });
    }
}
