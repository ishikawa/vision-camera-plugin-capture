#import "VisionCameraPluginCapture.h"
#import <VideoToolbox/VideoToolbox.h>
#import <VisionCamera/Frame.h>
#import <VisionCamera/FrameProcessorPlugin.h>

@implementation VisionCameraPluginCapture

static inline id captureVideoFrame(Frame *frame, NSArray *arguments) {
  // Options
  NSDictionary *options = arguments[0];
  NSString *mediaFormat = options[@"format"] ? options[@"format"] : @"JPEG";
  NSNumber *compressionQuality =
      options[@"quality"] ? options[@"quality"] : @(0.5f);

  // Capture video frame
  CVPixelBufferRef pixelBuffer = CMSampleBufferGetImageBuffer(frame.buffer);
  CGImageRef videoFrameImage = NULL;

  {
    CVPixelBufferLockBaseAddress(pixelBuffer, kCVPixelBufferLock_ReadOnly);

    const OSStatus status = VTCreateCGImageFromCVPixelBuffer(pixelBuffer, NULL, &videoFrameImage);

    CVPixelBufferUnlockBaseAddress(pixelBuffer, kCVPixelBufferLock_ReadOnly);

    if (status != errSecSuccess) {
      return [NSNull null];
    }
  }

  // Rasterize
  UIImage *img = [UIImage imageWithCGImage:videoFrameImage];
  NSData *bitmapRep =
      [mediaFormat isEqualToString:@"JPEG"]
          ? UIImageJPEGRepresentation(img, [compressionQuality floatValue])
          : UIImagePNGRepresentation(img);
  NSString *base64 = [bitmapRep base64EncodedStringWithOptions:0];

  CGImageRelease(videoFrameImage);

  return @{
    @"width" : @(CGImageGetWidth(videoFrameImage)),
    @"height" : @(CGImageGetHeight(videoFrameImage)),
    @"base64" : base64,
    @"size" : @([bitmapRep length]),
  };
}

VISION_EXPORT_FRAME_PROCESSOR(captureVideoFrame)

@end
