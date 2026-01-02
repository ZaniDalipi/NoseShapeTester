import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './components/Header';
import { ImageUpload } from './components/ImageUpload';
import { NoseShapeSelector } from './components/NoseShapeSelector';
import { ParameterControls } from './components/ParameterControls';
import { ImagePreview } from './components/ImagePreview';
import { PricingModal } from './components/PricingModal';
import { useAppStore } from './store/useAppStore';
import { useTheme } from './hooks/useTheme';
import { Sparkles, Shield, Zap, Heart } from 'lucide-react';

function App() {
  const { originalImage, faceDetection } = useAppStore();
  const [showPricing, setShowPricing] = useState(false);
  useTheme(); // Initialize theme

  const hasImage = !!originalImage;
  const hasDetection = !!faceDetection;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {!hasImage ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* Hero Section */}
              <section className="text-center pt-8 pb-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                    Visualize Your
                    <span className="text-gradient block">Perfect Nose</span>
                  </h1>
                  <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-8">
                    Advanced AI-powered nose surgery preview. See realistic results before making any decisions.
                    Try different shapes and find what suits you best.
                  </p>
                </motion.div>

                <ImageUpload />
              </section>

              {/* Features Section */}
              <section className="py-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center mb-12"
                >
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Why Choose NoseShape Tester?
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                    Our advanced technology provides the most realistic nose surgery previews available
                  </p>
                </motion.div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      icon: Sparkles,
                      title: 'AI-Powered',
                      description: 'Advanced face detection and morphing algorithms for realistic results',
                    },
                    {
                      icon: Zap,
                      title: 'Instant Preview',
                      description: 'See transformations in real-time with our fast processing engine',
                    },
                    {
                      icon: Shield,
                      title: 'Private & Secure',
                      description: 'Your photos are processed locally and never stored on our servers',
                    },
                    {
                      icon: Heart,
                      title: 'Easy to Use',
                      description: 'Simple interface with presets and fine-tuning controls',
                    },
                  ].map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="glass-card p-6 card-hover"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mb-4">
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {feature.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* How It Works */}
              <section className="py-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-center mb-12"
                >
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    How It Works
                  </h2>
                </motion.div>

                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    { step: '1', title: 'Upload Photo', description: 'Take a selfie or upload a clear front-facing photo' },
                    { step: '2', title: 'Choose Style', description: 'Select from preset nose shapes or customize parameters' },
                    { step: '3', title: 'Compare Results', description: 'View before/after comparison and download your preview' },
                  ].map((item, index) => (
                    <motion.div
                      key={item.step}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="text-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-4 shadow-lg shadow-primary-500/30">
                        {item.step}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* CTA Section */}
              <section className="py-12">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="glass-card p-8 md:p-12 text-center bg-gradient-to-r from-primary-500/10 to-accent-500/10 border border-primary-200 dark:border-primary-800"
                >
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    Ready to See Your Transformation?
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-xl mx-auto">
                    Upload your photo now and explore different nose shapes with our AI-powered preview tool.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
                    className="btn-primary text-lg px-8 py-4"
                  >
                    Get Started Free
                  </motion.button>
                </motion.div>
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="editor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid lg:grid-cols-3 gap-8"
            >
              {/* Left sidebar - Shape selection */}
              <div className="lg:col-span-1 space-y-6">
                <div className="glass-card p-6">
                  <NoseShapeSelector />
                </div>

                {hasDetection && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6"
                  >
                    <ParameterControls />
                  </motion.div>
                )}
              </div>

              {/* Main content - Image preview (sticky) */}
              <div className="lg:col-span-2 lg:self-start lg:sticky lg:top-24">
                <div className="glass-card p-6">
                  <ImagePreview />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-gray-800 dark:text-gray-200">NoseShape Tester</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <button
                onClick={() => setShowPricing(true)}
                className="hover:text-primary-500 transition-colors"
              >
                Pricing
              </button>
              <a href="#" className="hover:text-primary-500 transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary-500 transition-colors">Terms</a>
              <a href="#" className="hover:text-primary-500 transition-colors">Contact</a>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-500">
              © 2025 NoseShape Tester. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Pricing Modal */}
      <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} />
    </div>
  );
}

export default App;
