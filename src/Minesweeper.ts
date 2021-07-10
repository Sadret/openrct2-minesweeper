/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Minesweeper" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import Field from "./Field";
import GameWindow from "./GameWindow";

export default class Minesweeper {
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
        cols: number,
        rows: number,
        mines: number,
        window: GameWindow,
    ) {
        this.rows = rows;
        this.cols = cols;
        this.mines = mines;
        this.window = window;

        let fieldCnt = rows * cols;
        let mineCnt = mines;

        // init fields
        for (let x = 0, id = 0; x < cols; x++) {
            this.board.push([]);
            for (let y = 0; y < rows; y++ , id++) {
                const mine = Math.random() < mineCnt / fieldCnt;
                this.board[x].push(new Field(
                    x,
                    y,
                    mine,
                    id,
                ));
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
            this.time = new Date().getTime() - this.time;

            for (let x = 0, id = 0; x < this.cols; x++)
                for (let y = 0; y < this.rows; y++ , id++)
                    if (this.board[x][y].mine)
                        this.flagField(this.board[x][y]);

            ui.showTextInput({
                title: "Minesweeper",
                description: "You won the game! Please enter your name:",
                initialValue: "Sadret",
                callback: name => console.log(name),
            });
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

            ui.showError(
                "Minesweeper",
                "You lost the game!",
            );
            console.log("lost");
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
