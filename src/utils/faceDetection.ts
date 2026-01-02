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

export async function detectFace(imageElement: HTMLImageElement | HTMLCanvasElement): Promise<FaceDetectionResult | null> {
  if (!modelsLoaded) {
    await loadModels();
  }

  const detection = await faceapi
    .detectSingleFace(imageElement, new faceapi.TinyFaceDetectorOptions({
      inputSize: 512,
      scoreThreshold: 0.5,
    }))
    .withFaceLandmarks();

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

  const faceLandmarks: FaceLandmarks = {
    nose: extractPoints(27, 35),
    leftEye: extractPoints(36, 41),
    rightEye: extractPoints(42, 47),
    jawline: extractPoints(0, 16),
    leftEyebrow: extractPoints(17, 21),
    rightEyebrow: extractPoints(22, 26),
    mouth: extractPoints(48, 67),
  };

  const box = detection.detection.box;

  return {
    landmarks: faceLandmarks,
    boundingBox: {
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
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
