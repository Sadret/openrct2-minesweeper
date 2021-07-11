/*****************************************************************************
 * Copyright (c) 2021 Sadret
 *
 * The OpenRCT2 plug-in "Minesweeper" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import Field from "./Field";
import GameWindow from "./GameWindow";
import Modes from "./Modes";
import Persistence from "./Persistence";

export default class Minesweeper {
    private readonly size: number;
    private readonly difficulty: number;

    private readonly cols: number;
    private readonly rows: number;
    private readonly mines: number;

    private readonly board: Field[][] = [];
    private readonly window: GameWindow;

    private opened: number = 0;
    private flagged: number = 0;

    private won: boolean = false;
    private lost: boolean = false;
    private end: boolean = false;

    private time = new Date().getTime();

    constructor(
        size: number,
        difficulty: number,
        sx: number,
        sy: number,
        window: GameWindow,
    ) {
        this.size = size;
        this.difficulty = difficulty;
        this.window = window;

        const cols = this.cols = Modes.getCols(size);
        const rows = this.rows = Modes.getRows(size);
        const mines = this.mines = Modes.getMines(size, difficulty);

        Persistence.startGame(size, difficulty);

        const range = (val: number, max: number) => Math.min(max - 1, val + 1) - Math.max(0, val - 1) + 1;
        const blocked = range(sx, this.cols) * range(sy, this.rows);

        let fieldCnt = rows * cols - blocked;
        let mineCnt = mines;

        // init fields
        for (let x = 0, id = 0; x < cols; x++) {
            this.board.push([]);
            for (let y = 0; y < rows; y++ , id++) {
                const mine = Math.random() < mineCnt / fieldCnt
                    && (x < sx - 1 || x > sx + 1 || y < sy - 1 || y > sy + 1);
                this.board[x].push(new Field(x, y, mine, id));
                fieldCnt--;
                if (mine)
                    mineCnt--;
            }
        }

        // init mine counters
        for (let cx = 0; cx < cols; cx++)
            for (let cy = 0; cy < rows; cy++)
                if (this.board[cx][cy].mine)
                    for (let x = cx - 1; x <= cx + 1; x++)
                        for (let y = cy - 1; y <= cy + 1; y++)
                            if (this.board[x] && this.board[x][y])
                                this.board[x][y].mineCnt++;
    }

    getMines(): number {
        return this.mines - this.flagged;
    }

    getField(x: number, y: number): Field {
        return this.board[x][y];
    }

    getTime(): number {
        if (this.end)
            return this.time;
        else
            return new Date().getTime() - this.time;
    }

    clickField(field: Field) {
        if (this.end)
            return;

        if (field.opened)
            if (!field.mine && !field.propagated && this.countFlags(field) === field.mineCnt)
                this.propagate(field);
            else
                return;
        else if (!field.flagged)
            return this.flagField(field);
        else
            this.openField(field);

        if (!this.end && this.opened === this.cols * this.rows - this.mines) {
            this.won = this.end = true;

            for (let x = 0, id = 0; x < this.cols; x++)
                for (let y = 0; y < this.rows; y++ , id++)
                    if (this.board[x][y].mine)
                        this.flagField(this.board[x][y]);
        }

        if (this.end) {
            this.time = new Date().getTime() - this.time;
            this.window.onGameEnd(this.won);
            Persistence.endGame(this.size, this.difficulty, this.won, this.time);
        }
    }

    private openField(field: Field, preventError = false) {
        if (field.mine && !preventError)
            field.error = true, this.window.updateText(field);

        if (field.opened)
            return;

        this.flagField(field, false);

        field.opened = true;
        this.opened++;

        this.window.setPressed(field);

        if (field.mine && !this.end) {
            this.lost = this.end = true;

            for (let x = 0, id = 0; x < this.cols; x++)
                for (let y = 0; y < this.rows; y++ , id++)
                    if (!this.board[x][y].opened)
                        if (this.board[x][y].mine && !this.board[x][y].flagged)
                            this.openField(this.board[x][y], true);
                        else if (!this.board[x][y].mine && this.board[x][y].flagged)
                            this.board[x][y].error = true, this.window.updateText(this.board[x][y]);
        }
        if (!field.mine && field.mineCnt === 0 && !field.propagated)
            this.propagate(field);
    }

    private flagField(field: Field, flag = true) {
        if (field.flagged === flag)
            return;
        if (flag)
            this.flagged++;
        else
            this.flagged--;
        field.flagged = flag;
        this.window.updateText(field);
    }

    private propagate(field: Field) {
        field.propagated = true;
        const cx = field.x;
        const cy = field.y;
        for (var x = cx - 1; x <= cx + 1; x++)
            for (var y = cy - 1; y <= cy + 1; y++)
                if (this.board[x] && this.board[x][y] && !this.board[x][y].flagged)
                    this.openField(this.board[x][y]);
    }

    private countFlags(field: Field) {
        let cnt = 0;
        const cx = field.x;
        const cy = field.y;
        for (var x = cx - 1; x <= cx + 1; x++)
            for (var y = cy - 1; y <= cy + 1; y++)
                if (this.board[x] && this.board[x][y] && this.board[x][y].flagged)
                    cnt++;
        return cnt;
    }
}
