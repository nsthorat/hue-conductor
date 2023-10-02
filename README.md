# Philips Hue Conductor

The Philips Hue Conductor is an app that lets you control Hue lights from a webcam with hand-gestures, using the [MediaPipe hand gesture library](https://developers.google.com/mediapipe/solutions/vision/gesture_recognizer).

https://github.com/nsthorat/hue-conductor/assets/1100749/b2b8c32f-9e2c-40cb-8c13-e922ba63ffd9

## Running the webserver

```sh
bunx hue-conductor
```

or

```sh
npx hue-conductor
```

## Philips Hue Bridge IP and Username

[Detailed documentation on finding your Hue Bridge](https://developers.meethue.com/develop/get-started-2/)

You will need both the IP, and the username that you create via the '/api' request outlined in the docs above.

## Controlling the lights

Before you can begin controlling lights, you must create two things from the Philips Hue app:

1. A group of lights. I only allow controlling groups to control latency.
2. Scenes for groups you want to control. Just like groups, I only allow controlling scenes to control latency.

Once you do this, in settings you can map each of the gestures to a scene:

7 gestures from MediaPipe gesture recognition:

```
None
Closed_Fist: ✊
Open_Palm: 🖐️,
Pointing_Up: ☝️
Thumb_Down: 👎
Thumb_Up: 👍
Victory: ✌️
ILoveYou: '🤟
```

<img width="800" alt="image" src="https://github.com/nsthorat/hue-conductor/assets/1100749/14e29bb6-ab36-4fb5-a410-03c82e001523">

## Caveats

This currently will only work from localhost or 127.0.0.1 as it requires a non-https request to a local IP address.

## Developing

```bash
bun install

bun run dev -- --open
```
