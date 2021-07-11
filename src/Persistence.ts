/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Minesweeper" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

function getKey(size: number, difficulty: number): string {
    return "minesweeper.size_" + size + ".difficulty_" + difficulty;
}

export default class Persistence {
    static getHighscore(size: number, difficulty: number): Highscore {
        const highscore = context.sharedStorage.get<Highscore>(getKey(size, difficulty));
        return highscore || {
            bestTime: Number.MAX_VALUE,
            totalTime: 0,
            games: 0,
            won: 0,
            lost: 0,
        };
    }

    private static setHighscore(size: number, difficulty: number, highscore: Highscore) {
        context.sharedStorage.set<Highscore>(getKey(size, difficulty), highscore);
    }

    static startGame(size: number, difficulty: number) {
        const hs = this.getHighscore(size, difficulty);
        hs.games++;
        this.setHighscore(size, difficulty, hs);
    }

    static endGame(size: number, difficulty: number, won: boolean, time: number) {
        const hs = this.getHighscore(size, difficulty);
        if (won) {
            if (time < hs.bestTime)
                hs.bestTime = time;
            hs.totalTime += time;
            hs.won++;
        } else
            hs.lost++;
        this.setHighscore(size, difficulty, hs);
    }
}
