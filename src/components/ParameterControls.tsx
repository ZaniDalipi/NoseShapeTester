import { motion } from 'framer-motion';
import { Sliders, RotateCcw, Wand2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { NoseParameters } from '../types';

interface SliderConfig {
  key: keyof NoseParameters;
  label: string;
  description: string;
  icon: string;
}

const sliders: SliderConfig[] = [
  { key: 'bridgeWidth', label: 'Bridge Width', description: 'Narrower to wider', icon: '↔️' },
  { key: 'bridgeHeight', label: 'Bridge Height', description: 'Lower to higher', icon: '↕️' },
  { key: 'tipSize', label: 'Tip Size', description: 'Smaller to larger', icon: '🔘' },
  { key: 'tipRotation', label: 'Tip Rotation', description: 'Down to up', icon: '🔄' },
  { key: 'nostrilWidth', label: 'Nostril Width', description: 'Narrower to wider', icon: '👃' },
  { key: 'nostrilFlare', label: 'Nostril Flare', description: 'Less to more', icon: '🌸' },
  { key: 'length', label: 'Nose Length', description: 'Shorter to longer', icon: '📏' },
  { key: 'symmetry', label: 'Symmetry', description: 'Natural to corrected', icon: '⚖️' },
];

export function ParameterControls() {
  const { customParameters, setCustomParameters, resetParameters, subscription } = useAppStore();
  const isPremium = subscription.tier !== 'free';

  const handleChange = (key: keyof NoseParameters, value: number) => {
    setCustomParameters({ [key]: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sliders className="w-6 h-6 text-primary-500" />
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Fine-Tune
          </h2>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetParameters}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </motion.button>
      </div>

      {!isPremium && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
        >
          <Wand2 className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-700 dark:text-amber-300">
            Upgrade to Premium for unlimited fine-tuning and all nose shapes
          </p>
        </motion.div>
      )}

      <div className="space-y-4">
        {sliders.map((slider, index) => {
          const value = customParameters[slider.key];
          const isSymmetry = slider.key === 'symmetry';
          const min = isSymmetry ? 0 : -1;
          const max = 1;

          return (
            <motion.div
              key={slider.key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{slider.icon}</span>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {slider.label}
                  </label>
                </div>
                <span className="text-xs font-mono text-gray-500 dark:text-gray-400 tabular-nums">
                  {value >= 0 ? '+' : ''}{(value * 100).toFixed(0)}%
                </span>
              </div>

              <div className="relative">
                <input
                  type="range"
                  min={min}
                  max={max}
                  step={0.01}
                  value={value}
                  onChange={(e) => handleChange(slider.key, parseFloat(e.target.value))}
                  className="w-full"
                />

                {/* Center marker for non-symmetry sliders */}
                {!isSymmetry && (
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0.5 h-3 bg-gray-400 dark:bg-gray-500 pointer-events-none" />
                )}
              </div>

              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {slider.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
