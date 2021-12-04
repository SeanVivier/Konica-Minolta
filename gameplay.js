/* states */
let linePoints = [];
let endPoints = [];
let path = [];
let player = 1;

/* constants */
const startNode = 0;
const endNode = 1;
const colVal = 0;
const rowVal = 1;

/* API calls */


//an easier way to call to the API
const api = (obj) => {
	app.ports.response.send(obj);
}

const initGame = () => {
	api({
		"msg": "INITIALIZE",
		"body": {
			"newLine": null,
			"heading": "Player 1",
			"message": "Awaiting Player 1's Move"
		}
	});
}

const endGame = (winner) => {
	api({
		"msg": "GAME_OVER",
		"body": {
			"newLine": null,
			"heading": "Game Over",
			"message": "Player " + winner + " Wins!"
		}
	});
}

const drawLine = (arr) => {
	api({
		"msg": "VALID_END_NODE",
		"body": {
			"newLine": {
				"start": {
					"x": arr[startNode][colVal],
					"y": arr[startNode][rowVal]
				},
				"end": {
					"x": arr[endNode][colVal],
					"y": arr[endNode][rowVal]
				}
			},
			"heading": "Player 1",
			"message": null
		}
	});
}

const updateText = (title, msg) => {
	api({
		"msg": "UPDATE_TEXT",
		"body": {
			"newLine": null,
			"heading": title,
			"message": msg
		}
	});
}

const forbidMove = (errMsg) => {
	api({
		"msg": "INVALID_END_NODE",
		"body": {
			"newLine": null,
			"heading": "Player " + player,
			"message": errMsg
		}
	});
}

const greenLight = () => {
	api({
		"msg": "VALID_START_NODE",
		"body": {
			"newLine": null,
			"heading": "Player " + player,
			"message": "Select a second node to complete the line."
		}
	});
}

const pickNewStart = () => {
	api({
		"msg": "INVALID_START_NODE",
		"body": {
			"newLine": null,
			"heading": "Player " + player,
			"message": "Not a valid starting position."
		}
	});
}

/* helper functions */

//determine the proper dot
const pinpoint = (row, col) => {
	//if it's the first node
	if (linePoints.length === 0) {
		//must be at start or end of path
		let validStart = handleStartingPoint(row, col);
		if (validStart) {
			greenLight();
			linePoints.push([col, row]);
		} else {
			pickNewStart();
		}
	//if it's the second node
	} else {
		linePoints.push([col, row]);
		let legalMove = followRules(linePoints);
		if (legalMove) {
			addToPath(linePoints);
			handleEndPoints(linePoints);
			drawLine(linePoints);
			switchPlayer();
		}
		//ready to choose next line, either after a legal move or an error.
		linePoints = [];
	}
}

const addToPath = (arr) => {
	//add any nodes between the start and end
	if (isVertical(arr)) {
		//if it's vertical
		for (let i = Math.min(arr[startNode][rowVal], arr[endNode][rowVal]); i <= Math.max(arr[startNode][rowVal], arr[endNode][rowVal]); i++) {
			path.push([arr[startNode][colVal], i]);
		}
	} else if (isHorizontal(arr)) {
		//if it's horizontal
		for (let i = Math.min(arr[startNode][colVal], arr[endNode][colVal]); i <= Math.max(arr[startNode][colVal], arr[endNode][colVal]); i++) {
			path.push([i, arr[startNode][rowVal]]);
		}
	} else {
		//if it's diagonal
		let startRow = arr[startNode][rowVal];
		let factor = arr[startNode][rowVal] < arr[endNode][rowVal] ? 1 : -1;
		if (arr[startNode][colVal] > arr[endNode][colVal]) {
			startRow = arr[endNode][rowVal];
			factor = arr[startNode][rowVal] > arr[endNode][rowVal] ? 1 : -1;
		}
		let rowCount = 0;
		for (let i = Math.min(arr[startNode][colVal], arr[endNode][colVal]); i <= Math.max(arr[startNode][colVal], arr[endNode][colVal]); i++) {
			path.push([i, startRow + (factor * rowCount)]);
			rowCount++;
		}
	}
}

const handleEndPoints = (arr) => {
	if (endPoints.length === 0) {
		endPoints = arr;
	} else {
		//when the start node is one of the endpoints, replace it with the end node.
		for (let i = 0; i <endPoints.length; i++) {
			if (endPoints[i][colVal] === arr[startNode][colVal] && endPoints[i][rowVal] === arr[startNode][rowVal]) {
				endPoints[i] = arr[endNode];
			}
		}
	}
}

const handleStartingPoint = (row, col) => {
	//if it's the first click, it will evaluate as true
	let bool = endPoints.length === 0;
	//if any lines already exist, it will default as false and switch to true if it matches one of the stored endpoints
	for (let i = 0; i <endPoints.length; i++) {
		if (endPoints[i][rowVal] === row && endPoints[i][colVal] === col) {
			bool = true;
		}
	}
	return bool;
}

const isVertical = (arr) => {
	//if it's vertical, the column values will be the same
	return arr[startNode][colVal] === arr[endNode][colVal];
}

const isHorizontal = (arr) => {
	//if it's horizontal, the row values will be the same
	return arr[startNode][rowVal] === arr[endNode][rowVal];
}

const isDiagonal = (arr) => {
	//if the line is diagonal, the difference between column numbers and row numbers will be the same
	return Math.abs(arr[startNode][colVal] - arr[endNode][colVal]) === Math.abs(arr[startNode][rowVal] - arr[endNode][rowVal]);
}

const lineCross = (arr) => {
	let bool = false;
	if (isVertical(arr)) {
		let diff = arr[startNode][rowVal] - arr[endNode][rowVal];
		if (Math.abs(diff) > 1) {
			for (let i = Math.min(arr[startNode][rowVal], arr[endNode][rowVal]) + 1; i < Math.max(arr[startNode][rowVal], arr[endNode][rowVal]); i++) {
				path.forEach((node) => {
					if (node[colVal] === arr[endNode][colVal] && node[rowVal] === i) {
						bool = true;
					}
				});
			}
		}
	} else if (isHorizontal(arr)) {
		let diff = arr[startNode][colVal] - arr[endNode][colVal];
		if (Math.abs(diff) > 1) {
			for (let i = Math.min(arr[startNode][colVal], arr[endNode][colVal]) + 1; i < Math.max(arr[startNode][colVal], arr[endNode][colVal]); i++) {
				path.forEach((node) => {
					if (node[rowVal] === arr[endNode][rowVal] && node[colVal] === i) {
						bool = true;
					}
				});
			}
		}
	} else if (isDiagonal(arr)) {
		let diff = arr[startNode][rowVal] - arr[endNode][rowVal];
		if (Math.abs(diff) > 1) {
			let startRow = arr[startNode][rowVal];
			let factor = arr[startNode][rowVal] < arr[endNode][rowVal] ? 1 : -1;
			if (arr[startNode][colVal] > arr[endNode][colVal]) {
				startRow = arr[endNode][rowVal];
				factor = arr[startNode][rowVal] > arr[endNode][rowVal] ? 1 : -1;
			}
			let rowCount = 1;
			for (let i = Math.min(arr[startNode][colVal], arr[endNode][colVal]) + 1; i < Math.max(arr[startNode][colVal], arr[endNode][colVal]); i++) {
				let row = startRow + (factor * rowCount);
				//make sure it doesn't cross any visited nodes
				path.forEach((node) => {
					if ((node[rowVal] === row) && (node[colVal] === i)) {
						bool = true;
					}
				});
				//check for a line in the way using recursion, for a line going from this point in either direction
				if (lineCross([[i, row], [i + 1, row + factor]]) || lineCross([[i, row], [i - 1, row - factor]])) {
					bool = true
				}
				rowCount++;
			}
		} else {
			//if the opposite nodes in the square are beside each other in the path array, then the new line would cross an existing line
			let newPoints = [[arr[startNode][colVal], arr[startNode][rowVal] - diff], [arr[endNode][colVal], arr[endNode][rowVal] + diff]];
			for (let i = 0; i < path.length; i++) {
				if (path[i][colVal] === newPoints[startNode][colVal] && path[i][rowVal] === newPoints[startNode][rowVal]) {
					if (path[i - 1]) {
						if (path[i - 1][colVal] === newPoints[endNode][colVal] && path[i - 1][rowVal] === newPoints[endNode][rowVal]) {
							bool = true;
						}
					}
					if (path[i + 1]) {
						if (path[i + 1][colVal] === newPoints[endNode][colVal] && path[i + 1][rowVal] === newPoints[endNode][rowVal]) {
							bool = true;
						}
					}
				}
			}
		}
	}
	return bool;
}

const followRules = (arr, warning = true) => {
	let bool = true;
	//must be octolinear
	if (!isVertical(arr) && !isHorizontal(arr) && !isDiagonal(arr)) {
		bool = false;
		warning && forbidMove("Line must be horizontal, vertical, or diagonal!");
	}
	//mustn't intersect lines
	if (lineCross(arr)) {
		bool = false;
		warning && forbidMove("You mustn't cross any lines!");
	}
	//mustn't touch node already visited
	path.forEach((node) => {
		if (node[colVal] === arr[endNode][colVal] && node[rowVal] === arr[endNode][rowVal]) {
			bool = false;
			warning && forbidMove("You mustn't select a node already visited!");
		}
	});
	return bool;
}

const switchPlayer = () => {
	player = player === 1 ? 2 : 1;
	if (checkForWin()) {
		endGame(player);
	} else {
		updateText("Player " + player, "Player " + player + "'s turn");
	}
}

const inBounds = (arr) => {
	//see if the coordinate values exist on the grid
	let real = true;
	arr.forEach((num) => {
		if (num < 0 || num > 3) {
			real = false;
		}
	});
	return real;
}

const checkForWin = () => {
	let win = true;
	//find all possible neighboring moves from the endpoints and check them against valid moves
	let potentials = [];
	endPoints.forEach((pts) => {
		potentials.push([pts, [pts[colVal], pts[rowVal] - 1]]);//north
		potentials.push([pts, [pts[colVal] + 1, pts[rowVal] - 1]]);//northeast
		potentials.push([pts, [pts[colVal] + 1, pts[rowVal]]]);//east
		potentials.push([pts, [pts[colVal] + 1, pts[rowVal] + 1]]);//southeast
		potentials.push([pts, [pts[colVal], pts[rowVal] + 1]]);//south
		potentials.push([pts, [pts[colVal] - 1, pts[rowVal] + 1]]);//southwest
		potentials.push([pts, [pts[colVal] - 1, pts[rowVal]]]);//west
		potentials.push([pts, [pts[colVal] - 1, pts[rowVal] - 1]]);//northwest
	});
	potentials.forEach((potential) => {
		if (inBounds(potential[endNode]) && followRules(potential, false)) {
			win = false;
		}
	});
	return win;
}

//very first call
const main = () => {
	let circles = document.querySelectorAll("g:last-of-type circle");
	for (let i = 0; i < circles.length; i++) {
		circles[i].addEventListener("click", () => {
			let col = Math.floor(i / 4);
			let row = i % 4;
			pinpoint(row, col);
		});
	}
	
	initGame();
}

//making sure the gameplay initializes after the grid has come into being and server has initialized
setTimeout(() => {
	main();
}, 0);