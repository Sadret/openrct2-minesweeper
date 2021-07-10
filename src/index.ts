/// <reference path="./../../openrct2.d.ts" />

import GameWindow from "./GameWindow";

registerPlugin({
    name: "minesweeper",
    version: "1.0.0",
    authors: ["Sadret"],
    type: "local",
    licence: "GPL-3.0",
    minApiVersion: 24,
    main: () => {
        new GameWindow(17, 13).restart(16);
    },
});
