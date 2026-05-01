<script>
	let { id, color } = $props();
</script>

<div
	{id}
	class="main slot"
	class:empty={!color}
	class:red={color === 'red'}
	class:blue={color === 'blue'}
>
	<div id={id + '-content'} class="slot circle content"></div>
</div>

<style>
	.main.slot {
		width: 60px;
		height: 60px;
		background-color: #eeff00;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.circle {
		width: 50px;
		height: 50px;
		background-color: white;
		border-radius: 50%;
	}
	.circle:hover {
		background-color: #cccccc;
	}
	.main.slot.red .circle {
		background-color: red;
	}
	.main.slot.blue .circle {
		background-color: blue;
	}
</style>
