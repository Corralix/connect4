<script>
	let { col, row, color } = $props();
</script>

<div class="piece {color}" style="left:{col * 60 + 5}px; top:{row * 60 + 5}px;"></div>

<style>
	.piece {
		position: absolute;
		width: 50px;
		height: 50px;
		border-radius: 50%;
	}
	.piece.red {
		background: red;
	}
	.piece.blue {
		background: blue;
	}
</style>
