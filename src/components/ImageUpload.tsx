import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Camera, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { loadModels, detectFace } from '../utils/faceDetection';

export function ImageUpload() {
  const { setOriginalImage, setFaceDetection, setDetectionError, setIsProcessing } = useAppStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const processImage = useCallback(async (file: File) => {
    setIsLoading(true);
    setLoadingMessage('Loading AI models...');
    setIsProcessing(true);

    try {
      // Load models first
      await loadModels();

      setLoadingMessage('Processing image...');

      // Create image element
      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
      });

      setLoadingMessage('Detecting face...');

      // Detect face
      const detection = await detectFace(img);

      if (!detection) {
        setDetectionError('No face detected. Please use a clear photo with a visible face.');
        setIsLoading(false);
        setIsProcessing(false);
        return;
      }

      if (detection.confidence < 0.7) {
        setDetectionError('Face detection confidence is low. Try using a clearer photo.');
      } else {
        setDetectionError(null);
      }

      // Convert to base64 for storage
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const base64 = canvas.toDataURL('image/jpeg', 0.9);

      setOriginalImage(base64);
      setFaceDetection(detection);
    } catch (error) {
      console.error('Error processing image:', error);
      setDetectionError(error instanceof Error ? error.message : 'Failed to process image');
    } finally {
      setIsLoading(false);
      setIsProcessing(false);
      setLoadingMessage('');
    }
  }, [setOriginalImage, setFaceDetection, setDetectionError, setIsProcessing]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      processImage(file);
    }
  }, [processImage]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  }, [processImage]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 1280, height: 720 }
      });
      setStream(mediaStream);
      setShowCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Failed to access camera:', error);
      setDetectionError('Failed to access camera. Please ensure camera permissions are granted.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
        processImage(file);
        stopCamera();
      }
    }, 'image/jpeg', 0.9);
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {showCamera ? (
          <motion.div
            key="camera"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-2xl overflow-hidden bg-black"
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full aspect-[4/3] object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={stopCamera}
                  className="p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                >
                  <X className="w-6 h-6" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={capturePhoto}
                  className="p-4 rounded-full bg-white text-gray-900 shadow-lg"
                >
                  <Camera className="w-8 h-8" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="glass-card p-12 flex flex-col items-center justify-center gap-4"
          >
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 animate-pulse" />
              <Loader2 className="w-8 h-8 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />
            </div>
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">{loadingMessage}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">This may take a few moments...</p>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`glass-card p-8 border-2 border-dashed transition-all duration-300 ${
              isDragging
                ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/20'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            <div className="flex flex-col items-center gap-6">
              <motion.div
                animate={{ y: isDragging ? -10 : 0 }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/30"
              >
                <ImageIcon className="w-10 h-10 text-white" />
              </motion.div>

              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Upload Your Photo
                </h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                  Drag and drop an image or use the buttons below to get started
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary flex items-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  <span>Choose File</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={startCamera}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Camera className="w-5 h-5" />
                  <span>Use Camera</span>
                </motion.button>
              </div>

              <p className="text-xs text-gray-400 dark:text-gray-500">
                Supported formats: JPG, PNG, WebP • Max size: 10MB
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
