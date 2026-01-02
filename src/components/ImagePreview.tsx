import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeftRight,
  Columns,
  Layers,
  Download,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { getMorphingEngine } from '../utils/noseMorphing';

export function ImagePreview() {
  const {
    originalImage,
    processedImage,
    setProcessedImage,
    faceDetection,
    detectionError,
    customParameters,
    subscription,
    isProcessing,
    setIsProcessing,
    showComparison,
    setShowComparison,
    comparisonMode,
    setComparisonMode,
    transformationsToday,
    setOriginalImage,
  } = useAppStore();

  const [sliderPosition, setSliderPosition] = useState(50);
  const [zoom, setZoom] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const canTransform = subscription.features.maxTransformationsPerDay > transformationsToday;
  const addWatermark = !subscription.features.watermarkFree;

  // Generate transformed image when parameters change
  const generateTransformation = useCallback(async () => {
    if (!originalImage || !faceDetection || isProcessing) return;

    setIsGenerating(true);
    setIsProcessing(true);

    try {
      // Create image element from original
      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = originalImage;
      });

      const engine = getMorphingEngine();
      const result = await engine.morphNose(
        img,
        faceDetection.landmarks,
        customParameters,
        addWatermark
      );

      setProcessedImage(result);
      setShowComparison(true);
    } catch (error) {
      console.error('Transformation error:', error);
    } finally {
      setIsGenerating(false);
      setIsProcessing(false);
    }
  }, [originalImage, faceDetection, customParameters, addWatermark, isProcessing, setProcessedImage, setShowComparison, setIsProcessing]);

  // Handle slider drag
  const handleSliderMove = useCallback((clientX: number) => {
    if (!containerRef.current || !isDragging.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    handleSliderMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleSliderMove(e.touches[0].clientX);
  };

  // Download result
  const handleDownload = () => {
    if (!processedImage) return;

    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `noseshape-result-${Date.now()}.jpg`;
    link.click();
  };

  if (!originalImage) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          {/* Comparison mode buttons */}
          {processedImage && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setComparisonMode('slider')}
                className={`p-2 rounded-lg transition-colors ${
                  comparisonMode === 'slider'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
                title="Slider comparison"
              >
                <ArrowLeftRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setComparisonMode('side-by-side')}
                className={`p-2 rounded-lg transition-colors ${
                  comparisonMode === 'side-by-side'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
                title="Side by side"
              >
                <Columns className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setComparisonMode('overlay')}
                className={`p-2 rounded-lg transition-colors ${
                  comparisonMode === 'overlay'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                }`}
                title="Overlay toggle"
              >
                <Layers className="w-5 h-5" />
              </motion.button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
          >
            <ZoomOut className="w-5 h-5" />
          </motion.button>
          <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setZoom(Math.min(3, zoom + 0.25))}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
          >
            <ZoomIn className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Error/Warning display */}
      {detectionError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border ${
            faceDetection
              ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}
        >
          <div className="flex items-start gap-3">
            <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              faceDetection ? 'text-amber-500' : 'text-red-500'
            }`} />
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                faceDetection
                  ? 'text-amber-700 dark:text-amber-300'
                  : 'text-red-700 dark:text-red-300'
              }`}>
                {detectionError}
              </p>
              {!faceDetection && (
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                  <p className="font-medium">Tips for better results:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li>Use a clear, front-facing photo</li>
                    <li>Ensure good lighting on your face</li>
                    <li>Avoid tilting your head too much</li>
                    <li>Make sure your full face is visible</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* No detection guidance */}
      {!faceDetection && !detectionError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
        >
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Processing your image... If face detection fails, try uploading a clearer front-facing photo.
          </p>
        </motion.div>
      )}

      {/* Image container */}
      <div
        ref={containerRef}
        className="relative glass-card overflow-hidden rounded-2xl"
        style={{ aspectRatio: '4/3' }}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchStart={handleMouseDown}
        onTouchEnd={handleMouseUp}
      >
        <div
          className="absolute inset-0 flex items-center justify-center overflow-hidden"
          style={{ transform: `scale(${zoom})` }}
        >
          {/* Original image */}
          <img
            src={originalImage}
            alt="Original"
            className="w-full h-full object-contain"
          />

          {/* Processed image with comparison */}
          {processedImage && showComparison && (
            <>
              {comparisonMode === 'slider' && (
                <div
                  className="absolute inset-0"
                  style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                >
                  <img
                    src={processedImage}
                    alt="Transformed"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {comparisonMode === 'overlay' && (
                <motion.img
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  src={processedImage}
                  alt="Transformed"
                  className="absolute inset-0 w-full h-full object-contain"
                />
              )}
            </>
          )}

          {/* Slider handle */}
          {processedImage && showComparison && comparisonMode === 'slider' && (
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize z-10"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
                <ArrowLeftRight className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          )}
        </div>

        {/* Labels */}
        {processedImage && showComparison && comparisonMode === 'slider' && (
          <>
            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm font-medium">
              Before
            </div>
            <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm font-medium">
              After
            </div>
          </>
        )}

        {/* Loading overlay */}
        {isGenerating && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
              <p className="text-white font-medium">Applying transformation...</p>
            </div>
          </div>
        )}
      </div>

      {/* Side by side view */}
      {processedImage && showComparison && comparisonMode === 'side-by-side' && (
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card overflow-hidden rounded-xl">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
              Before
            </div>
            <img src={originalImage} alt="Original" className="w-full" />
          </div>
          <div className="glass-card overflow-hidden rounded-xl">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 text-center text-sm font-medium text-primary-600 dark:text-primary-400">
              After
            </div>
            <img src={processedImage} alt="Transformed" className="w-full" />
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={generateTransformation}
          disabled={!canTransform || isGenerating || !faceDetection}
          className="btn-primary flex items-center gap-2"
        >
          {isGenerating ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <RefreshCw className="w-5 h-5" />
          )}
          <span>Apply Changes</span>
        </motion.button>

        {processedImage && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleDownload}
            className="btn-secondary flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            <span>Download</span>
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setOriginalImage(null)}
          className="btn-secondary"
        >
          New Photo
        </motion.button>
      </div>

      {!canTransform && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-amber-600 dark:text-amber-400"
        >
          You've reached today's limit. Upgrade for unlimited transformations!
        </motion.p>
      )}
    </div>
  );
}
