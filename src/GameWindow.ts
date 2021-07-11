/*****************************************************************************
 * Copyright (c) 2021 Sadret
 *
 * The OpenRCT2 plug-in "Minesweeper" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import Display from "./Display";
import Field from "./Field";
import HighscoresWindow from "./HighscoresWindow";
import Minesweeper from "./Minesweeper";
import Modes from "./Modes";
import SettingsWindow from "./SettingsWindow";

// style
const margin: number = 3;
const btnSize: number = 14;
const padding: number = 2;

function getButtonX(x: number): number {
    return margin + x * (btnSize + padding);
}
function getButtonY(y: number): number {
    return 14 + margin + 27 + margin + y * (btnSize + padding);
}

function getString(amount: number) {
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

export default class GameWindow {

    // settings
    private readonly size: number;
    private readonly difficulty: number;

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

    constructor(size: number, difficulty: number) {
        this.size = size;
        this.difficulty = difficulty;

        this.cols = Modes.getCols(size);
        this.rows = Modes.getRows(size);
        this.mines = Modes.getMines(size, difficulty);

        this.s = this.cols * this.rows;
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
        const width = margin + this.cols * (btnSize + padding) - padding + margin;
        const height = 14 + margin + 27 + margin + this.rows * (btnSize + padding) - padding + margin;

        const mineDisplay = Display.getMineDisplay(
            margin,
            14 + margin,
            Math.ceil(Math.log10(this.mines)),
            () => this.game ? this.game.getMines() : this.mines,
        );
        const timeDisplay = Display.getTimeDisplay(
            width - margin,
            14 + margin,
            () => this.game ? this.game.getTime() : -1,
        );

        const center = this.size === 0 ? (mineDisplay.x + mineDisplay.width + timeDisplay.x) / 2 : width / 2;

        const widgets: Widget[] = [];

        const widgetList: Widget[] = [
            mineDisplay,
            {
                type: "button",
                x: center - 29 / 2 - 32,
                y: 14 + margin,
                width: 29,
                height: 27,
                tooltip: "Settings",
                image: 5201,
                onClick: () => new SettingsWindow(() => this.window.close()),
            },
            {
                type: "button",
                x: center - 29 / 2,
                y: 14 + margin,
                width: 29,
                height: 27,
                tooltip: "New Game",
                name: "face",
                image: 5287,
                onClick: () => this.reset(),
            },
            {
                type: "button",
                x: center - 29 / 2 + 32,
                y: 14 + margin,
                width: 29,
                height: 27,
                tooltip: "Highscores",
                image: 5229,
                onClick: () => new HighscoresWindow(),
            },
            timeDisplay,
        ];

        const popWidget = () => widgetList.pop() || this.createLabel();

        for (let cpy = 0; cpy < this.c; cpy++) {
            if (cpy !== 0)
                widgets.push(popWidget(), popWidget());
            let j = 0;
            for (; j * this.c + cpy < this.s - (1 << this.b) + 1 && j < this.a; j++)
                widgets.push(this.createButton(j * this.c + cpy));
            for (; j * this.c < this.s - (1 << this.b) + 1 && j < this.a; j++)
                widgets.push(this.createLabel());
            for (; j < this.a; j++)
                widgets.push(popWidget());
            for (let j = 0; j < this.b; j++)
                if (cpy < (1 << j))
                    widgets.push(this.createButton(this.s - (1 << this.b) + (1 << j) + cpy));
                else
                    widgets.push(this.createLabel());
        }

        return ui.openWindow({
            classification: "minesweeper-game",
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
                widget.x = getButtonX(x);
                widget.y = getButtonY(y);

                widget.isPressed = false;
                widget.text = "";
            }
        }

        this.window.findWidget<ButtonWidget>("face").image = 5287;
    }

    private start(sx: number, sy: number): void {
        this.game = new Minesweeper(this.size, this.difficulty, sx, sy, this);

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

    private createButton(id: number): ButtonWidget {
        const name = this.getWidgetName(id);
        const x = Math.floor(id / this.rows);
        const y = id % this.rows;
        return {
            type: "button",
            x: getButtonX(x),
            y: getButtonY(y),
            width: btnSize,
            height: btnSize,
            name: name,
            onClick: () => {
                if (!this.game)
                    this.start(x, y);
                this.game ?.clickField(this.fields[id]);
            },
        };
    }

    private assignButton(id: number, field: Field): void {
        const widget = this.getWidget(id);
        widget.x = getButtonX(field.x);
        widget.y = getButtonY(field.y);

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
                widget.text = getString(field.mineCnt);
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

    private getWidget(id: number): ButtonWidget {
        return this.window.findWidget(this.getWidgetName(id));
    }
    private getWidgetName(id: number) {
        return "button_" + id;
    }
}
