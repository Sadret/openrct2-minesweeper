/*****************************************************************************
 * Copyright (c) 2020-2021 Sadret
 *
 * The OpenRCT2 plug-in "Minesweeper" is licensed
 * under the GNU General Public License version 3.
 *****************************************************************************/

const t = 100;
const f = 94;

const DIGIT_DASH = 10;
const DIGIT_EMPTY = 11;

const segments = [
    [t, t, t, t, t, f, t,], // 0
    [f, f, t, t, f, f, f,], // 1
    [f, t, t, f, t, t, t,], // 2
    [f, f, t, t, t, t, t,], // 3
    [t, f, t, t, f, t, f,], // 4
    [t, f, f, t, t, t, t,], // 5
    [t, t, f, t, t, t, t,], // 6
    [f, f, t, t, t, f, f,], // 7
    [t, t, t, t, t, t, t,], // 8
    [t, f, t, t, t, t, t,], // 9
    [f, f, f, f, f, t, f,], // -
    [f, f, f, f, f, f, f,], // [empty]
];

function drawDigit(
    g: GraphicsContext,
    x: number,
    digit: number,
) {
    // upper left
    g.stroke = segments[digit][0];
    g.line(x + 3, 4, x + 3 + 1, 13);
    g.line(x + 4, 5, x + 4 + 1, 12);
    g.line(x + 5, 6, x + 5 + 1, 11);

    // lower left
    g.stroke = segments[digit][1];
    g.line(x + 3, 14, x + 3 + 1, 23);
    g.line(x + 4, 15, x + 4 + 1, 22);
    g.line(x + 5, 16, x + 5 + 1, 21);

    // upper right
    g.stroke = segments[digit][2];
    g.line(x + 13, 4, x + 13 + 1, 13);
    g.line(x + 12, 5, x + 12 + 1, 12);
    g.line(x + 11, 6, x + 11 + 1, 11);

    // lower right
    g.stroke = segments[digit][3];
    g.line(x + 13, 14, x + 13 + 1, 23);
    g.line(x + 12, 15, x + 12 + 1, 22);
    g.line(x + 11, 16, x + 11 + 1, 21);

    // top
    g.stroke = segments[digit][4];
    g.line(x + 4, 3, x + 13, 3);
    g.line(x + 5, 4, x + 12, 4);
    g.line(x + 6, 5, x + 11, 5);

    // middle
    g.stroke = segments[digit][5];
    g.line(x + 5, 12, x + 12, 12);
    g.line(x + 4, 13, x + 13, 13);
    g.line(x + 5, 14, x + 12, 14);

    // bottom
    g.stroke = segments[digit][6];
    g.line(x + 4, 23, x + 13, 23);
    g.line(x + 5, 22, x + 12, 22);
    g.line(x + 6, 21, x + 11, 21);
}

function drawDots(
    g: GraphicsContext,
    on: boolean,
) {
    g.stroke = on ? t : f;
    drawDot(g, 8);
    drawDot(g, 16);
}

function drawDot(
    g: GraphicsContext,
    y: number,
) {
    g.line(28, y + 1, 29, y + 1);
    g.line(29, y, 30, y + 3);
    g.line(30, y + 1, 31, y + 1);
}

export default class Display {
    static getMineDisplay(
        x: number,
        y: number,
        digits: number,
        getMines: () => number,
    ): CustomWidget {
        return {
            type: "custom",
            x: x,
            y: y,
            width: 13 * digits + 4 + 1,
            height: 27 + 1,
            onDraw: g => {
                g.stroke = 0;
                g.fill = 13;
                g.rect(0, 0, 13 * digits + 4, 27);

                let m = getMines();
                const negative = m < 0;
                if (negative)
                    m = -m;
                for (let d = 0; d < digits; d++ , m = Math.floor(m / 10))
                    drawDigit(g, (digits - 1 - d) * 13, m % 10);
                if (negative)
                    drawDigit(g, 0, DIGIT_DASH);
            },
        };
    }

    static getTimeDisplay(
        x: number,
        y: number,
        getTime: () => number,
    ): CustomWidget {
        const width = 13 * 4 + 7;
        return {
            type: "custom",
            x: x - width,
            y: y,
            width: width + 1,
            height: 27 + 1,
            onDraw: g => {
                g.stroke = 0;
                g.fill = 13;
                g.rect(0, 0, width, 27);

                let t = getTime();
                drawDots(g, t % 1000 < 500);

                if (t < 0)
                    for (let i = 0; i < 4; i++)
                        drawDigit(g, i * 13 + (i & 2 ? 3 : 0), DIGIT_DASH);
                else {
                    t = Math.floor(t / 1000);
                    t %= 3600;

                    let s = t % 10;
                    let ss = Math.floor(t / 10) % 6;
                    let m = Math.floor(t / 60) % 10;
                    let mm = Math.floor(t / 600);

                    drawDigit(g, 0 * 13, t < 600 ? DIGIT_EMPTY : mm);
                    drawDigit(g, 1 * 13, t < 60 ? DIGIT_EMPTY : m);
                    drawDigit(g, 2 * 13 + 3, ss);
                    drawDigit(g, 3 * 13 + 3, s);
                }
            },
        };
    }
}
