/*****************************************************************************
 * Copyright (c) 2021 Sadret
 *
 * The OpenRCT2 plug-in "Minesweeper" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

export default class Field {
    readonly x: number;
    readonly y: number;
    readonly mine: boolean;

    flagged: boolean = false;
    opened: boolean = false;
    error: boolean = false;

    mineCnt: number = 0;
    propagated: boolean = false;

    buttonId: number;

    constructor(
        x: number,
        y: number,
        mine: boolean,
        buttonId: number,
    ) {
        this.x = x;
        this.y = y;
        this.mine = mine;

        this.buttonId = buttonId;
    }
}
