<script>
	import favicon from "$lib/assets/favicon.svg";

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<style>
	:global(*, *::before, *::after) {
		box-sizing: border-box;
	}

	:global(body) {
		margin: 0;
		font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
		background-color: #2d2d2d;
		color: #d4d4d4;
		min-height: 100vh;
	}
</style>
