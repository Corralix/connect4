function transpose(matrix, rowLength = matrix.length, colLength = matrix[0].length) {
	// Transposes the game state counter clockwise 90deg
	const grid = [];

	for (let j = 0; j < colLength; j++) {
		grid[j] = Array(rowLength);
		for (let i = 0; i < rowLength; i++) {
			if (matrix[i][j] === undefined) {
				grid[j][i] = "X";
			} else {
				grid[j][i] = matrix[i][j];
			}
		}
	}
	grid.reverse();
	return grid;
}

function staircaseMatrix(matrix, direction) {
	// Shifts creating a staircase effect for diagonal checking
	const shifted = [];
	const rows = matrix.length;

	for (let i = 0; i < rows; i++) {
		// Calculate how many 'X's belong on the left vs the right
		// Max offset needed to make it rectangular is (rows - 1)
		const leftPadCount = direction === "down" ? i : rows - 1 - i;
		const rightPadCount = direction === "down" ? rows - 1 - i : i;

		shifted.push([
			...Array(leftPadCount).fill("X"),
			...matrix[i],
			...Array(rightPadCount).fill("X")
		]);
	}

	return shifted;
}

function searchHelper(length, array, template, players = [0, 1]) {
	let foundSpots = [];
	for (let col = 0; col < length; col++) {
		const columnArrayAsString = array.join("");
		for (searchKey of template) {
			for (player of players) {
				searchKey = searchKey.replace(/-/g, player.toString());
				if (columnArrayAsString.includes(searchKey)) {
					foundSpots.push({ player, searchKey, col, index: columnArrayAsString.indexOf(searchKey) });
				}
			}
		}
	}
	return foundSpots;
}

function search(game, player, howManyInARow = 4) {
	function checkForEmpty(amount) {}
	const transposedGameState = transpose(game.gameState, game.BOARD_WIDTH, game.BOARD_HEIGHT);
	const diagonalWidth = game.BOARD_WIDTH + game.BOARD_HEIGHT - 1;
	const offsetDownGameState = staircaseMatrix(game.gameState, "down");
	const transposedOffsetDownGameState = transpose(
		offsetDownGameState,
		game.BOARD_WIDTH,
		diagonalWidth
	);

	const offsetUpGameState = staircaseMatrix(game.gameState, "up");
	const transposedOffsetUpGameState = transpose(offsetUpGameState, game.BOARD_WIDTH, diagonalWidth);
	let verticalTemplates = { 1: ["-XXX"], 2: ["--XX"], 3: ["---X"], 4: ["----"] };
	let nonVerticalTemplates = {
		1: ["-XXX", "X-XX", "XX-X", "XXX-"],
		2: ["--XX", "X--X", "XX--"],
		3: ["---X", "X---"],
		4: ["----"]
	};
	// Check Verticals
	let verticalSpots = searchHelper(game.BOARD_WIDTH, game.gameState, verticalTemplates[howManyInARow]);
	

	// Check Horizontals
	for (let row = 0; row < game.BOARD_HEIGHT; row++) {
		const rowArray = transposedGameState[row].join("");
		if (rowArray.includes("0000")) {
			console.log("Red won horizontally!");
			return "red";
		} else if (rowArray.includes("1111")) {
			console.log("Blue won horizontally!");
			return "blue";
		}
	}

	// Check stairdown Diagonals
	for (let row = 0; row < transposedOffsetDownGameState.length; row++) {
		const rowString = transposedOffsetDownGameState[row].join("");
		if (rowString.includes("0000")) {
			console.log("Red won diagonally (down)!");
			return "red";
		} else if (rowString.includes("1111")) {
			console.log("Blue won diagonally (down)!");
			return "blue";
		}
	}

	// Check stairup Diagonals
	for (let row = 0; row < transposedOffsetUpGameState.length; row++) {
		const rowString = transposedOffsetUpGameState[row].join("");
		if (rowString.includes("0000")) {
			console.log("Red won diagonally (up)!");
			return "red";
		} else if (rowString.includes("1111")) {
			console.log("Blue won diagonally (up)!");
			return "blue";
		}
	}

	return "";
}

export { search };