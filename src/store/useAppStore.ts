import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  AppState,
  NoseShape,
  NoseParameters,
  FaceDetectionResult,
  ThemeMode,
  TransformationHistory,
  UserSubscription
} from '../types';

const defaultParameters: NoseParameters = {
  bridgeWidth: 0,
  bridgeHeight: 0,
  tipSize: 0,
  tipRotation: 0,
  nostrilWidth: 0,
  nostrilFlare: 0,
  length: 0,
  symmetry: 0,
};

const freeSubscription: UserSubscription = {
  tier: 'free',
  features: {
    maxTransformationsPerDay: 3,
    watermarkFree: false,
    hdExport: false,
    allNoseShapes: false,
    comparisonView: true,
    saveHistory: false,
    priority: false,
  },
};

interface AppActions {
  // Image actions
  setOriginalImage: (image: string | null) => void;
  setProcessedImage: (image: string | null) => void;
  setIsProcessing: (processing: boolean) => void;

  // Face detection
  setFaceDetection: (detection: FaceDetectionResult | null) => void;
  setDetectionError: (error: string | null) => void;

  // Nose customization
  setSelectedNoseShape: (shape: NoseShape | null) => void;
  setCustomParameters: (params: Partial<NoseParameters>) => void;
  resetParameters: () => void;

  // UI
  setShowComparison: (show: boolean) => void;
  setComparisonMode: (mode: 'slider' | 'side-by-side' | 'overlay') => void;

  // Subscription
  setSubscription: (subscription: UserSubscription) => void;
  incrementTransformations: () => void;
  resetDailyTransformations: () => void;

  // Theme
  setTheme: (theme: ThemeMode) => void;

  // History
  addToHistory: (entry: Omit<TransformationHistory, 'id' | 'createdAt'>) => void;
  clearHistory: () => void;

  // Reset
  resetAll: () => void;
}

const initialState: AppState = {
  originalImage: null,
  processedImage: null,
  isProcessing: false,
  faceDetection: null,
  detectionError: null,
  selectedNoseShape: null,
  customParameters: defaultParameters,
  showComparison: false,
  comparisonMode: 'slider',
  subscription: freeSubscription,
  transformationsToday: 0,
  theme: 'system',
  history: [],
};

export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set) => ({
      ...initialState,

      setOriginalImage: (image) => set({
        originalImage: image,
        processedImage: null,
        faceDetection: null,
        detectionError: null,
      }),

      setProcessedImage: (image) => set({ processedImage: image }),

      setIsProcessing: (processing) => set({ isProcessing: processing }),

      setFaceDetection: (detection) => set({ faceDetection: detection }),

      setDetectionError: (error) => set({ detectionError: error }),

      setSelectedNoseShape: (shape) => set({
        selectedNoseShape: shape,
        customParameters: shape?.parameters ?? defaultParameters,
      }),

      setCustomParameters: (params) => set((state) => ({
        customParameters: { ...state.customParameters, ...params },
      })),

      resetParameters: () => set({ customParameters: defaultParameters }),

      setShowComparison: (show) => set({ showComparison: show }),

      setComparisonMode: (mode) => set({ comparisonMode: mode }),

      setSubscription: (subscription) => set({ subscription }),

      incrementTransformations: () => set((state) => ({
        transformationsToday: state.transformationsToday + 1,
      })),

      resetDailyTransformations: () => set({ transformationsToday: 0 }),

      setTheme: (theme) => set({ theme }),

      addToHistory: (entry) => set((state) => ({
        history: [
          {
            ...entry,
            id: crypto.randomUUID(),
            createdAt: new Date(),
          },
          ...state.history.slice(0, 49), // Keep last 50
        ],
      })),

      clearHistory: () => set({ history: [] }),

      resetAll: () => set(initialState),
    }),
    {
      name: 'nose-shape-tester-storage',
      partialize: (state) => ({
        theme: state.theme,
        subscription: state.subscription,
        history: state.history,
        transformationsToday: state.transformationsToday,
      }),
    }
  )
);
