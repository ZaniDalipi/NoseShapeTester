import { motion } from 'framer-motion';
import { Lock, Check, Sparkles } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { getShapesByCategory } from '../utils/noseShapes';
import type { NoseShape } from '../types';

const categories = [
  { id: 'natural', label: 'Natural', description: 'Subtle enhancements' },
  { id: 'refined', label: 'Refined', description: 'Elegant adjustments' },
  { id: 'dramatic', label: 'Dramatic', description: 'Bold transformations' },
] as const;

export function NoseShapeSelector() {
  const { selectedNoseShape, setSelectedNoseShape, subscription } = useAppStore();
  const canAccessPremium = subscription.features.allNoseShapes;

  const handleSelect = (shape: NoseShape) => {
    if (shape.isPremium && !canAccessPremium) {
      // Show upgrade prompt
      return;
    }
    setSelectedNoseShape(shape);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Sparkles className="w-6 h-6 text-primary-500" />
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          Choose Your Look
        </h2>
      </div>

      {categories.map((category, categoryIndex) => (
        <motion.div
          key={category.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: categoryIndex * 0.1 }}
          className="space-y-3"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                {category.label}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {category.description}
              </p>
            </div>
            {category.id === 'dramatic' && !canAccessPremium && (
              <span className="text-xs px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-medium">
                Premium
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {getShapesByCategory(category.id).map((shape, index) => {
              const isSelected = selectedNoseShape?.id === shape.id;
              const isLocked = shape.isPremium && !canAccessPremium;

              return (
                <motion.button
                  key={shape.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: categoryIndex * 0.1 + index * 0.05 }}
                  whileHover={{ scale: isLocked ? 1 : 1.02 }}
                  whileTap={{ scale: isLocked ? 1 : 0.98 }}
                  onClick={() => handleSelect(shape)}
                  disabled={isLocked}
                  className={`relative p-4 rounded-xl text-left transition-all duration-200 ${
                    isSelected
                      ? 'bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/30'
                      : isLocked
                      ? 'bg-gray-100 dark:bg-gray-800/50 opacity-60 cursor-not-allowed'
                      : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/80 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-2xl">{shape.thumbnail}</span>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center"
                      >
                        <Check className="w-3 h-3" />
                      </motion.div>
                    )}
                    {isLocked && (
                      <Lock className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <h4 className={`font-semibold mt-2 ${
                    isSelected ? 'text-white' : 'text-gray-800 dark:text-gray-200'
                  }`}>
                    {shape.name}
                  </h4>
                  <p className={`text-xs mt-1 line-clamp-2 ${
                    isSelected ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {shape.description}
                  </p>

                  {isLocked && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-gray-900/20 to-transparent pointer-events-none" />
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
