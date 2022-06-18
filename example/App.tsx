import 'react-native-reanimated';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from 'react-native';
import {
  Camera,
  useCameraDevices,
  useFrameProcessor,
} from 'react-native-vision-camera';
import { captureVideoFrame, CaptureResult } from 'vision-camera-plugin-capture';
import { runOnJS, useSharedValue } from 'react-native-reanimated';
import RNFS from 'react-native-fs';

const App: React.FC = () => {
  const cameraDevices = useCameraDevices();
  const cameraDevice = cameraDevices.back;
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [, setCaptureResult] = useState<CaptureResult | null>(null);
  const [captureImagePath, setCaptureImagePath] = useState<string | null>(null);
  const disableCapture = useSharedValue(false);

  // Camera permission
  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.getCameraPermissionStatus();

      switch (cameraPermission) {
        case 'authorized':
          setHasCameraPermission(true);
          return;
        case 'denied':
        case 'restricted':
          Alert.alert(
            'Permission required',
            'The app does not have the permission to access camera. Please grant it.'
          );
          return;
      }

      const newCameraPermission = await Camera.requestCameraPermission();

      switch (newCameraPermission) {
        case 'authorized':
          setHasCameraPermission(true);
          return;
        case 'denied':
          Alert.alert(
            'Permission required',
            'The app does not have the permission to access camera. Please grant it.'
          );
          return;
      }
    })();
  }, []);

  const reenableCapture = useCallback(() => {
    setTimeout(() => {
      disableCapture.value = false;
    }, 1000);
  }, [disableCapture]);

  const onCapture = useCallback(async (result: CaptureResult) => {
    const filename = Math.floor(Math.random() * 1000) + '.jpg';
    const path = RNFS.TemporaryDirectoryPath + '/' + filename;

    await RNFS.writeFile(path, result.base64, 'base64');

    setCaptureImagePath(path);
    setCaptureResult(result);
  }, []);

  const frameProcessor = useFrameProcessor(
    (frame) => {
      'worklet';

      if (!disableCapture.value) {
        const value = captureVideoFrame(frame, {
          format: 'JPEG',
        });

        if (value) {
          // Disable capture a while to prevent too many updates.
          disableCapture.value = true;
          runOnJS(reenableCapture)();
          runOnJS(onCapture)(value);
        }
      }
    },
    [onCapture, reenableCapture]
  );

  return (
    <SafeAreaView style={styles.container}>
      {cameraDevice && hasCameraPermission ? (
        <Camera
          frameProcessor={frameProcessor}
          style={[styles.camera]}
          device={cameraDevice}
          isActive={true}
        >
          {captureImagePath && (
            // Displaying image from data uri causes HTTPS error :-(
            // `nil host used in call to allowsSpecificHTTPSCertificateForHost`
            /*
            <Image
              source={{ uri: 'data:image/jpeg;base64,' + captureResult.base64 }}
              style={styles.captureImage}
            />
            */
            <Image
              source={{ uri: captureImagePath }}
              style={styles.captureImage}
            />
          )}
        </Camera>
      ) : null}
      <StatusBar barStyle="default" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  captureImage: {
    position: 'absolute',
    width: '50%',
    height: '50%',
    right: 0,
    bottom: 0,
    borderWidth: 3,
    borderColor: 'white',
  },
});

export default App;
