import { CPUPlayer } from "../CPUPlayer.js";
import { findThreats } from "../searcher.js";

// Plays a random valid column.
export class EasyCPU extends CPUPlayer {
	playTurn(game) {
		const available = [];
		for (let col = 0; col < game.BOARD_WIDTH; col++) {
			if (game.gameState[col].length < game.BOARD_HEIGHT) available.push(col);
		}
		game.dropPiece(available[Math.floor(Math.random() * available.length)]);
	}
}

// Wins/blocks immediately, otherwise plays random.
export class MediumCPU extends CPUPlayer {
	playTurn(game) {
		const opponent = 1 - this.playingAs;

		// Priority 1: win immediately.
		const winMoves = findThreats(game, 3, [this.playingAs]);
		if (winMoves.length > 0) {
			game.dropPiece(winMoves[0].emptyCells[0].col);
			return;
		}

		// Priority 2: block opponent from winning.
		const blockMoves = findThreats(game, 3, [opponent]);
		if (blockMoves.length > 0) {
			game.dropPiece(blockMoves[0].emptyCells[0].col);
			return;
		}

		// Otherwise: random.
		const available = [];
		for (let col = 0; col < game.BOARD_WIDTH; col++) {
			if (game.gameState[col].length < game.BOARD_HEIGHT) available.push(col);
		}
		game.dropPiece(available[Math.floor(Math.random() * available.length)]);
	}
}
