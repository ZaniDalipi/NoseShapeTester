import type { FaceDetectionResult, NoseParameters } from '../types';
import { getNoseDimensions, getInterPupillaryDistance } from './faceDetection';

interface FaceAnalysis {
  faceShape: 'oval' | 'round' | 'square' | 'heart' | 'oblong';
  faceWidth: number;
  faceHeight: number;
  noseToFaceRatio: number;
  currentNoseWidth: number;
  currentNoseLength: number;
  symmetryScore: number;
  eyeDistance: number;
}

interface NoseRecommendation {
  shape: string;
  reason: string;
  confidence: number;
  parameters: NoseParameters;
}

/**
 * Analyze facial features to determine face shape and proportions
 */
function analyzeFace(detection: FaceDetectionResult): FaceAnalysis {
  const { landmarks, boundingBox } = detection;
  const jawline = landmarks.jawline;
  const leftEye = landmarks.leftEye;
  const rightEye = landmarks.rightEye;
  const nose = landmarks.nose;

  // Calculate face dimensions
  const faceWidth = boundingBox.width;
  const faceHeight = boundingBox.height;
  const aspectRatio = faceHeight / faceWidth;

  // Get eye distance (inter-pupillary distance)
  const eyeDistance = getInterPupillaryDistance(landmarks);

  // Get nose dimensions
  const noseDims = getNoseDimensions(landmarks);
  const noseToFaceRatio = noseDims.width / faceWidth;

  // Calculate jaw width (bottom of face)
  const jawWidth = Math.abs(jawline[jawline.length - 1].x - jawline[0].x);

  // Calculate cheekbone width (middle of jawline)
  const midJawIndex = Math.floor(jawline.length / 2);
  const cheekboneWidth = Math.abs(jawline[midJawIndex + 3]?.x - jawline[midJawIndex - 3]?.x) || jawWidth * 0.9;

  // Calculate forehead width (approximate from eye positions)
  const foreheadWidth = Math.abs(rightEye[3].x - leftEye[0].x) * 1.3;

  // Determine face shape based on proportions
  let faceShape: FaceAnalysis['faceShape'] = 'oval';

  if (aspectRatio > 1.4) {
    faceShape = 'oblong';
  } else if (aspectRatio < 1.1) {
    faceShape = 'round';
  } else if (jawWidth > cheekboneWidth * 0.95) {
    faceShape = 'square';
  } else if (foreheadWidth > jawWidth * 1.2) {
    faceShape = 'heart';
  } else {
    faceShape = 'oval';
  }

  // Calculate symmetry score based on nose alignment
  const noseTip = nose[3];
  const faceCenter = boundingBox.x + boundingBox.width / 2;
  const noseOffset = Math.abs(noseTip.x - faceCenter);
  const symmetryScore = Math.max(0, 1 - (noseOffset / (boundingBox.width * 0.1)));

  return {
    faceShape,
    faceWidth,
    faceHeight,
    noseToFaceRatio,
    currentNoseWidth: noseDims.width,
    currentNoseLength: noseDims.height,
    symmetryScore,
    eyeDistance,
  };
}

/**
 * Generate personalized nose parameters based on face analysis
 */
function generateOptimalParameters(analysis: FaceAnalysis): NoseParameters {
  const params: NoseParameters = {
    bridgeWidth: 0,
    bridgeHeight: 0,
    tipSize: 0,
    tipRotation: 0,
    nostrilWidth: 0,
    nostrilFlare: 0,
    length: 0,
    symmetry: 0,
  };

  // Adjust based on face shape
  switch (analysis.faceShape) {
    case 'round':
      // For round faces: longer, narrower nose to elongate
      params.bridgeWidth = -0.2;
      params.bridgeHeight = 0.15;
      params.tipSize = -0.15;
      params.length = 0.05;
      params.nostrilWidth = -0.15;
      break;

    case 'square':
      // For square faces: softer curves, slight upturn
      params.bridgeWidth = -0.15;
      params.bridgeHeight = 0.1;
      params.tipRotation = 0.1;
      params.tipSize = -0.1;
      params.nostrilFlare = -0.1;
      break;

    case 'oblong':
      // For oblong faces: slightly wider, shorter nose
      params.bridgeWidth = -0.05;
      params.bridgeHeight = 0;
      params.length = -0.1;
      params.tipSize = -0.05;
      params.tipRotation = 0.05;
      break;

    case 'heart':
      // For heart faces: delicate, balanced proportions
      params.bridgeWidth = -0.2;
      params.bridgeHeight = 0.05;
      params.tipSize = -0.15;
      params.tipRotation = 0.15;
      params.nostrilWidth = -0.1;
      break;

    case 'oval':
    default:
      // For oval faces: subtle refinement
      params.bridgeWidth = -0.1;
      params.bridgeHeight = 0.1;
      params.tipSize = -0.1;
      params.tipRotation = 0.05;
      params.nostrilWidth = -0.1;
      break;
  }

  // Adjust for nose-to-face ratio
  if (analysis.noseToFaceRatio > 0.25) {
    // Nose is wide relative to face
    params.bridgeWidth -= 0.1;
    params.nostrilWidth -= 0.1;
  } else if (analysis.noseToFaceRatio < 0.18) {
    // Nose is narrow relative to face - less reduction
    params.bridgeWidth = Math.max(params.bridgeWidth + 0.1, 0);
    params.nostrilWidth = Math.max(params.nostrilWidth + 0.1, 0);
  }

  // Apply symmetry correction based on current symmetry
  if (analysis.symmetryScore < 0.9) {
    params.symmetry = 0.3 + (1 - analysis.symmetryScore) * 0.5;
  }

  return params;
}

/**
 * Get the best matching preset shape name
 */
function getBestPresetMatch(params: NoseParameters): { name: string; reason: string } {
  const shapes = [
    {
      name: 'Natural Refined',
      match: Math.abs(params.bridgeWidth + 0.15) < 0.1 && Math.abs(params.tipRotation - 0.05) < 0.1,
      reason: 'Enhances your natural features with subtle refinement',
    },
    {
      name: 'Classic Elegance',
      match: Math.abs(params.bridgeWidth + 0.2) < 0.1 && params.tipRotation > 0.05 && params.tipRotation < 0.15,
      reason: 'Timeless proportions that complement your face shape',
    },
    {
      name: 'Straight Profile',
      match: Math.abs(params.tipRotation) < 0.05 && params.bridgeHeight > 0.1,
      reason: 'A clean, defined profile that balances your features',
    },
    {
      name: 'Upturned Tip',
      match: params.tipRotation > 0.15,
      reason: 'Adds a youthful, refreshed appearance to your look',
    },
    {
      name: 'Slim Profile',
      match: params.bridgeWidth < -0.25 && params.nostrilWidth < -0.2,
      reason: 'Creates a more refined, slender appearance',
    },
    {
      name: 'Button Nose',
      match: params.length < -0.15 && params.tipRotation > 0.2,
      reason: 'A petite, cute nose that softens your features',
    },
  ];

  // Find best match
  for (const shape of shapes) {
    if (shape.match) {
      return { name: shape.name, reason: shape.reason };
    }
  }

  // Default recommendation
  return {
    name: 'Natural Refined',
    reason: 'A balanced enhancement that works beautifully with your unique features',
  };
}

/**
 * Analyze face and recommend the best nose shape
 */
export function analyzeAndRecommendNose(detection: FaceDetectionResult): NoseRecommendation {
  const analysis = analyzeFace(detection);
  const parameters = generateOptimalParameters(analysis);
  const { name, reason } = getBestPresetMatch(parameters);

  // Calculate confidence based on face detection quality and symmetry
  const confidence = Math.min(
    detection.confidence,
    analysis.symmetryScore * 0.9 + 0.1
  );

  return {
    shape: name,
    reason: `${reason}. Based on your ${analysis.faceShape} face shape.`,
    confidence,
    parameters,
  };
}

/**
 * Get face shape description for display
 */
export function getFaceShapeDescription(detection: FaceDetectionResult): string {
  const analysis = analyzeFace(detection);

  const descriptions: Record<FaceAnalysis['faceShape'], string> = {
    oval: 'Your oval face shape is considered ideal with balanced proportions.',
    round: 'Your round face has soft angles and similar width and length.',
    square: 'Your square face has a strong jawline with angular features.',
    heart: 'Your heart-shaped face has a wider forehead and narrower chin.',
    oblong: 'Your oblong face is longer than it is wide with balanced features.',
  };

  return descriptions[analysis.faceShape];
}
