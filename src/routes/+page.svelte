<script>
	import { Board } from '$lib';
</script>

<svelte:head>
	<title>Connect4</title>
</svelte:head>

<h1 id="title">Connect 4</h1>
<p>
	Connect 4 is a two-player connection game in which the players first choose a color and then take
	turns dropping colored discs from the top into a seven-column, six-row vertically suspended grid.
	The pieces fall straight down, occupying the lowest available space within the column. The
	objective of the game is to be the first to form a horizontal, vertical, or diagonal line of four
	of one's own discs. Connect 4 is a solved game. The first player can always win by playing the
	right moves.
</p>
<div class="game-container"></div>
<Board />
