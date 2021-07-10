// src/openrct2/sprites.h
// SPR_OPEN = 5180,

var margin = 3;
var size = 14;
var padding = 2;

var cols = 119; //119;
var rows = 62; //62;

var s = cols * rows;
var b = 0;
while ((63 - b) * (1 << b) - 1 < s)
	b++;
var a = 62 - b;
var c = Math.ceil((s + 1 - (1 << b)) / a);

var pressed = 0;
var buffered = 0;

var board = [];
var mines = (s * Math.log(s)) >> 4; // (easy: 6, normal: 5, difficult: 4)
var opened = 0;

var ids = [];

var window;

console.log(s, a, b, c, mines);

registerPlugin({
	name: "minesweeper",
	version: "1.0",
	authors: ["Sadret"],
	type: "local",
	licence: "MIT",
	main: function() {
		for (var x = 0; x < cols; x++) {
			board.push([]);
			for (var y = 0; y < rows; y++)
				board[x].push({
					x: x,
					y: y,
					mine: false,
					flagged: false,
					open: false,
					n: 0,
					m: 0,
					id: undefined,
				});
		}

		var i = 0;
		while (i < mines) {
			var x = Math.floor(Math.random() * cols);
			var y = Math.floor(Math.random() * rows);
			if (board[x][y].mine)
				continue;
			board[x][y].mine = true;
			increaseMines(x, y);
			i++;
		}

		var widgets = [];
		for (var cpy = 0, i = 0; cpy < c; cpy++) {
			if (cpy !== 0)
				widgets.push(createLabel(), createLabel());
			var j = 0;
			for (; j * c + cpy < s - (1 << b) + 1 && j < a; j++)
				widgets.push(createWidget(j * c + cpy, i++));
			for (; j < a; j++)
				widgets.push(createLabel());
			for (var j = 0; j < b; j++)
				if (cpy < (1 << j))
					widgets.push(createWidget(s - (1 << b) + (1 << j) + cpy, i++));
				else
					widgets.push(createLabel());
		}

		var width = margin + cols * (size /*2*/ + padding) - padding + margin;
		var height = 14 + margin + rows * (size + padding) - padding + margin;

		window = ui.openWindow({
			classification: "minesweeper",
			width: width,
			height: height,
			x: (ui.width - width) / 2,
			y: (ui.height - height) / 2,
			title: "Minesweeper",
			widgets: widgets,
			colours: [1, 0, 28],
		});

		ui.registerMenuItem("bot", function() {
			function getClosed(cx, cy) {
				var num = 0;
				for (var x = cx - 1; x <= cx + 1; x++)
					for (var y = cy - 1; y <= cy + 1; y++)
						if (board[x] && board[x][y])
							if (!board[x][y].open && !board[x][y].flagged)
								num++;
				return num;
			}

			function setFlags(cx, cy) {
				for (var x = cx - 1; x <= cx + 1; x++)
					for (var y = cy - 1; y <= cy + 1; y++)
						if (board[x] && board[x][y])
							if (!board[x][y].open && !board[x][y].flagged)
								activateWidget(board[x][y].id, true);
			}

			var changed = true;
			while (changed) {
				changed = false;
				for (var x = 0; x < cols; x++)
					for (var y = 0; y < rows; y++) {
						var field = board[x][y];
						if (!field.open)
							continue;
						if (field.n === 0)
							continue;
						var num = getClosed(x, y);
						if (field.m === field.n)
							if (num > 0)
								activateWidget(field.id, true);
							else
								continue;
						else if (field.n === field.m + num)
							setFlags(x, y);
						else
							continue;
						changed = true;
					}
			}
			console.log("done");
		});
	},
});

function createLabel() {
	return {
		type: "label",
		x: 0,
		y: 0,
		width: 0,
		height: 0,
	};
}

function createWidget(id, field_id) {
	var name = "button_" + id;
	var x = field_id % cols;
	var y = (field_id - x) / cols;
	var field = board[x][y];
	field.id = id;
	ids[id] = field;
	return {
		type: "button",
		x: margin + x * (size /*2*/ + padding),
		y: 14 + margin + y * (size + padding),
		width: size /*2*/ ,
		height: size,
		name: name,
		onClick: function() {
			activateWidget(id, true);
			// no win if last field was mine and exactly one covered blank
			if (s === mines + opened)
				ui.showTextInput({
					title: "Minesweeper",
					description: "You won the game! Please enter your name:",
					initialValue: "Sadret",
					callback: function() {},
				});
		}
	};
}

function increaseMines(cx, cy) {
	for (var x = cx - 1; x <= cx + 1; x++)
		for (var y = cy - 1; y <= cy + 1; y++)
			if (board[x] && board[x][y])
				board[x][y].n++;
}

function increaseFlags(cx, cy) {
	for (var x = cx - 1; x <= cx + 1; x++)
		for (var y = cy - 1; y <= cy + 1; y++)
			if (board[x] && board[x][y])
				board[x][y].m++;
}

function decreaseFlags(cx, cy) {
	for (var x = cx - 1; x <= cx + 1; x++)
		for (var y = cy - 1; y <= cy + 1; y++)
			if (board[x] && board[x][y])
				board[x][y].m--;
}

function getString(amount) {
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

function activateWidget(id, flag, onOpen) {
	var field = ids[id];
	if (field.open) {
		if (onOpen)
			return;
		if (field.mine)
			return;
		if (field.n !== field.m)
			return;
		onOpen = true;
	} else if (field.flagged && onOpen) {
		return;
	} else if (flag && !field.flagged) {
		field.flagged = true;
		var widget = getWidget(id);
		widget.text = "!";
		increaseFlags(field.x, field.y);
		return;
	} else {
		if (field.flagged) {
			field.flagged = false;
			decreaseFlags(field.x, field.y);
		}

		field.open = true;
		opened++;

		// swap
		var isBufferFull = buffered + 1 === c;
		var isLastLineFull = pressed * c + buffered + 1 === s - (1 << b) + 1;
		var isLastField = opened + 1 === s;
		var flush = (isBufferFull || isLastLineFull) && !isLastField;
		var swapWidgetId = shift(0, flush);
		swapWidgets(field.id, swapWidgetId);
		buffered++;
		if (flush) {
			buffered = 0;
			pressed++;
		}
		if (field.n !== 0)
			return;
	}

	for (var x = field.x - 1; x <= field.x + 1; x++)
		for (var y = field.y - 1; y <= field.y + 1; y++)
			if (board[x] && board[x][y])
				activateWidget(board[x][y].id, undefined, onOpen);
}

function swapWidgets(id1, id2) {
	var field1 = ids[id1];
	var field2 = ids[id2];
	assignWidget(id1, field2);
	assignWidget(id2, field1);
}

function assignWidget(id, field) {
	var widget = getWidget(id);
	widget.x = margin + field.x * (size /*2*/ + padding);
	widget.y = 14 + margin + field.y * (size + padding);
	if (field.open)
		if (field.mine)
			widget.text = "{BLACK}X";
		else
			widget.text = getString(field.n);
	else if (field.flagged)
		widget.text = "!";
	else
		widget.text = "";
	widget.isPressed = field.open;

	ids[id] = field;
	field.id = id;
}

function getWidget(id) {
	return window.findWidget(getWidgetName(id));
}

function getWidgetName(id) {
	return "button_" + id;
}

function shift(line, force) {
	var src = s - (1 << b) + (1 << line);
	var full = (buffered & (1 << line)) !== 0;

	if (force && line + 1 === b)
		var dest = pressed * c;
	else if (force || full)
		var dest = shift(line + 1, force)
	else
		var dest = src; // return src

	if (full)
		for (var i = 0; i < (1 << line); i++)
			swapWidgets(src++, dest++);
	return dest;
}