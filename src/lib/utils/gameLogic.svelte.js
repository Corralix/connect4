export class Connect4 {
	boardWidth = 7;
	boardHeight = 6;

	gameState = $state([]);
	winner = $state(null);
	currentPlayer = $state('red');

	constructor() {
		this.reset();
	}

	reset() {
		this.winner = null;
		this.currentPlayer = 'red';
		this.gameState = [];

		for (let col = 0; col < this.boardWidth; col++) {
			this.gameState.push([]);
		}
	}

	dropPiece(col) {
		if (this.winner) return;

		const columnArray = this.gameState[col];

		if (columnArray.length < this.boardHeight) {
			columnArray.push(this.currentPlayer);
			console.log(`Player ${this.currentPlayer} dropped a piece in column ${col}`);
			this.currentPlayer = this.currentPlayer === 'red' ? 'blue' : 'red';
		} else {
			console.log(`Column ${col} is full!`);
		}
	}
}
