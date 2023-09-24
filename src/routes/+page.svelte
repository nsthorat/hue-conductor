<script lang="ts">
	import BrightnessSlider from '$lib/components/BrightnessSlider.svelte';
	import CameraTracker from '$lib/components/CameraTracker.svelte';
	import Switch from '$lib/components/ui/switch/switch.svelte';
	import {
		queryLightGroups,
		updateLightGroupMutation,
		type GroupAction
	} from '$lib/queries/lightGroupQueries';
	import type { GestureRecognizerResult } from '@mediapipe/tasks-vision';
	import { onMount } from 'svelte';

	const groups = queryLightGroups();
	const updateLightGroup = updateLightGroupMutation();

	let lightId: string | null = null;

	// Important keypoints
	// 0: the bottom part of wrist
	// 8: tip of index finger.
	const INDEX_FINGER_IDX = 8;

	$: console.log('groups', $groups.data);

	let groupToggles: { [key: number]: boolean } = { 83: true };
	$: groupsOn = Object.entries(groupToggles)
		.filter(([id, on]) => on)
		.map(([id, on]) => id);

	let inited = true;
	$: {
		if (!inited) {
			if (lightId == null && $groups.data != null) {
				lightId = Object.keys($groups.data)[0];
				let first = true;
				for (const id in $groups.data) {
					groupToggles[id] = first;
					first = false;
				}
			}
			inited = true;
		}
	}
	$: console.log('TOGGLES', groupToggles);

	let on = true;

	let gestures: GestureRecognizerResult | null = null;

	function setLightGroupBrightness(id: number, bri: number) {
		const lightUpdate = { groupId: +id, action: { bri } };
		$updateLightGroup.mutate([[lightUpdate]]);
	}

	// function setLightGroupHueSaturationBrightness(
	// 	id: number,
	// 	hue: number,
	// 	saturation: number,
	// 	brightness: number
	// ) {
	// 	$updateLightGroup.mutate([+id, { hue, sat: saturation, bri: brightness }]);
	// }

	function update() {
		if (!on || groupsOn.length === 0) return;
		console.log(',,,updatng');
		const landmark =
			gestures?.landmarks != null && gestures?.landmarks.length > 0 ? gestures.landmarks[0] : null;
		if (landmark != null && landmark?.length > 0) {
			const updates = groupsOn
				.map((id) => {
					const hue = Math.floor(
						256 * 256 * Math.min(Math.max(1 - landmark[INDEX_FINGER_IDX].x, 0), 1)
					);
					const sat = 255;
					const lightness = Math.floor(
						256 * Math.min(Math.max(1 - landmark[INDEX_FINGER_IDX].y, 0), 1)
					);

					let on: boolean | undefined = undefined;
					const action: Partial<GroupAction> = {};
					if (curGesture === 'Closed_Fist') {
						on = false;
					} else if (curGesture === 'Open_Palm') {
						on = true;
					}
					if (on) {
						action.bri = lightness;
						action.sat = sat;
						action.hue = hue;
						action.on = true;
					}
					console.log('g = ', curGesture, action);

					return {
						groupId: +id,
						action
					};
				})
				.filter((i) => i.action.bri != null);
			console.log('UPDATING FROM FINGER', updates);
			$updateLightGroup.mutate([updates]);
		}
	}
	onMount(() => {
		setInterval(() => {
			update();
		}, 1000);
	});

	// $: console.log(gestures);
	// $: console.log('GESTURE=', curGesture);
	let curGesture: string | null = null;

	$: console.log('new gestury cateogyr:', curGesture);

	function updateGesture(gestureCategory: string | null) {
		if (gestureCategory == null) return;
		curGesture = gestureCategory;
		if (on) {
			if (groupsOn.length > 0) {
				console.log('UPDATING FROM FIST--------');

				if (gestureCategory === 'Closed_Fist') {
					//Object.keys($groups.data || {}).forEach((id) => {
					// setLightGroupBrightness(+id, 0);
					// setLightGroupOn(+id, false);
					const lightUpdates = groupsOn.map((i) => {
						return { groupId: +i, action: { on: false } };
					});
					console.log([$updateLightGroup]);
					// $updateLightGroup.mutate([{ updates: [{ groupId: 83, action: { on: false } }] }]);
					$updateLightGroup.mutate([lightUpdates]);
					//});
				} else if (gestureCategory === 'Open_Palm') {
					//Object.keys($groups.data || {}).forEach((id) => {
					// setLightGroupBrightness(+id, 255);
					// setLightGroupOn(+id, true);
					const lightUpdates = groupsOn.map((i) => {
						return { groupId: +i, action: { on: true } };
					});
					$updateLightGroup.mutate([lightUpdates]);
				}
			}
		}
	}
</script>

<div class="flex flex-row">
	<div class="flex flex-col m-4">
		{#if $groups.data == null}
			<div>Loading...</div>
		{:else}
			<div class="flex flex-row mb-2">
				<div class="w-40">Enable</div>
				<Switch bind:checked={on} />
			</div>

			<!-- {#each Object.entries({}) as [id, group]} -->
			{#each Object.entries($groups.data) as [id, group]}
				<div class="flex flex-row">
					{(console.log(`${group.action.bri}`), '')}
					<div>{id}</div>
					<div class="w-40">{group.name}</div>
					<div class="w-96">
						{#key id}
							<BrightnessSlider
								{group}
								on:change={(e) => {
									setLightGroupBrightness(+id, e.detail);
								}}
							/>
						{/key}
					</div>
					<div>
						<Switch bind:checked={groupToggles[id]} />
					</div>
				</div>
			{/each}
		{/if}
	</div>

	<CameraTracker bind:gestures on:gesture_change={(e) => updateGesture(e.detail)} />
</div>

{curGesture}
