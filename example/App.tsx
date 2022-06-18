import 'react-native-reanimated';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  View,
  Image,
  Text,
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

const App: React.FC = () => {
  const cameraDevices = useCameraDevices();
  const cameraDevice = cameraDevices.back;
  const [hasCameraPermission, setHasCameraPermission] = useState(false);
  const [captureResult, setCaptureResult] = useState<CaptureResult | null>(
    null
  );
  const [captureCount, setCaptureCount] = useState<number>(0);

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
    setCaptureResult(result);
    setCaptureCount((n) => n + 1);
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
          {captureResult && (
            // Displaying image from data uri causes HTTPS error :-(
            // `nil host used in call to allowsSpecificHTTPSCertificateForHost`
            <View style={styles.captureImageContainer}>
              <Image
                source={{
                  uri: 'data:image/jpeg;base64,' + captureResult.base64,
                }}
                style={styles.captureImage}
              />
              <Text style={styles.captureCountText}>
                Captured {captureCount} times
              </Text>
            </View>
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
  captureImageContainer: {
    position: 'absolute',
    width: '50%',
    height: '50%',
    right: 0,
    bottom: 0,
    borderWidth: 3,
    borderColor: 'white',
    backgroundColor: 'black',
  },
  captureImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  captureCountText: {
    color: 'white',
    fontSize: 18,
    padding: 5,
  },
});

export default App;
