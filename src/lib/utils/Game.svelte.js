import search from "./searcher.svelte.js";

export class Connect4 {
	BOARD_WIDTH = 7;
	BOARD_HEIGHT = 6;

	gameState = $state([]);
	moveHistory = $state([]);
	winner = $state("");
	currentPlayer = $state(0); // 0 for red, 1 for blue
	lastDrop = $state(null);
	dropCount = 0;

	// Delete later, just for testing
	exampleGameState = [[0, 1, 0, 1], [0, 1], [1, 0], [1, 0], [1], [0], []];

	constructor() {
		this.reset();
		this.gameState = this.exampleGameState;
		console.log(this.getFilledGameState());
		this.winner = this.checkForWinner();
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

	getFilledGameState() {
		return this.gameState.map((col) => {
			const filled = [...col];
			while (filled.length < this.BOARD_HEIGHT) filled.push("X");
			return filled;
		});
	}

	getGameState() {
		return this.gameState;
	}

	checkForWinner() {}

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

		this.winner = this.checkForWinner();
		if (this.winner) {
			console.log(`Game over! Winner is ${this.winner}`);
			return;
		}
	}
}
