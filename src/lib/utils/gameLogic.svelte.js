import { on } from "svelte/events";

export class Connect4 {
	BOARD_WIDTH = 7;
	BOARD_HEIGHT = 6;

	gameState = $state([]);
	moveHistory = $state([]);
	winner = $state("");
	currentPlayer = $state(0);
	lastDrop = $state(null);
	dropCount = 0;

	// Delete later, just for testing
	exampleGameState = [[0, 1, 0, 1], [0, 1], [1, 0], [1, 0], [1], [0], []];

	constructor() {
		this.reset();
		this.loadExampleGameState();
		this.winner = this.checkIfWinnerMethodBob();
		if (this.winner) {
			console.log(`Game over! Winner is ${this.winner}`);
		}
	}

	reset() {
		this.winner = null;
		this.currentPlayer = 0;
		this.gameState = [];
		this.moveHistory = [];

		for (let col = 0; col < this.BOARD_WIDTH; col++) {
			this.gameState.push([]);
		}
	}

	dropPiece(col) {
		if (this.winner) return;

		const columnArray = this.gameState[col];

		if (columnArray.length < this.BOARD_HEIGHT) {
			const droppingColor = this.currentPlayer ? "blue" : "red";
			const landingRow = this.BOARD_HEIGHT - 1 - columnArray.length;
			columnArray.push(this.currentPlayer);
			this.moveHistory.push({ player: droppingColor, column: col, row: columnArray.length - 1 });
			this.lastDrop = { col, row: landingRow, color: droppingColor, id: ++this.dropCount };
			this.currentPlayer = droppingColor === "red" ? 1 : 0;
		} else {
			console.log(`Column ${col} is full!`);
		}

		this.winner = this.checkIfWinnerMethodBob();
		if (this.winner) {
			console.log(`Game over! Winner is ${this.winner}`);
			return;
		}
	}

	loadExampleGameState() {
		this.gameState = this.exampleGameState;
	}

	transpose(matrix, rowLength = matrix.length, colLength = matrix[0].length) {
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

	staircaseMatrix(matrix, direction) {
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

	checkIfWinnerMethodBob() {
		// console.log("Current Game State:", JSON.parse(JSON.stringify(this.gameState)));
		const transposedGameState = this.transpose(this.gameState, this.BOARD_WIDTH, this.BOARD_HEIGHT);
		// console.log("Transposed Game State:", JSON.parse(JSON.stringify(transposedGameState)));
		const diagonalWidth = this.BOARD_WIDTH + this.BOARD_HEIGHT - 1;
		const offsetDownGameState = this.staircaseMatrix(this.gameState, "down");
		const transposedOffsetDownGameState = this.transpose(offsetDownGameState, this.BOARD_WIDTH, diagonalWidth);

		const offsetUpGameState = this.staircaseMatrix(this.gameState, "up");
		const transposedOffsetUpGameState = this.transpose(offsetUpGameState, this.BOARD_WIDTH, diagonalWidth);

		// Check Verticals
		for (let col = 0; col < this.BOARD_WIDTH; col++) {
			const columnArray = this.gameState[col].join("");
			if (columnArray.includes("0000")) {
				console.log("Red won vertically!");
				return "red";
			} else if (columnArray.includes("1111")) {
				console.log("Blue won vertically!");
				return "blue";
			}
		}

		// Check Horizontals
		for (let row = 0; row < this.BOARD_HEIGHT; row++) {
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
}
