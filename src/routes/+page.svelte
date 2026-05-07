<script>
	import { Board } from "$lib";
</script>

<svelte:head>
	<title>Connect 4</title>
</svelte:head>

<main>
	<h1>Connect 4</h1>
	<Board />
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 2rem 1rem 4rem;
		gap: 1.5rem;
	}

	h1 {
		margin: 0;
		font-size: 2rem;
		letter-spacing: 0.04em;
		color: #eeff00;
		text-shadow: 0 0 24px rgba(238, 255, 0, 0.25);
	}
</style>
