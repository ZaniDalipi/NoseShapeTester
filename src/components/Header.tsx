import { motion } from 'framer-motion';
import { Sun, Moon, Monitor, Crown, Sparkles } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useAppStore } from '../store/useAppStore';

export function Header() {
  const { theme, cycleTheme } = useTheme();
  const { subscription, transformationsToday } = useAppStore();

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="w-5 h-5" />;
      case 'dark':
        return <Moon className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  const remainingTransformations = subscription.features.maxTransformationsPerDay - transformationsToday;
  const isPremium = subscription.tier !== 'free';

  return (
    <header className="glass-card sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gradient">NoseShape</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">AI Surgery Preview</p>
            </div>
          </motion.div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Usage indicator */}
            {!isPremium && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800"
              >
                <div className="flex gap-1">
                  {[...Array(subscription.features.maxTransformationsPerDay)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        i < remainingTransformations
                          ? 'bg-primary-500'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {remainingTransformations} left today
                </span>
              </motion.div>
            )}

            {/* Premium badge or upgrade button */}
            {isPremium ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-semibold premium-shine"
              >
                <Crown className="w-4 h-4" />
                <span>{subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)}</span>
              </motion.div>
            ) : (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white text-sm font-semibold shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-shadow"
              >
                <Crown className="w-4 h-4" />
                <span className="hidden sm:inline">Upgrade</span>
              </motion.button>
            )}

            {/* Theme toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={cycleTheme}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={`Theme: ${theme}`}
            >
              {getThemeIcon()}
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  );
}
