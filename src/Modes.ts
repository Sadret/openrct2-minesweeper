/*****************************************************************************
 * Copyright (c) 2021 Sadret
 *
 * The OpenRCT2 plug-in "Minesweeper" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

const f = [0, 1];
while (f.length < 18)
    f.push(f[f.length - 1] + f[f.length - 2]);

export default {
    sizes: [
        "Tiny",
        "Small",
        "Medium",
        "Large",
        "Huge",
    ],
    difficulties: [
        "Beginner",
        "Advanced",
        "Expert",
    ],
    getCols: (size: number) => f[size + 7],
    getRows: (size: number) => f[size + 6],
    getMines: (size: number, difficulty: number) => f[2 * size + difficulty + 7],
};
