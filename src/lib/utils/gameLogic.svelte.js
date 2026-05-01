export class Connect4 {
	boardWidth = 7;
	boardHeight = 6;

	gameState = $state([]);
	moveHistory = $state([]);
	winner = $state(null);
	currentPlayer = $state('red');
	lastDrop = $state(null);
	#dropCount = 0;

	constructor() {
		this.reset();
	}

	reset() {
		this.winner = null;
		this.currentPlayer = 'red';
		this.gameState = [];
		this.moveHistory = [];

		for (let col = 0; col < this.boardWidth; col++) {
			this.gameState.push([]);
		}
	}

	dropPiece(col) {
		if (this.winner) return;

		const columnArray = this.gameState[col];

		if (columnArray.length < this.boardHeight) {
			const droppingColor = this.currentPlayer;
			const landingRow = this.boardHeight - 1 - columnArray.length;
			columnArray.push(droppingColor);
			this.moveHistory.push({ player: droppingColor, column: col, row: columnArray.length - 1 });
			this.lastDrop = { col, row: landingRow, color: droppingColor, id: ++this.#dropCount };
			this.currentPlayer = droppingColor === 'red' ? 'blue' : 'red';
		} else {
			console.log(`Column ${col} is full!`);
		}
	}
}
