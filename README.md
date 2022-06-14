# vision-camera-plugin-capture

A tiny [VisionCamera](https://mrousavy.com/react-native-vision-camera/) Frame Processor Plugin to capture a video frame.

- JPEG/PNG format
- Currently, supports **iOS only**

## Installation

```sh
npm install vision-camera-plugin-capture
```

## Setup

Frame Processors require [react-native-reanimated](https://docs.swmansion.com/react-native-reanimated/) 2.2.0 or higher. Also make sure to add

```js
import 'react-native-reanimated';
```

to the top of the file when using `useFrameProcessor`.

Add this to your `babel.config.js`.

```js
[
  'react-native-reanimated/plugin',
  {
    globals: ['__captureVideoFrame'],
  },
];
```

## Usage

```js
import 'react-native-reanimated';
import { useFrameProcessor } from 'react-native-vision-camera';
import { captureVideoFrame } from 'vision-camera-plugin-capture';

// ...

const frameProcessor = useFrameProcessor((frame) => {
  'worklet';
  const value = captureVideoFrame(frame, {
    format: 'JPEG',
  });

  if (value) {
    console.log(value.base64);
  }
}, []);
```

## License

MIT
