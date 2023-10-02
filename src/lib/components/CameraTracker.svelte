<script lang="ts">
	import {
		DrawingUtils,
		FilesetResolver,
		GestureRecognizer,
		type GestureRecognizerResult
	} from '@mediapipe/tasks-vision';
	import { createEventDispatcher } from 'svelte';

	export let gestures: GestureRecognizerResult | null = null;

	let curGesture: string | null = null;

	let video: HTMLVideoElement | null = null;
	let canvas: HTMLCanvasElement | null = null;
	$: canvasCtx = canvas != null ? canvas.getContext('2d') : null;
	$: drawingUtil = canvasCtx != null ? new DrawingUtils(canvasCtx) : null;

	let loading = false;
	let startedSetup = false;
	let webcamRunning = false;

	let gestureRecognizer: GestureRecognizer | null = null;
	let lastVideoTime = -1;

	const dispatch = createEventDispatcher();

	const setup = async () => {
		if (video == null) return;
		try {
			loading = true;
			const stream = await navigator.mediaDevices.getUserMedia({
				video: true
			});
			video.srcObject = stream;
			video.play();
			loading = false;
		} catch (error) {
			console.error(error);
		}

		await new Promise<void>((resolve) => {
			video!.addEventListener('loadedmetadata', () => {
				resolve();
			});
		});

		// Create the hand landmarker.
		await createGestureRecognizer();
	};
	$: {
		if (!startedSetup && canvas != null && video != null && !webcamRunning) {
			startedSetup = true;
			setup().then(() => {
				canvas!.setAttribute('width', `${video!.videoWidth}`);
				canvas!.setAttribute('height', `${video!.videoHeight}`);

				webcamRunning = true;
				predictWebcam();
			});
		}
	}

	const createGestureRecognizer = async () => {
		const vision = await FilesetResolver.forVisionTasks(
			'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
		);
		gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
			baseOptions: {
				modelAssetPath:
					'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task',
				delegate: 'GPU'
			},
			runningMode: 'VIDEO'
		});
	};

	async function predictWebcam() {
		if (
			video == null ||
			canvas == null ||
			gestureRecognizer == null ||
			canvasCtx == null ||
			drawingUtil == null
		)
			return;

		// Now let's start detecting the stream.
		if (video.videoHeight != 0) {
			let startTimeMs = performance.now();
			if (lastVideoTime !== video.currentTime) {
				lastVideoTime = video.currentTime;
				gestures = gestureRecognizer.recognizeForVideo(video, startTimeMs);
			}
			if (gestures == null) return;
			canvasCtx.save();
			canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
			if (gestures.landmarks) {
				for (const landmarks of gestures.landmarks) {
					drawingUtil.drawConnectors(landmarks, GestureRecognizer.HAND_CONNECTIONS, {
						color: '#00FF00',
						lineWidth: 2
					});
					drawingUtil.drawLandmarks(landmarks, { color: '#0000AA', lineWidth: 1 });
				}
			}
			canvasCtx.restore();
		}

		const gesture = gestures?.gestures?.[0]?.[0];
		if (curGesture != gesture?.categoryName && gesture?.categoryName != 'None' && gesture != null) {
			curGesture = gesture.categoryName;
			dispatch('gesture_change', curGesture);
		}

		// Call this function again to keep predicting when the browser is ready.
		if (webcamRunning === true) {
			window.requestAnimationFrame(predictWebcam);
		}
	}
</script>

<div class="flex w-full flex-row items-center">
	{#if loading}
		<h1>loading..</h1>
	{/if}
	<div class="relative w-full">
		<!-- svelte-ignore a11y-media-has-caption -->
		<video
			class="flip-x absolute left-1/2 top-0 h-screen"
			id="webcam"
			autoplay
			playsinline
			bind:this={video}
		/>
		<canvas bind:this={canvas} id="output_canvas" class="flip-x absolute left-1/2 top-0 h-screen" />
	</div>
</div>

<style>
	.flip-x {
		-webkit-transform: scaleX(-1) translateX(50%);
		transform: scaleX(-1) translateX(50%);
	}
</style>
