/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Minesweeper" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import Field from "./Field";
import Minesweeper from "./Minesweeper";

export default class GameWindow {
    // style
    private static readonly margin: number = 3;
    private static readonly size: number = 14;
    private static readonly padding: number = 2;

    // board size
    private readonly cols: number;
    private readonly rows: number;
    private readonly mines: number;

    // button management
    private readonly s: number; // the total number of buttons
    private readonly a: number; // the number of regular rows
    private readonly b: number; // the number of buffer rows
    private readonly c: number; // the number of columns
    private usedRows: number = 0;
    private buffered: number = 0;
    private pressed: number = 0;

    private game: Minesweeper | undefined = undefined;
    private readonly fields: Field[] = [];

    private readonly window: Window;

    constructor(cols: number, rows: number, mines: number) {
        this.cols = cols;
        this.rows = rows;
        this.mines = mines;

        this.s = cols * rows;
        this.b = (() => {
            let b = 0;
            while ((63 - b) * (1 << b) - 1 < this.s)
                b++;
            return b;
        })();
        this.a = 62 - this.b;
        this.c = Math.ceil((this.s + 1 - (1 << this.b)) / this.a);

        this.window = this.open();
        this.reset();
    }

    private open(): Window {
        const width = GameWindow.margin + this.cols * (GameWindow.size + GameWindow.padding) - GameWindow.padding + GameWindow.margin;
        const height = 14 + GameWindow.margin + 27 + GameWindow.margin + this.rows * (GameWindow.size + GameWindow.padding) - GameWindow.padding + GameWindow.margin;

        const widgets: Widget[] = [];

        const widgetList: Widget[] = [{
            type: "custom",
            x: GameWindow.margin,
            y: 14 + GameWindow.margin,
            width: 56 + 1,
            height: 27 + 1,
            onDraw: g => {

                g.stroke = 0;
                g.fill = 13;
                g.rect(0, 0, 56, 27);

                g.stroke = 94;

                // upper left
                g.line(3, 4, 3 + 1, 13);
                g.line(4, 5, 4 + 1, 12);
                g.line(5, 6, 5 + 1, 11);

                g.stroke = 100;

                // lower left
                g.line(3, 14, 3 + 1, 23);
                g.line(4, 15, 4 + 1, 22);
                g.line(5, 16, 5 + 1, 21);

                // upper right
                g.line(13, 4, 13 + 1, 13);
                g.line(12, 5, 12 + 1, 12);
                g.line(11, 6, 11 + 1, 11);

                g.stroke = 94;

                // lower right
                g.line(13, 14, 13 + 1, 23);
                g.line(12, 15, 12 + 1, 22);
                g.line(11, 16, 11 + 1, 21);

                g.stroke = 100;

                // top
                g.line(4, 3, 13, 3);
                g.line(5, 4, 12, 4);
                g.line(6, 5, 11, 5);

                // middle
                g.line(5, 12, 12, 12);
                g.line(4, 13, 13, 13);
                g.line(5, 14, 12, 14);

                // bottom
                g.line(4, 23, 13, 23);
                g.line(5, 22, 12, 22);
                g.line(6, 21, 11, 21);

                // g.text(String(this.game ? this.game.getMines() : this.mines), 0, 0);
            },
        }, {
            type: "custom",
            x: width - GameWindow.margin - 64,
            y: 14 + GameWindow.margin + 1,
            width: 64,
            height: 12,
            onDraw: g => {
                g.colour = 2;
                const text = this.game ? String(Math.floor(this.game.getTime() / 1000)) : "-";
                g.text(text, g.width - g.measureText(text).width, 0);
            },
        }, {
            type: "button",
            x: width / 2 - 29 / 2 - 64,
            y: 14 + GameWindow.margin,
            width: 29,
            height: 27,
            name: "face",
            image: 5287,
            onClick: () => this.reset(),
        },];

        const popWidget = () => widgetList.pop() || this.createLabel();

        for (let cpy = 0, i = 0; cpy < this.c; cpy++) {
            if (cpy !== 0)
                widgets.push(popWidget(), popWidget());
            let j = 0;
            for (; j * this.c + cpy < this.s - (1 << this.b) + 1 && j < this.a; j++)
                widgets.push(this.createButton(j * this.c + cpy, i++));
            for (; j < this.a; j++)
                widgets.push(this.createLabel());
            for (let j = 0; j < this.b; j++)
                if (cpy < (1 << j))
                    widgets.push(this.createButton(this.s - (1 << this.b) + (1 << j) + cpy, i++));
                else
                    widgets.push(this.createLabel());
        }

        return ui.openWindow({
            classification: "minesweeper",
            width: width,
            height: height,
            x: (ui.width - width) / 2,
            y: (ui.height - height) / 2,
            title: "Minesweeper",
            widgets: widgets,
            colours: [1, 0, 0],
        });
    }

    private reset(): void {
        this.game = undefined;

        this.usedRows = 0;
        this.buffered = 0;
        this.pressed = 0;
        this.fields.length = 0;

        for (let x = 0, id = 0; x < this.cols; x++) {
            for (let y = 0; y < this.rows; y++ , id++) {
                const widget = this.getWidget(id);
                widget.x = this.getButtonX(x);
                widget.y = this.getButtonY(y);

                widget.isPressed = false;
                widget.text = "";
            }
        }

        this.window.findWidget<ButtonWidget>("face").image = 5287;
    }

    private start(): void {
        this.game = new Minesweeper(this.cols, this.rows, this.mines, this);

        for (let x = 0, id = 0; x < this.cols; x++)
            for (let y = 0; y < this.rows; y++ , id++)
                this.assignButton(id, this.game.getField(x, y));
    }

    private createLabel(): LabelWidget {
        return {
            type: "label",
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        };
    }

    private createButton(id: number, fieldIdx: number): ButtonWidget {
        const name = this.getWidgetName(id);
        const x = fieldIdx % this.cols;
        const y = (fieldIdx - x) / this.cols;
        return {
            type: "button",
            x: this.getButtonX(x),
            y: this.getButtonY(y),
            width: GameWindow.size,
            height: GameWindow.size,
            name: name,
            onClick: () => {
                if (!this.game)
                    this.start();
                this.game ?.clickField(this.fields[id]);
            },
        };
    }

    private assignButton(id: number, field: Field): void {
        const widget = this.getWidget(id);
        widget.x = this.getButtonX(field.x);
        widget.y = this.getButtonY(field.y);

        widget.isPressed = field.opened;

        this.fields[id] = field;
        field.buttonId = id;

        this.updateText(field);
    }

    updateText(field: Field): void {
        const widget = this.getWidget(field.buttonId);

        if (field.opened)
            if (field.mine)
                if (field.error)
                    widget.text = "{RED}X";
                else
                    widget.text = "{BLACK}X";
            else
                widget.text = GameWindow.getString(field.mineCnt);
        else
            if (field.flagged)
                if (field.error)
                    widget.text = "{RED}!";
                else
                    widget.text = "!";
            else
                widget.text = "";
    }

    setPressed(field: Field): void {
        const isBufferFull = this.buffered + 1 === this.c;
        const isLastLineFull = this.usedRows * this.c + this.buffered + 1 === this.s - (1 << this.b) + 1;
        const isLastField = this.pressed + 1 === this.s;
        const flush = (isBufferFull || isLastLineFull) && !isLastField;
        const swapWidgetId = this.shift(0, flush);
        this.swapButtons(field.buttonId, swapWidgetId);
        this.buffered++;
        this.pressed++;
        if (flush) {
            this.buffered = 0;
            this.usedRows++;
        }
    }

    onGameEnd(won: boolean) {
        this.window.findWidget<ButtonWidget>("face").image = won ? 5290 : 5284;
    }

    private swapButtons(id1: number, id2: number) {
        var field1 = this.fields[id1];
        var field2 = this.fields[id2];
        this.assignButton(id1, field2);
        this.assignButton(id2, field1);
    }

    private shift(line: number, force: boolean) {
        var src = this.s - (1 << this.b) + (1 << line);
        var full = (this.buffered & (1 << line)) !== 0;

        if (force && line + 1 === this.b)
            var dest = this.usedRows * this.c;
        else if (force || full)
            var dest = this.shift(line + 1, force)
        else
            var dest = src; // return src

        if (full)
            for (var i = 0; i < (1 << line); i++)
                this.swapButtons(src++, dest++);
        return dest;
    }

    private getButtonX(x: number): number {
        return GameWindow.margin + x * (GameWindow.size + GameWindow.padding);
    }
    private getButtonY(y: number): number {
        return 14 + GameWindow.margin + 27 + GameWindow.margin + y * (GameWindow.size + GameWindow.padding);
    }

    private getWidget(id: number): ButtonWidget {
        return this.window.findWidget(this.getWidgetName(id));
    }
    private getWidgetName(id: number) {
        return "button_" + id;
    }

    private static getString(amount: number) {
        // GREY
        // WHITE
        // RED
        // GREEN
        // YELLOW
        // TOPAZ
        // CELADON
        // BABYBLUE
        // PALELAVENDER
        // PALEGOLD
        // LIGHTPINK
        // PEARLAQUA
        // PALESILVER
        switch (amount) {
            case 0:
                return "";
            case 1:
                return "{BABYBLUE}1";
            case 2:
                return "{GREEN}2";
            case 3:
                return "{RED}3";
            case 4:
                return "{PEARLAQUA}4";
            case 5:
                return "{TOPAZ}5";
            case 6:
                return "{PALELAVENDER}6";
            case 7:
                return "{YELLOW}7";
            case 8:
                return "{WHITE}8";
            default:
                return String(amount);
        }
    }
}
