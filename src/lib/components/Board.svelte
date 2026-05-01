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
					{@const ld = game.lastDrop}
					{@const inFallPath = ld !== null && ld.col === colIndex && rowIndex < ld.row}
					{@const isLandingSlot = ld !== null && ld.col === colIndex && rowIndex === ld.row}
					<Slot
						id={`${colIndex} ${rowIndex}`}
						color={columnArray[game.boardHeight - 1 - rowIndex]}
						animationKey={ld?.id ?? 0}
						fallingColor={inFallPath ? ld.color : null}
						fallDelay={inFallPath ? rowIndex * 60 : 0}
						isLanding={isLandingSlot}
						landingDelay={isLandingSlot ? ld.row * 60 + 20 : 0}
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
