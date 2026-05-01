<script>
	import { Connect4 } from '$lib/utils/gameLogic.svelte.js';
	import Slot from './Slot.svelte';

	const game = new Connect4();
</script>

<div class="board-container">
	{#each game.gameState as columnArray, colIndex}
		<button class="column" onclick={() => game.dropPiece(colIndex)}>
			<div id={colIndex} class="column">
				{#each { length: game.boardHeight } as _, rowIndex}
					<Slot
						id={`${colIndex} ${rowIndex}`}
						color={columnArray[game.boardHeight - 1 - rowIndex]}
					/>
				{/each}
			</div>
		</button>
	{/each}
</div>

<style>
	.board-container {
		display: flex;
		flex-direction: row;
		width: fit-content;
	}

	.column {
		display: flex;
		flex-direction: column;
	}
	button {
		background: none;
		border: none;
		padding: 0;
		margin: 0;
	}
</style>
