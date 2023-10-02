<script lang="ts">
	import CameraTracker from '$lib/components/CameraTracker.svelte';
	import { clickOutside } from '$lib/components/clickOutside';
	import {
		queryLightGroups,
		queryScenes,
		updateLightGroupMutation,
		type Scene
	} from '$lib/queries/lightGroupQueries';
	import { createSettingsStore, type Gesture } from '$lib/stores/settingsStore';
	import type { GestureRecognizerResult } from '@mediapipe/tasks-vision';
	import { Dialog, DialogOverlay, DialogTitle, Switch } from '@rgossiaux/svelte-headlessui';

	const settings = createSettingsStore();

	$: groups = queryLightGroups($settings.hubIp, $settings.hubUsername);
	const updateLightGroup = updateLightGroupMutation();

	$: scenes = queryScenes($settings.hubIp, $settings.hubUsername);

	const GESTURES: string[] = [
		'None',
		'Closed_Fist',
		'Open_Palm',
		'Pointing_Up',
		'Thumb_Down',
		'Thumb_Up',
		'Victory',
		'ILoveYou'
	];
	const DISPLAY_GESTURES: Record<string, string> = {
		None: 'None',
		Closed_Fist: 'Fist',
		Open_Palm: 'Open Palm',
		Pointing_Up: 'Pointing Up',
		Thumb_Down: 'Thumb Down',
		Thumb_Up: 'Thumb Up',
		Victory: 'Victory',
		ILoveYou: 'I Love You'
	};
	const GESTURE_EMOJI_MAP: Record<string, string> = {
		None: ' ',
		Closed_Fist: '✊',
		Open_Palm: '🖐️',
		Pointing_Up: '☝️',
		Thumb_Down: '👎',
		Thumb_Up: '👍',
		Victory: '✌️',
		ILoveYou: '🤟'
	};
	function changeGroupScene(select: EventTarget | null, gesture: string) {
		if (select == null || $settings.selectedGroup == null) return;

		settings.setGroupGestureScene(
			$settings.selectedGroup,
			gesture,
			(select as HTMLInputElement).value
		);
	}

	let on = false;

	let gestures: GestureRecognizerResult | null = null;

	let curGesture: string | null = null;
	let curScene: Scene | null = null;

	let settingsOpen = false;
	$: {
		if ($settings.hubIp == null || $settings.hubUsername == null || $groups.isError) {
			settingsOpen = true;
		}
	}
	$: {
		if ($settings.hubIp == null || $settings.hubUsername == null) {
			settingsOpen = true;
		}
	}
	function updateGesture(gestureCategory: string | null) {
		if (gestureCategory == null || $settings.selectedGroup == null) return;
		curGesture = gestureCategory;
		if (on) {
			if ($settings.selectedGroup != null) {
				const scene =
					$settings.groupGestureSceneMap[$settings.selectedGroup][gestureCategory as Gesture] ||
					null;
				if (scene == null) {
					curScene = null;
					return;
				}
				curScene = ($scenes.data || {})[scene];

				$updateLightGroup.mutate([
					[{ groupId: +$settings.selectedGroup, action: { scene } }],
					$settings.hubIp,
					$settings.hubUsername
				]);
				return;
			}
		}
	}

	// Filter all the scenes to only the ones in the selected group.
	$: groupScenes = Object.fromEntries(
		Object.entries($scenes.data || {}).filter(([_, scene]) => {
			return `${scene.group}` === $settings.selectedGroup;
		})
	);

	$: gestureSceneMap =
		$settings.selectedGroup != null && $settings.groupGestureSceneMap != null
			? $settings.groupGestureSceneMap[$settings.selectedGroup] || {}
			: {};

	function handleWindowKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			settingsOpen = false;
		}
	}
	window.addEventListener('keydown', handleWindowKeyDown);
</script>

<div class="flex h-screen w-full flex-row">
	<div class="absolute h-screen w-full">
		<CameraTracker bind:gestures on:gesture_change={(e) => updateGesture(e.detail)} />
	</div>

	<div class="absolute m-4 flex flex-col">
		{#if $groups.data == null}
			<div>Loading...</div>
		{:else}
			<div class="mb-2 flex flex-row">
				<div class="w-24 text-white">Enable</div>
				<Switch bind:checked={on} class={on ? 'switch switch-enabled' : 'switch switch-disabled'}>
					<span class="sr-only">Enable</span>
					<span class="toggle" />
				</Switch>
			</div>
			<button class="mt-4 w-36 rounded bg-neutral-400 py-2" on:click={() => (settingsOpen = true)}
				>Settings</button
			>
		{/if}
	</div>
	<div
		class="absolute bottom-0 left-1/2 z-40 flex -translate-x-1/2 -translate-y-1/4 flex-col items-center rounded-md text-white opacity-80"
	>
		<div class="flex flex-row">
			<div class="w-64">
				<div class="mb-4 text-xl text-neutral-300">Gesture</div>
				{#if curGesture != null}
					<div class="text-4xl text-violet-400">
						{DISPLAY_GESTURES[curGesture]}
					</div>
				{:else}
					<div class="text-4xl text-neutral-400">No gesture</div>
				{/if}
			</div>
			<div class="w-64">
				<div class="mb-4 text-xl text-neutral-300">Scene</div>
				<div class="h-16 text-4xl text-violet-400">
					{#if curScene?.name != null}
						{curScene?.name}
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

<Dialog
	class="absolute left-1/2 top-1/2 z-40 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 opacity-90"
	bind:open={settingsOpen}
>
	<DialogOverlay />

	<div use:clickOutside={() => (settingsOpen = false)}>
		<DialogTitle class="mb-8 text-2xl">
			<div>Settings</div>
			<div class="text-sm font-light">Settings are saved in your browser.</div>
		</DialogTitle>

		<div class="flex flex-col gap-y-8">
			<div class="flex w-full flex-col gap-y-2">
				<div class="mb-2 flex flex-row gap-x-32">
					<div class="flex flex-col">
						<div class="w-64 font-medium">Hue Bridge IP Address</div>
					</div>
					<div class="font-light">
						<input bind:value={$settings.hubIp} type="text" placeholder="192.168.1.1" />
					</div>
				</div>
				<div class="mb-2 flex flex-row gap-x-32">
					<div class="flex flex-col">
						<div class="w-64 font-medium">Hue Username</div>
					</div>
					<div class="font-light">
						<input type="text" bind:value={$settings.hubUsername} placeholder="my_hue_app" />
					</div>
				</div>
				<div class="w-96">
					<a class="text-blue-600" href="https://developers.meethue.com/develop/get-started-2/"
						>Philips Hue Documentation</a
					>
				</div>
			</div>
			{#if $groups.error != null}
				<div>
					<div class="text-red-500">{$groups.error}</div>
					<div>Check the IP address and username and try again.</div>
				</div>
			{/if}
			{#if $groups.isFetching}
				Loading...
			{/if}
			{#if $settings.hubIp != null && $settings.hubUsername != null && $groups.error == null && !$groups.isFetching}
				<div class="mb-2 flex flex-row gap-x-32">
					<div class="w-64 font-medium">Hue Light Group</div>
					<div class="font-light">
						<select bind:value={$settings.selectedGroup}>
							{#each Object.entries($groups.data || []) as [id, group]}
								<option value={id}>{group.name}</option>
							{/each}
						</select>
					</div>
				</div>

				<div class="flex flex-col gap-y-2">
					<div class="mb-2 font-medium">Gesture to Hue scene map</div>
					{#each GESTURES as gesture}
						<div class="flex flex-row gap-x-32 font-light">
							<div class="flex w-64 flex-row">
								<div class="mr-4 w-12 whitespace-pre text-3xl">{GESTURE_EMOJI_MAP[gesture]}</div>
								{DISPLAY_GESTURES[gesture]}
							</div>
							<div>
								<select
									value={gestureSceneMap[gesture] || 'null'}
									on:change={(e) => changeGroupScene(e.target, gesture)}
								>
									<option value="null">None</option>
									{#each Object.entries(groupScenes) as [id, scene]}
										<option value={id}>{scene.name}</option>
									{/each}
								</select>
							</div>
						</div>
					{/each}
				</div>
				<button class="rounded bg-teal-300 py-4" on:click={() => (settingsOpen = false)}
					>Close</button
				>
			{/if}
		</div>
	</div>
</Dialog>

<style lang="postcss">
	:global(.switch) {
		position: relative;
		display: inline-flex;
		align-items: center;
		border-radius: 9999px;
		height: 1.5rem;
		width: 2.75rem;
	}

	:global(.switch-enabled) {
		/* Blue */
		background-color: rgb(50 150 200);
		/* @apply bg-red; */
	}

	:global(.switch-disabled) {
		/* Gray */
		background-color: rgb(229 231 235);
	}

	.toggle {
		display: inline-block;
		width: 1rem;
		height: 1rem;
		background-color: rgb(255 255 255);
		border-radius: 9999px;
	}

	:global(.switch.switch-enabled .toggle) {
		transform: translateX(1.5rem);
	}

	:global(.switch.switch-disabled .toggle) {
		transform: translateX(0.25rem);
	}
</style>
