import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Crown, Zap, Star, Sparkles } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { UserSubscription } from '../types';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: '',
    description: 'Try out the basics',
    icon: Sparkles,
    features: [
      '3 transformations per day',
      'Basic nose shapes',
      'Comparison view',
      'Standard quality export',
      'Watermarked images',
    ],
    notIncluded: [
      'Premium nose shapes',
      'HD export',
      'Save history',
      'Priority processing',
    ],
    buttonText: 'Current Plan',
    disabled: true,
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    period: '/month',
    description: 'For occasional use',
    icon: Zap,
    features: [
      '20 transformations per day',
      'All nose shapes',
      'Comparison view',
      'HD export',
      'No watermarks',
      'Save history (30 days)',
    ],
    notIncluded: [
      'Priority processing',
    ],
    buttonText: 'Get Basic',
    popular: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 19.99,
    period: '/month',
    description: 'Best value',
    icon: Star,
    features: [
      'Unlimited transformations',
      'All nose shapes',
      'Comparison view',
      'HD export',
      'No watermarks',
      'Save history (1 year)',
      'Priority processing',
    ],
    notIncluded: [],
    buttonText: 'Get Premium',
    popular: true,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 49.99,
    period: '/month',
    description: 'For clinics & professionals',
    icon: Crown,
    features: [
      'Everything in Premium',
      'API access',
      'White-label exports',
      'Bulk processing',
      'Dedicated support',
      'Custom integrations',
    ],
    notIncluded: [],
    buttonText: 'Contact Sales',
  },
];

export function PricingModal({ isOpen, onClose }: PricingModalProps) {
  const { subscription, setSubscription } = useAppStore();

  const handleSelectPlan = (planId: string) => {
    // In a real app, this would open a payment flow
    // For demo purposes, we'll just set the subscription
    const newSubscription: UserSubscription = {
      tier: planId as UserSubscription['tier'],
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      features: {
        maxTransformationsPerDay: planId === 'free' ? 3 : planId === 'basic' ? 20 : Infinity,
        watermarkFree: planId !== 'free',
        hdExport: planId !== 'free',
        allNoseShapes: planId !== 'free',
        comparisonView: true,
        saveHistory: planId !== 'free',
        priority: planId === 'premium' || planId === 'professional',
      },
    };

    setSubscription(newSubscription);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-5xl md:w-full z-50 overflow-auto"
          >
            <div className="glass-card p-6 md:p-8 min-h-full md:min-h-0">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Choose Your Plan
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Unlock the full potential of NoseShape Tester
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Plans grid */}
              <div className="grid md:grid-cols-4 gap-6">
                {plans.map((plan, index) => {
                  const Icon = plan.icon;
                  const isCurrentPlan = subscription.tier === plan.id;

                  return (
                    <motion.div
                      key={plan.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`relative rounded-2xl p-6 transition-all ${
                        plan.popular
                          ? 'bg-gradient-to-br from-primary-500 to-accent-500 text-white scale-105 shadow-xl shadow-primary-500/30'
                          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-400 text-amber-900 text-xs font-bold">
                          MOST POPULAR
                        </div>
                      )}

                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                        plan.popular
                          ? 'bg-white/20'
                          : 'bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30'
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          plan.popular ? 'text-white' : 'text-primary-600 dark:text-primary-400'
                        }`} />
                      </div>

                      <h3 className={`text-xl font-bold ${
                        plan.popular ? 'text-white' : 'text-gray-900 dark:text-white'
                      }`}>
                        {plan.name}
                      </h3>

                      <p className={`text-sm mt-1 ${
                        plan.popular ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'
                      }`}>
                        {plan.description}
                      </p>

                      <div className="mt-4 mb-6">
                        <span className={`text-3xl font-bold ${
                          plan.popular ? 'text-white' : 'text-gray-900 dark:text-white'
                        }`}>
                          ${plan.price}
                        </span>
                        <span className={`text-sm ${
                          plan.popular ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {plan.period}
                        </span>
                      </div>

                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2">
                            <Check className={`w-5 h-5 flex-shrink-0 ${
                              plan.popular ? 'text-white' : 'text-green-500'
                            }`} />
                            <span className={`text-sm ${
                              plan.popular ? 'text-white/90' : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {feature}
                            </span>
                          </li>
                        ))}
                        {plan.notIncluded.map((feature) => (
                          <li key={feature} className="flex items-start gap-2 opacity-50">
                            <X className={`w-5 h-5 flex-shrink-0 ${
                              plan.popular ? 'text-white/50' : 'text-gray-400'
                            }`} />
                            <span className={`text-sm line-through ${
                              plan.popular ? 'text-white/50' : 'text-gray-400 dark:text-gray-500'
                            }`}>
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <button
                        onClick={() => handleSelectPlan(plan.id)}
                        disabled={isCurrentPlan || plan.disabled}
                        className={`w-full py-3 rounded-xl font-semibold transition-all ${
                          plan.popular
                            ? 'bg-white text-primary-600 hover:bg-gray-100'
                            : isCurrentPlan
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:from-primary-600 hover:to-accent-600'
                        }`}
                      >
                        {isCurrentPlan ? 'Current Plan' : plan.buttonText}
                      </button>
                    </motion.div>
                  );
                })}
              </div>

              {/* Footer */}
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
                All plans include a 7-day money-back guarantee. Cancel anytime.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
