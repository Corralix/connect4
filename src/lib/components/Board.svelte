<script>
	import { Connect4 } from '$lib/utils/gameLogic.svelte.js';
	import Piece from './Piece.svelte';

	const game = new Connect4();

	const SLOT = 60;
	const PIECE = 50;
	const boardW = game.boardWidth * SLOT;
	const boardH = game.boardHeight * SLOT;

	// Unique mask id so multiple board instances don't conflict
	const maskId = `board-holes-${Math.random().toString(36).slice(2)}`;

	let hoveredCol = $state(null);
	let wrapperEl = $state(null);

	function handleWindowMouseMove(e) {
		if (!wrapperEl) return;
		const rect = wrapperEl.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
		if (x >= 0 && x < boardW && y >= 0 && y < boardH) {
			hoveredCol = Math.floor(x / SLOT);
		} else {
			hoveredCol = null;
		}
	}

	// Gravity-proportional fall duration: t ∝ √(fall distance)
	function fallDuration(row) {
		return Math.round(150 * Math.sqrt(row + 1));
	}
</script>

<svelte:window onmousemove={handleWindowMouseMove} />

<div
	bind:this={wrapperEl}
	class="board-wrapper"
	style="width:{boardW}px; height:{boardH}px;"
	role="grid"
	aria-label="Connect 4 board"
	tabindex="-1"
>
	<!-- Preview piece floating above hovered column -->
	{#if hoveredCol !== null && !game.winner && game.gameState[hoveredCol].length < game.boardHeight}
		<div
			class="preview-piece {game.currentPlayer}"
			style="
				left:{hoveredCol * SLOT + (SLOT - PIECE) / 2}px;
				top:{(SLOT - PIECE) / 2 - SLOT}px;
				width:{PIECE}px;
				height:{PIECE}px;
			"
		></div>
	{/if}

	<!-- Layer 1: settled pieces (skip the one currently falling) -->
	<div class="pieces-layer">
		{#each game.gameState as columnArray, col}
			{#each columnArray as color, stackRow}
				{@const visualRow = game.boardHeight - 1 - stackRow}
				{@const ld = game.lastDrop}
				{@const isFalling = ld !== null && ld.col === col && ld.row === visualRow}
				{#if !isFalling}
					<Piece {col} row={visualRow} {color} size={PIECE} slot={SLOT} />
				{/if}
			{/each}
		{/each}
	</div>

	<!-- Layer 2: falling piece (re-keyed on each drop) -->
	{#if game.lastDrop}
		{#key game.lastDrop.id}
			{@const ld = game.lastDrop}
			{@const fallDur = fallDuration(ld.row)}
			<div
				class="falling-piece {ld.color}"
				style="
					left:{ld.col * SLOT + (SLOT - PIECE) / 2}px;
					top:{ld.row * SLOT + (SLOT - PIECE) / 2}px;
					--piece-size:{PIECE}px;
					--start-dy:{-((ld.row + 1) * SLOT)}px;
					--fall-dur:{fallDur}ms;
					--bounce-delay:{fallDur}ms;
				"
				onanimationend={(e) => {
					if (e.animationName === 'c4-bounce') game.lastDrop = null;
				}}
			></div>
		{/key}
	{/if}

	<!-- Layer 3: yellow board with punched-out holes as SVG mask -->
	<svg
		class="board-svg"
		width={boardW}
		height={boardH}
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
	>
		<defs>
			<mask id={maskId}>
				<rect width={boardW} height={boardH} fill="white" />
				{#each { length: game.boardWidth } as _, col}
					{#each { length: game.boardHeight } as _, row}
						<circle
							cx={col * SLOT + SLOT / 2}
							cy={row * SLOT + SLOT / 2}
							r={PIECE / 2}
							fill="black"
						/>
					{/each}
				{/each}
			</mask>
		</defs>
		<rect width={boardW} height={boardH} fill="#eeff00" mask="url(#{maskId})" />
	</svg>

	<!-- Layer 4: transparent per-column click buttons -->
	<div class="click-layer">
		{#each game.gameState as _, col}
			<button
				class="col-btn"
				style="width:{SLOT}px; left:{col * SLOT}px;"
				onclick={() => game.dropPiece(col)}
				aria-label="Drop piece in column {col + 1}"
			></button>
		{/each}
	</div>
</div>

<style>
	.board-wrapper {
		position: relative;
		overflow: visible;
	}

	.preview-piece {
		position: absolute;
		border-radius: 50%;
		pointer-events: none;
		transition: left 80ms ease;
	}
	.preview-piece.red {
		background: red;
	}
	.preview-piece.blue {
		background: blue;
	}

	.pieces-layer {
		position: absolute;
		inset: 0;
	}

	/* Falling piece: absolutely at its final slot, translated up to start above the board */
	.falling-piece {
		position: absolute;
		width: var(--piece-size);
		height: var(--piece-size);
		border-radius: 50%;
		animation:
			c4-fall var(--fall-dur) cubic-bezier(0.5, 0, 1, 0.45) 0ms 1 normal forwards,
			c4-bounce 380ms ease-out var(--bounce-delay) 1 normal forwards;
	}
	.falling-piece.red {
		background: red;
	}
	.falling-piece.blue {
		background: blue;
	}

	@keyframes c4-fall {
		from {
			transform: translateY(var(--start-dy));
		}
		to {
			transform: translateY(0);
		}
	}

	@keyframes c4-bounce {
		0% {
			transform: translateY(0);
		}
		20% {
			transform: translateY(6px);
		}
		42% {
			transform: translateY(-5px);
		}
		62% {
			transform: translateY(3px);
		}
		78% {
			transform: translateY(-2px);
		}
		90% {
			transform: translateY(1px);
		}
		100% {
			transform: translateY(0);
		}
	}

	.board-svg {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.click-layer {
		position: absolute;
		inset: 0;
	}

	.col-btn {
		position: absolute;
		top: 0;
		height: 100%;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
	}
</style>
