import * as faceapi from '@vladmandic/face-api';
import type { FaceDetectionResult, FaceLandmarks, Point } from '../types';

let modelsLoaded = false;
let loadingPromise: Promise<void> | null = null;

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model';

export async function loadModels(): Promise<void> {
  if (modelsLoaded) return;

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      ]);
      modelsLoaded = true;
    } catch (error) {
      loadingPromise = null;
      throw new Error('Failed to load face detection models. Please check your internet connection.');
    }
  })();

  return loadingPromise;
}

export function isModelsLoaded(): boolean {
  return modelsLoaded;
}

/**
 * Resize image if too large for better detection
 */
function resizeImageIfNeeded(
  imageElement: HTMLImageElement | HTMLCanvasElement,
  maxSize: number = 1024
): HTMLCanvasElement {
  const width = imageElement instanceof HTMLImageElement ? imageElement.naturalWidth : imageElement.width;
  const height = imageElement instanceof HTMLImageElement ? imageElement.naturalHeight : imageElement.height;

  // If image is small enough, just draw it to a canvas
  if (width <= maxSize && height <= maxSize) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(imageElement, 0, 0);
    return canvas;
  }

  // Calculate new dimensions maintaining aspect ratio
  const scale = maxSize / Math.max(width, height);
  const newWidth = Math.round(width * scale);
  const newHeight = Math.round(height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = newWidth;
  canvas.height = newHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(imageElement, 0, 0, newWidth, newHeight);

  return canvas;
}

/**
 * Scale landmarks back to original image size
 */
function scaleLandmarks(landmarks: FaceLandmarks, scale: number): FaceLandmarks {
  const scalePoints = (points: Point[]): Point[] =>
    points.map(p => ({ x: p.x / scale, y: p.y / scale }));

  return {
    nose: scalePoints(landmarks.nose),
    leftEye: scalePoints(landmarks.leftEye),
    rightEye: scalePoints(landmarks.rightEye),
    jawline: scalePoints(landmarks.jawline),
    leftEyebrow: scalePoints(landmarks.leftEyebrow),
    rightEyebrow: scalePoints(landmarks.rightEyebrow),
    mouth: scalePoints(landmarks.mouth),
  };
}

export async function detectFace(imageElement: HTMLImageElement | HTMLCanvasElement): Promise<FaceDetectionResult | null> {
  if (!modelsLoaded) {
    await loadModels();
  }

  const originalWidth = imageElement instanceof HTMLImageElement ? imageElement.naturalWidth : imageElement.width;

  // Resize for better detection
  const resizedCanvas = resizeImageIfNeeded(imageElement, 800);
  const scale = resizedCanvas.width / originalWidth;

  // Try TinyFaceDetector first with lower threshold
  let detection = await faceapi
    .detectSingleFace(resizedCanvas, new faceapi.TinyFaceDetectorOptions({
      inputSize: 416,
      scoreThreshold: 0.3,
    }))
    .withFaceLandmarks();

  // If TinyFaceDetector fails, try with different input size
  if (!detection) {
    detection = await faceapi
      .detectSingleFace(resizedCanvas, new faceapi.TinyFaceDetectorOptions({
        inputSize: 608,
        scoreThreshold: 0.2,
      }))
      .withFaceLandmarks();
  }

  // If still no detection, try SSD MobileNet (slower but more accurate)
  if (!detection) {
    detection = await faceapi
      .detectSingleFace(resizedCanvas, new faceapi.SsdMobilenetv1Options({
        minConfidence: 0.2,
      }))
      .withFaceLandmarks();
  }

  if (!detection) {
    return null;
  }

  const landmarks = detection.landmarks;
  const positions = landmarks.positions;

  // Extract specific landmark groups
  // Face-api.js 68-point landmark indices:
  // Nose: 27-35 (bridge: 27-30, tip: 30-35)
  // Left eye: 36-41
  // Right eye: 42-47
  // Jawline: 0-16
  // Left eyebrow: 17-21
  // Right eyebrow: 22-26
  // Mouth: 48-67

  const extractPoints = (start: number, end: number): Point[] => {
    const points: Point[] = [];
    for (let i = start; i <= end; i++) {
      const pos = positions[i];
      points.push({ x: pos.x, y: pos.y });
    }
    return points;
  };

  let faceLandmarks: FaceLandmarks = {
    nose: extractPoints(27, 35),
    leftEye: extractPoints(36, 41),
    rightEye: extractPoints(42, 47),
    jawline: extractPoints(0, 16),
    leftEyebrow: extractPoints(17, 21),
    rightEyebrow: extractPoints(22, 26),
    mouth: extractPoints(48, 67),
  };

  // Scale landmarks back to original image size if we resized
  if (scale !== 1) {
    faceLandmarks = scaleLandmarks(faceLandmarks, scale);
  }

  const box = detection.detection.box;

  return {
    landmarks: faceLandmarks,
    boundingBox: {
      x: box.x / scale,
      y: box.y / scale,
      width: box.width / scale,
      height: box.height / scale,
    },
    confidence: detection.detection.score,
  };
}

// Get nose center point for transformations
export function getNoseCenter(landmarks: FaceLandmarks): Point {
  const nose = landmarks.nose;
  const tipIndex = 3; // Index 30 in original 68-point is tip, index 3 in our subset
  return nose[tipIndex] || nose[Math.floor(nose.length / 2)];
}

// Get nose dimensions for scaling calculations
export function getNoseDimensions(landmarks: FaceLandmarks): { width: number; height: number } {
  const nose = landmarks.nose;

  // Calculate width from leftmost to rightmost nostril points
  const xValues = nose.map(p => p.x);
  const yValues = nose.map(p => p.y);

  const width = Math.max(...xValues) - Math.min(...xValues);
  const height = Math.max(...yValues) - Math.min(...yValues);

  return { width, height };
}

// Calculate inter-pupillary distance for normalization
export function getInterPupillaryDistance(landmarks: FaceLandmarks): number {
  const leftEye = landmarks.leftEye;
  const rightEye = landmarks.rightEye;

  // Get center of each eye
  const leftCenter = {
    x: leftEye.reduce((sum, p) => sum + p.x, 0) / leftEye.length,
    y: leftEye.reduce((sum, p) => sum + p.y, 0) / leftEye.length,
  };

  const rightCenter = {
    x: rightEye.reduce((sum, p) => sum + p.x, 0) / rightEye.length,
    y: rightEye.reduce((sum, p) => sum + p.y, 0) / rightEye.length,
  };

  return Math.sqrt(
    Math.pow(rightCenter.x - leftCenter.x, 2) +
    Math.pow(rightCenter.y - leftCenter.y, 2)
  );
}
