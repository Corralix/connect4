<script>
	let {
		id,
		color,
		animationKey = 0,
		fallingColor = null,
		fallDelay = 0,
		isLanding = false,
		landingDelay = 0
	} = $props();

	let circleEl = $state(null);

	$effect(() => {
		const _key = animationKey;
		if (!circleEl) return;

		if (fallingColor) {
			circleEl.style.setProperty('--falling-color', fallingColor);
			circleEl.style.setProperty('--fall-delay', `${fallDelay}ms`);
			circleEl.classList.remove('falling');
			void circleEl.offsetWidth;
			circleEl.classList.add('falling');
		}

		if (isLanding) {
			circleEl.style.setProperty('--landing-color', color);
			circleEl.style.setProperty('--landing-delay', `${landingDelay}ms`);
			circleEl.classList.remove('landing');
			void circleEl.offsetWidth;
			circleEl.classList.add('landing');
		}
	});
</script>

<div
	{id}
	class="main slot"
	class:empty={!color}
	class:red={color === 'red'}
	class:blue={color === 'blue'}
>
	<div
		bind:this={circleEl}
		id={id + '-content'}
		class="slot circle content"
		onanimationend={(e) => e.currentTarget.classList.remove('falling', 'landing')}
	></div>
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

	@keyframes fall-through {
		0% {
			background-color: white;
		}
		25% {
			background-color: var(--falling-color, gray);
		}
		75% {
			background-color: var(--falling-color, gray);
		}
		100% {
			background-color: white;
		}
	}

	@keyframes land-bounce {
		0% {
			transform: translateY(0);
			background-color: white;
		}
		20% {
			transform: translateY(6px);
			background-color: var(--landing-color, gray);
		}
		42% {
			transform: translateY(-5px);
			background-color: var(--landing-color, gray);
		}
		62% {
			transform: translateY(3px);
			background-color: var(--landing-color, gray);
		}
		78% {
			transform: translateY(-2px);
			background-color: var(--landing-color, gray);
		}
		90% {
			transform: translateY(1px);
			background-color: var(--landing-color, gray);
		}
		100% {
			transform: translateY(0);
			background-color: var(--landing-color, gray);
		}
	}

	.circle:global(.falling) {
		animation: fall-through 100ms ease-in-out;
		animation-delay: var(--fall-delay, 0ms);
	}

	.circle:global(.landing) {
		animation: land-bounce 420ms cubic-bezier(0.36, 0.07, 0.19, 0.97);
		animation-delay: var(--landing-delay, 0ms);
		animation-fill-mode: both;
	}
</style>
