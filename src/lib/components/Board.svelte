<script>
	import { Connect4 } from "$lib/utils/Game.svelte.js";
	import { HardCPU } from "$lib/utils/cpu/HardCPU.js";
	import { EasyCPU, MediumCPU } from "$lib/utils/cpu/EasyMediumCPU.js";
	import Piece from "./Piece.svelte";

	const Game = new Connect4();
	// CPU plays as blue (player 1); human plays as red (player 0).
	const cpuClasses = { easy: EasyCPU, medium: MediumCPU, hard: HardCPU };
	let difficulty = $state("hard");
	let CPU = $derived(new cpuClasses[difficulty](1));

	function setDifficulty(d) {
		difficulty = d;
		Game.reset();
	}

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
	let showOverlay = $state(true);

	// Re-show the overlay whenever a new winner is determined.
	$effect(() => {
		if (Game.winner) showOverlay = true;
	});
	let wrapperEl = $state(null);

	// Track cursor position relative to the board wrapper to derive hoveredCol.
	// The wrapper has SLOT px of top padding for the preview piece, so the actual
	// board starts at y = SLOT inside the wrapper.
	function handleWindowMouseMove(e) {
		if (!wrapperEl) return;
		const rect = wrapperEl.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top - SLOT; // offset past the preview row
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

<section class="game">
	<header class="controls" style="width:{boardW}px">
		<div class="difficulty-group">
			<span class="label">Difficulty</span>
			<div class="btn-group" role="group" aria-label="CPU difficulty">
				<button class:active={difficulty === "easy"} onclick={() => setDifficulty("easy")}
					>Easy</button
				>
				<button class:active={difficulty === "medium"} onclick={() => setDifficulty("medium")}
					>Medium</button
				>
				<button class:active={difficulty === "hard"} onclick={() => setDifficulty("hard")}
					>Hard</button
				>
			</div>
		</div>
		<button class="btn-new-game" onclick={() => Game.reset()}>New Game</button>
	</header>

	<div class="status-bar" style="width:{boardW}px">
		{#if !Game.winner}
			<span class="turn-dot {Game.currentPlayer ? 'blue' : 'red'}"></span>
			<span class="turn-text">{Game.currentPlayer ? "CPU is thinking…" : "Your turn"}</span>
		{/if}
	</div>

	<div class="game-body">
		<div
			bind:this={wrapperEl}
			class="board-wrapper"
			style="width:{boardW}px; height:{boardH + SLOT}px; --board-offset:{SLOT}px;"
			role="grid"
			aria-label="Connect 4 board"
			tabindex="-1"
		>
			<!-- Preview piece sits in the top padding row -->
			{#if hoveredCol !== null && !Game.winner && Game.gameState[hoveredCol].length < Game.BOARD_HEIGHT}
				<div
					class="preview-piece {Game.currentPlayer ? 'blue' : 'red'}"
					style="
						left:{hoveredCol * SLOT + (SLOT - PIECE) / 2}px;
						top:{(SLOT - PIECE) / 2}px;
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
					top:{SLOT + ld.row * SLOT + (SLOT - PIECE) / 2}px;
					--piece-size:{PIECE}px;
					--start-dy:{-((ld.row + 2) * SLOT)}px;
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

			<!-- Layer 6: game-over overlay -->
			{#if Game.winner && showOverlay}
				<div class="game-over-overlay" role="dialog" aria-modal="true" aria-label="Game over">
					<div class="game-over-box">
						<button class="btn-dismiss" onclick={() => (showOverlay = false)} aria-label="Dismiss"
							>✕</button
						>
						<span class="game-over-winner {Game.winner}">
							{Game.winner === "red" ? "Red" : "Blue"} wins!
						</span>
						<button class="btn-restart" onclick={() => Game.reset()}>Play Again</button>
					</div>
				</div>
			{/if}
		</div>

		<aside class="move-log" style="height:{boardH + SLOT}px" aria-label="Move history">
			<p class="log-title">Move Log</p>
			<ul>
				{#each [...Game.logs].reverse() as entry, reversedI}
					{@const i = Game.logs.length - 1 - reversedI}
					<li
						onmouseenter={() => (hoveredLogIndex = i)}
						onmouseleave={() => (hoveredLogIndex = null)}
						class:highlighted={hoveredLogIndex === i && entry.highlight !== null}
						class:log-red={entry.highlight?.type === "move" && entry.highlight?.color === "red"}
						class:log-blue={entry.highlight?.type === "move" && entry.highlight?.color === "blue"}
						class:log-win={entry.highlight?.type === "win"}
						class:log-full={entry.highlight?.type === "full"}
					>
						{entry.message}
					</li>
				{/each}
			</ul>
		</aside>
	</div>
</section>

<style>
	/* ── Design tokens ───────────────────────────────── */
	.game {
		--c-bg: #1e1e1e;
		--c-surface: #2a2a2a;
		--c-border: #4a4a4a;
		--c-text: #d4d4d4;
		--c-muted: #777;
		--c-accent-bg: #1a3a5c;
		--c-accent: #4d9ee8;
		--c-red: #ff6b6b;
		--c-blue: #64b5f6;
		--c-win: #ffd700;
		--radius: 6px;
		--font: "Cascadia Code", "Fira Code", "Consolas", monospace;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	/* ── Controls bar ────────────────────────────────── */
	.controls {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.45rem 0.75rem;
		background: var(--c-bg);
		border: 1px solid var(--c-border);
		border-bottom: none;
		border-radius: var(--radius) var(--radius) 0 0;
		gap: 0.75rem;
	}

	.difficulty-group {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.label {
		font-size: 0.72rem;
		color: var(--c-muted);
		font-family: var(--font);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		white-space: nowrap;
	}

	.btn-group {
		display: flex;
		border: 1px solid var(--c-border);
		border-radius: var(--radius);
		overflow: hidden;
	}

	.btn-group button {
		padding: 0.22rem 0.65rem;
		border: none;
		background: var(--c-surface);
		color: var(--c-text);
		font-family: var(--font);
		font-size: 0.76rem;
		cursor: pointer;
		transition: background 120ms;
	}

	.btn-group button + button {
		border-left: 1px solid var(--c-border);
	}

	.btn-group button:hover {
		background: #383838;
	}

	.btn-group button.active {
		background: var(--c-accent-bg);
		color: white;
	}

	.btn-new-game {
		padding: 0.22rem 0.7rem;
		border: 1px solid var(--c-border);
		border-radius: var(--radius);
		background: var(--c-surface);
		color: var(--c-text);
		font-family: var(--font);
		font-size: 0.76rem;
		cursor: pointer;
		transition: background 120ms;
		white-space: nowrap;
	}

	.btn-new-game:hover {
		background: #383838;
	}

	/* ── Status / turn bar ───────────────────────────── */
	.status-bar {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		height: 1.75rem;
		padding: 0 0.75rem;
		background: var(--c-bg);
		border-left: 1px solid var(--c-border);
		border-right: 1px solid var(--c-border);
		border-bottom: 1px solid var(--c-border);
	}

	.turn-dot {
		width: 9px;
		height: 9px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.turn-dot.red {
		background: var(--c-red);
	}
	.turn-dot.blue {
		background: var(--c-blue);
	}

	.turn-text {
		font-size: 0.76rem;
		font-family: var(--font);
		color: var(--c-text);
	}

	/* ── Game body (board + log side-by-side) ────────── */
	.game-body {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
	}

	/* ── Board ───────────────────────────────────────── */
	.board-wrapper {
		position: relative;
		overflow: hidden;
		flex-shrink: 0;
	}

	/* All board layers (pieces, SVG, clicks) sit below the preview row */
	.pieces-layer,
	.board-svg,
	.highlight-svg,
	.click-layer,
	.game-over-overlay {
		top: var(--board-offset);
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
		left: 0;
		right: 0;
		bottom: 0;
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
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
	}

	.click-layer {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
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

	.highlight-svg {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
	}

	/* ── Game-over overlay ───────────────────────────── */
	.game-over-overlay {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.65);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 10;
		border-radius: 4px;
	}

	.game-over-box {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		background: var(--c-bg);
		padding: 1.5rem 2.5rem;
		border-radius: 8px;
		border: 1px solid var(--c-border);
	}

	.btn-dismiss {
		position: absolute;
		top: 0.4rem;
		right: 0.4rem;
		background: none;
		border: none;
		color: var(--c-muted);
		font-size: 0.9rem;
		cursor: pointer;
		line-height: 1;
		padding: 0.2rem 0.35rem;
		border-radius: 3px;
		transition:
			color 120ms,
			background 120ms;
	}

	.btn-dismiss:hover {
		color: var(--c-text);
		background: rgba(255, 255, 255, 0.08);
	}

	.game-over-winner {
		font-family: var(--font);
		font-size: 1.5rem;
		font-weight: bold;
	}

	.game-over-winner.red {
		color: var(--c-red);
	}
	.game-over-winner.blue {
		color: var(--c-blue);
	}

	.btn-restart {
		padding: 0.4rem 1.2rem;
		border-radius: var(--radius);
		border: 1px solid var(--c-border);
		background: var(--c-accent-bg);
		color: white;
		font-family: var(--font);
		cursor: pointer;
		font-size: 0.88rem;
		transition: background 120ms;
	}

	.btn-restart:hover {
		background: #2a5a9a;
	}

	/* ── Move log sidebar ────────────────────────────── */
	.move-log {
		width: 250px;
		background: var(--c-bg);
		border: 1px solid var(--c-border);
		border-radius: var(--radius);
		padding: 0.5rem 0.6rem;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.log-title {
		margin: 0 0 0.35rem;
		font-size: 0.68rem;
		font-family: var(--font);
		color: #9cdcfe;
		text-transform: uppercase;
		letter-spacing: 0.07em;
		flex-shrink: 0;
	}

	.move-log ul {
		margin: 0;
		padding: 0;
		list-style: none;
		overflow-y: auto;
		flex: 1;
	}

	.move-log li {
		cursor: default;
		border-radius: 3px;
		padding: 1px 3px;
		font-size: 0.73rem;
		font-family: var(--font);
		transition: background 80ms;
		color: var(--c-text);
	}

	.move-log li:hover {
		background: rgba(255, 255, 255, 0.06);
	}
	.move-log li.highlighted {
		background: rgba(255, 255, 255, 0.13);
		color: white;
	}
	.move-log li.log-red {
		color: #ff8a80;
	}
	.move-log li.log-blue {
		color: #82b1ff;
	}
	.move-log li.log-win {
		color: var(--c-win);
		font-weight: bold;
	}
	.move-log li.log-full {
		color: var(--c-muted);
	}
</style>
