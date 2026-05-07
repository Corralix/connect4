<script>
	import { Connect4 } from "$lib/utils/Game.svelte.js";
	import { HardCPU } from "$lib/utils/cpu/HardCPU.js";
	import { EasyCPU, MediumCPU } from "$lib/utils/cpu/EasyMediumCPU.js";
	import Piece from "./Piece.svelte";

	const Game = new Connect4();
	// CPU plays as blue (player 1); human plays as red (player 0).
	const CPU = new HardCPU(1);

	// Visual constants: SLOT = cell size, PIECE = circle diameter
	const SLOT = 60;
	const PIECE = 50;
	const boardW = Game.BOARD_WIDTH * SLOT;
	const boardH = Game.BOARD_HEIGHT * SLOT;

	// Each board instance needs a unique SVG mask id to avoid conflicts when
	// multiple <Board> components are mounted at the same time.
	const maskId = `board-holes-${Math.random().toString(36).slice(2)}`;

	// hoveredCol: which column the cursor is over (null = outside the board)
	let hoveredCol = $state(null);
	let wrapperEl = $state(null);

	// Track cursor position relative to the board wrapper to derive hoveredCol.
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

	// hoveredLogIndex: which debug log entry the cursor is over (null = none)
	let hoveredLogIndex = $state(null);
	// highlight: the highlight metadata for the currently hovered log entry,
	// or null if nothing is hovered or the entry has no highlight.
	let highlight = $derived(
		hoveredLogIndex !== null ? (Game.logs[hoveredLogIndex]?.highlight ?? null) : null
	);

	// After the human drops a piece, wait briefly then let the CPU take its turn.
	// The delay gives the fall animation time to start before the CPU piece drops.
	$effect(() => {
		if (!Game.winner && Game.currentPlayer === CPU.playingAs) {
			const timeout = setTimeout(() => CPU.playTurn(Game), 600);
			return () => clearTimeout(timeout);
		}
	});
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
	{#if hoveredCol !== null && !Game.winner && Game.gameState[hoveredCol].length < Game.BOARD_HEIGHT}
		<div
			class="preview-piece {Game.currentPlayer ? 'blue' : 'red'}"
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
		{#each Game.gameState as columnArray, col}
			{#each columnArray as colorAsBinary, stackRow}
				{@const visualRow = Game.BOARD_HEIGHT - 1 - stackRow}
				{@const ld = Game.lastDrop}
				{@const isFalling = ld !== null && ld.col === col && ld.row === visualRow}
				{#if !isFalling}
					<Piece
						{col}
						row={visualRow}
						color={colorAsBinary ? "blue" : "red"}
						size={PIECE}
						slot={SLOT}
					/>
				{/if}
			{/each}
		{/each}
	</div>

	<!-- Layer 2: falling piece (re-keyed on each drop) -->
	{#if Game.lastDrop}
		{#key Game.lastDrop.id}
			{@const ld = Game.lastDrop}
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
					if (e.animationName === "c4-bounce") Game.lastDrop = null;
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
				{#each { length: Game.BOARD_WIDTH } as _, col}
					{#each { length: Game.BOARD_HEIGHT } as _, row}
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

	<!-- Layer 4: highlight overlay -->
	{#if highlight}
		<svg class="highlight-svg" width={boardW} height={boardH} aria-hidden="true">
			<defs>
				<filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
					<feGaussianBlur stdDeviation="3" result="blur" />
					<feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
				</filter>
			</defs>
			{#if highlight.type === "move"}
				<circle
					cx={highlight.col * SLOT + SLOT / 2}
					cy={highlight.row * SLOT + SLOT / 2}
					r={PIECE / 2 + 5}
					fill="none"
					stroke="#00e676"
					stroke-width="5"
					filter="url(#glow)"
				/>
			{:else if highlight.type === "win"}
				{#each highlight.pieces as p}
					<circle
						cx={p.col * SLOT + SLOT / 2}
						cy={p.row * SLOT + SLOT / 2}
						r={PIECE / 2 + 2}
						fill="#ffe600"
						opacity="0.75"
						filter="url(#glow)"
					/>
				{/each}
				<line
					x1={highlight.pieces[0].col * SLOT + SLOT / 2}
					y1={highlight.pieces[0].row * SLOT + SLOT / 2}
					x2={highlight.pieces[3].col * SLOT + SLOT / 2}
					y2={highlight.pieces[3].row * SLOT + SLOT / 2}
					stroke="white"
					stroke-width="6"
					stroke-linecap="round"
					filter="url(#glow)"
				/>
			{/if}
		</svg>
	{/if}

	<!-- Layer 5: transparent per-column click buttons -->
	<div class="click-layer">
		{#each Game.gameState as _, col}
			<button
				class="col-btn"
				style="width:{SLOT}px; left:{col * SLOT}px;"
				onclick={() => Game.dropPiece(col)}
				aria-label="Drop piece in column {col + 1}"
			></button>
		{/each}
	</div>
</div>

<!-- Debug log -->
<div class="debug-log">
	<strong>Log</strong>
	<ol>
		{#each [...Game.logs].reverse() as entry, reversedI}
			{@const i = Game.logs.length - 1 - reversedI}
			<li
				onmouseenter={() => (hoveredLogIndex = i)}
				onmouseleave={() => (hoveredLogIndex = null)}
				class:highlighted={hoveredLogIndex === i && entry.highlight !== null}
			>
				{entry.message}
			</li>
		{/each}
	</ol>
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

	.debug-log {
		margin-top: 1.5rem;
		padding: 0.75rem 1rem;
		background: #1e1e1e;
		color: #d4d4d4;
		font-family: monospace;
		font-size: 0.8rem;
		border-radius: 6px;
		max-height: 200px;
		overflow-y: auto;
		min-width: 300px;
	}

	.debug-log strong {
		display: block;
		margin-bottom: 0.4rem;
		color: #9cdcfe;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.debug-log ol {
		margin: 0;
		padding-left: 1.5rem;
	}

	.debug-log li {
		margin-bottom: 0.15rem;
		cursor: default;
		border-radius: 3px;
		padding: 1px 4px;
		transition: background 80ms;
	}

	.debug-log li:hover {
		background: rgba(255, 255, 255, 0.08);
	}

	.debug-log li.highlighted {
		background: rgba(255, 255, 255, 0.15);
		color: white;
	}

	.highlight-svg {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}
</style>
