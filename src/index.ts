/// <reference path="./../../openrct2.d.ts" />

import SettingsWindow from "./SettingsWindow";

registerPlugin({
    name: "minesweeper",
    version: "1.0.0",
    authors: ["Sadret"],
    type: "local",
    licence: "GPL-3.0",
    minApiVersion: 24,
    main: () => {
        if (typeof ui === "undefined")
            return console.log("[minesweeper] Loading cancelled: game runs in headless mode.");

        ui.registerMenuItem("Minesweeper", () => new SettingsWindow());
    },
});
