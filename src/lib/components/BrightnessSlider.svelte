<script lang="ts">
	import type { Group } from 'bits-ui/dist/bits/context-menu';
	import { createEventDispatcher } from 'svelte';

	export let group: Group;

	let value = group.action.bri;

	const dispatch = createEventDispatcher();

	function change() {
		dispatch('change', value);
	}
</script>

<input class="w-full" type="range" bind:value min="0" max="255" step="1" on:change={change} />
