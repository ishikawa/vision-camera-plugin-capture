import type { Frame } from 'react-native-vision-camera';

export type CaptureResult = {
  /**
   * Base64-encoded string of the captured image. If you prepend this with
   * 'data:image/jpeg;base64,' to create a data URI, you can use it as
   * the source of an `Image` component.
   */
  base64: string;
  /**
   * Width of the image.
   */
  width: number;
  /**
   * Height of the image.
   */
  height: number;
  /**
   * The bytes length of the image.
   */
  size: number;
};

export type CaptureOptions = {
  format: 'JPEG' | 'PNG';
  /**
   * The quality of the resulting JPEG image, expressed as a value from
   * 0.0 to 1.0. The value 0.0 represents the maximum compression (or
   * lowest quality) while the value 1.0 represents the least compression
   * (or best quality).
   *
   * - For JPEG only.
   * - Default: 0.5
   */
  quality?: number;
};

/**
 * Captures video frame as JPEG/PNG and encode it with base64 encoding.
 *
 * @param frame Camera frame
 * @param options options
 * @returns Capture result. Returns `null` if there was unexpected error or
 *          frame processor took too long to execute.
 */
export function captureVideoFrame(
  frame: Frame,
  options: CaptureOptions = { format: 'JPEG' }
): CaptureResult | null {
  'worklet';
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return __captureVideoFrame(frame, options);
}
