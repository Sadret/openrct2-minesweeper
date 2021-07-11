/*****************************************************************************
 * Copyright (c) 2021 Sadret
 *
 * The OpenRCT2 plug-in "Minesweeper" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import GameWindow from "./GameWindow";
import Modes from "./Modes";

export default class SettingsWindow {
    private readonly window: Window;
    private readonly callback?: () => void;

    private size?: number = undefined;
    private difficulty?: number = undefined;

    constructor(callback?: () => void) {
        this.window = this.open();
        this.callback = callback;
    }

    private setSize(size?: number) {
        if (this.size === size)
            return;

        if (this.size !== undefined)
            this.window.findWidget<ButtonWidget>("size_" + this.size).isPressed = false;
        this.size = size;
        if (this.size !== undefined)
            this.window.findWidget<ButtonWidget>("size_" + this.size).isPressed = true;

        if (this.size !== undefined && this.difficulty !== undefined)
            this.window.findWidget<ButtonWidget>("ok").isDisabled = false;
    }

    private setDifficulty(difficulty?: number) {
        if (this.difficulty === difficulty)
            return;

        if (this.difficulty !== undefined)
            this.window.findWidget<ButtonWidget>("difficulty_" + this.difficulty).isPressed = false;
        this.difficulty = difficulty;
        if (this.difficulty !== undefined)
            this.window.findWidget<ButtonWidget>("difficulty_" + this.difficulty).isPressed = true;

        if (this.size !== undefined && this.difficulty !== undefined)
            this.window.findWidget<ButtonWidget>("ok").isDisabled = false;
    }

    private ok() {
        if (this.size === undefined || this.difficulty === undefined)
            return;
        if (this.callback)
            this.callback();
        this.window.close();
        new GameWindow(this.size, this.difficulty);
    }

    private open() {
        const width = 256;
        const height = 126;

        const widgets: Widget[] = [{
            type: "groupbox",
            text: "Size",
            x: 5,
            y: 20,
            width: 122,
            height: 101,
        }, {
            type: "groupbox",
            text: "Difficulty",
            x: 129,
            y: 20,
            width: 122,
            height: 69,
        }, {
            type: "button",
            name: "ok",
            text: "New Game",
            x: 135,
            y: 101,
            width: 110,
            height: 14,
            isDisabled: true,
            onClick: () => this.ok(),
        },];

        Modes.sizes.forEach((label, idx) => widgets.push({
            type: "button",
            name: "size_" + idx,
            text: label,
            x: 11,
            y: 37 + idx * 16,
            width: 110,
            height: 14,
            onClick: () => this.setSize(idx),
        }));

        Modes.difficulties.forEach((label, idx) => widgets.push({
            type: "button",
            name: "difficulty_" + idx,
            text: label,
            x: 135,
            y: 37 + idx * 16,
            width: 110,
            height: 14,
            onClick: () => this.setDifficulty(idx),
        }));

        return ui.openWindow({
            classification: "minesweeper-settings",
            width: width,
            height: height,
            x: (ui.width - width) / 2,
            y: (ui.height - height) / 2,
            title: "Minesweeper - Settings",
            widgets: widgets,
        });
    }
}
