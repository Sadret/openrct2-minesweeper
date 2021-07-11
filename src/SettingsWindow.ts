/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Minesweeper" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

import GameWindow from "./GameWindow";

const f = [0, 1];
while (f.length < 18)
    f.push(f[f.length - 1] + f[f.length - 2]);

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
        new GameWindow(f[this.size + 7], f[this.size + 6], f[2 * this.size + this.difficulty + 7]);
    }

    private open() {
        const width = 256;
        const height = 126;
        return ui.openWindow({
            classification: "minesweeper-settings",
            width: width,
            height: height,
            x: (ui.width - width) / 2,
            y: (ui.height - height) / 2,
            title: "Minesweeper - Settings",
            widgets: [{
                type: "groupbox",
                text: "Size",
                x: 5,
                y: 20,
                width: 122,
                height: 101,
            }, {
                type: "button",
                name: "size_0",
                text: "Tiny",
                x: 11,
                y: 37,
                width: 110,
                height: 14,
                onClick: () => this.setSize(0),
            }, {
                type: "button",
                name: "size_1",
                text: "Small",
                x: 11,
                y: 53,
                width: 110,
                height: 14,
                onClick: () => this.setSize(1),
            }, {
                type: "button",
                name: "size_2",
                text: "Medium",
                x: 11,
                y: 69,
                width: 110,
                height: 14,
                onClick: () => this.setSize(2),
            }, {
                type: "button",
                name: "size_3",
                text: "Large",
                x: 11,
                y: 85,
                width: 110,
                height: 14,
                onClick: () => this.setSize(3),
            }, {
                type: "button",
                name: "size_4",
                text: "Huge",
                x: 11,
                y: 101,
                width: 110,
                height: 14,
                onClick: () => this.setSize(4),
            }, {
                type: "groupbox",
                text: "Difficulty",
                x: 129,
                y: 20,
                width: 122,
                height: 69,
            }, {
                type: "button",
                name: "difficulty_0",
                text: "Beginner",
                x: 135,
                y: 37,
                width: 110,
                height: 14,
                onClick: () => this.setDifficulty(0),
            }, {
                type: "button",
                name: "difficulty_1",
                text: "Advanced",
                x: 135,
                y: 53,
                width: 110,
                height: 14,
                onClick: () => this.setDifficulty(1),
            }, {
                type: "button",
                name: "difficulty_2",
                text: "Expert",
                x: 135,
                y: 69,
                width: 110,
                height: 14,
                onClick: () => this.setDifficulty(2),
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
            },],
        });
    }
}
