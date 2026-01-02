export interface NoseShape {
  id: string;
  name: string;
  description: string;
  category: 'natural' | 'refined' | 'dramatic';
  isPremium: boolean;
  parameters: NoseParameters;
  thumbnail: string;
}

export interface NoseParameters {
  bridgeWidth: number;      // -1 to 1: narrower to wider
  bridgeHeight: number;     // -1 to 1: lower to higher
  tipSize: number;          // -1 to 1: smaller to larger
  tipRotation: number;      // -1 to 1: down to up
  nostrilWidth: number;     // -1 to 1: narrower to wider
  nostrilFlare: number;     // -1 to 1: less to more flare
  length: number;           // -1 to 1: shorter to longer
  symmetry: number;         // 0 to 1: correction amount
}

export interface FaceDetectionResult {
  landmarks: FaceLandmarks;
  boundingBox: BoundingBox;
  confidence: number;
}

export interface FaceLandmarks {
  nose: Point[];
  leftEye: Point[];
  rightEye: Point[];
  jawline: Point[];
  leftEyebrow: Point[];
  rightEyebrow: Point[];
  mouth: Point[];
}

export interface Point {
  x: number;
  y: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface UserSubscription {
  tier: 'free' | 'basic' | 'premium' | 'professional';
  expiresAt?: Date;
  features: SubscriptionFeatures;
}

export interface SubscriptionFeatures {
  maxTransformationsPerDay: number;
  watermarkFree: boolean;
  hdExport: boolean;
  allNoseShapes: boolean;
  comparisonView: boolean;
  saveHistory: boolean;
  priority: boolean;
}

export interface TransformationHistory {
  id: string;
  originalImage: string;
  transformedImage: string;
  noseShape: NoseShape;
  customParameters: NoseParameters;
  createdAt: Date;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppState {
  // Image state
  originalImage: string | null;
  processedImage: string | null;
  isProcessing: boolean;

  // Face detection
  faceDetection: FaceDetectionResult | null;
  detectionError: string | null;

  // Nose customization
  selectedNoseShape: NoseShape | null;
  customParameters: NoseParameters;

  // UI state
  showComparison: boolean;
  comparisonMode: 'slider' | 'side-by-side' | 'overlay';

  // User & subscription
  subscription: UserSubscription;
  transformationsToday: number;

  // Theme
  theme: ThemeMode;

  // History
  history: TransformationHistory[];
}
