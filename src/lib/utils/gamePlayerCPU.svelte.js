export class GamePlayerCPU {
	playingAs = 0; // 0 or 1
	BOARD_HEIGHT = 0;
	BOARD_WIDTH = 0;
	gameState = [];

	playTurn(game) {
		getGameInfo(game);
		// If there are 2+ in a row, look for third and play there

		// Otherwise, random move
	}

	getGameInfo(game) {
		this.gameState = game.gameState;
		this.BOARD_HEIGHT = game.BOARD_HEIGHT;
		this.BOARD_WIDTH = game.BOARD_WIDTH;
	}
}
