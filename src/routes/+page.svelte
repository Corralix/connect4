<script>
	import { Board } from "$lib";
</script>

<svelte:head>
	<title>Connect4</title>
</svelte:head>

<h1 id="title">Connect 4</h1>
<div class="game-container">
	<Board />
</div>

<style>
	:root {
		font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
		background-color: #525252;
	}
	.game-container {
		display: flex;
		justify-content: center;
		margin-top: 2rem;
	}
</style>
