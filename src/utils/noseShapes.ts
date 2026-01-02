import type { NoseShape, NoseParameters } from '../types';

// Preset nose shapes with different characteristics
export const noseShapes: NoseShape[] = [
  // Natural Category - Free
  {
    id: 'natural-refined',
    name: 'Natural Refined',
    description: 'Subtle refinement maintaining your natural look',
    category: 'natural',
    isPremium: false,
    thumbnail: '👃',
    parameters: {
      bridgeWidth: -0.15,
      bridgeHeight: 0.1,
      tipSize: -0.1,
      tipRotation: 0.05,
      nostrilWidth: -0.1,
      nostrilFlare: -0.1,
      length: 0,
      symmetry: 0.3,
    },
  },
  {
    id: 'natural-subtle',
    name: 'Subtle Touch',
    description: 'Minimal changes for a fresher appearance',
    category: 'natural',
    isPremium: false,
    thumbnail: '✨',
    parameters: {
      bridgeWidth: -0.05,
      bridgeHeight: 0.05,
      tipSize: -0.05,
      tipRotation: 0.02,
      nostrilWidth: -0.05,
      nostrilFlare: -0.05,
      length: 0,
      symmetry: 0.2,
    },
  },

  // Refined Category - Mixed
  {
    id: 'refined-classic',
    name: 'Classic Elegance',
    description: 'Timeless, balanced proportions',
    category: 'refined',
    isPremium: false,
    thumbnail: '💎',
    parameters: {
      bridgeWidth: -0.2,
      bridgeHeight: 0.15,
      tipSize: -0.15,
      tipRotation: 0.1,
      nostrilWidth: -0.15,
      nostrilFlare: -0.15,
      length: -0.05,
      symmetry: 0.5,
    },
  },
  {
    id: 'refined-straight',
    name: 'Straight Profile',
    description: 'Clean, straight bridge with refined tip',
    category: 'refined',
    isPremium: true,
    thumbnail: '📐',
    parameters: {
      bridgeWidth: -0.25,
      bridgeHeight: 0.2,
      tipSize: -0.2,
      tipRotation: 0,
      nostrilWidth: -0.15,
      nostrilFlare: -0.1,
      length: 0,
      symmetry: 0.6,
    },
  },
  {
    id: 'refined-upturned',
    name: 'Upturned Tip',
    description: 'Slight upturn for a youthful appearance',
    category: 'refined',
    isPremium: true,
    thumbnail: '🌟',
    parameters: {
      bridgeWidth: -0.15,
      bridgeHeight: 0.1,
      tipSize: -0.15,
      tipRotation: 0.25,
      nostrilWidth: -0.1,
      nostrilFlare: -0.05,
      length: -0.1,
      symmetry: 0.4,
    },
  },
  {
    id: 'refined-narrow',
    name: 'Slim Profile',
    description: 'Narrower bridge and refined nostrils',
    category: 'refined',
    isPremium: true,
    thumbnail: '〰️',
    parameters: {
      bridgeWidth: -0.35,
      bridgeHeight: 0.1,
      tipSize: -0.25,
      tipRotation: 0.05,
      nostrilWidth: -0.3,
      nostrilFlare: -0.2,
      length: 0,
      symmetry: 0.5,
    },
  },

  // Dramatic Category - Premium
  {
    id: 'dramatic-sculpted',
    name: 'Sculpted',
    description: 'Dramatically defined features',
    category: 'dramatic',
    isPremium: true,
    thumbnail: '🎭',
    parameters: {
      bridgeWidth: -0.4,
      bridgeHeight: 0.3,
      tipSize: -0.3,
      tipRotation: 0.15,
      nostrilWidth: -0.35,
      nostrilFlare: -0.25,
      length: -0.1,
      symmetry: 0.7,
    },
  },
  {
    id: 'dramatic-button',
    name: 'Button Nose',
    description: 'Small, cute button-shaped nose',
    category: 'dramatic',
    isPremium: true,
    thumbnail: '🔘',
    parameters: {
      bridgeWidth: -0.3,
      bridgeHeight: -0.1,
      tipSize: -0.35,
      tipRotation: 0.3,
      nostrilWidth: -0.3,
      nostrilFlare: -0.2,
      length: -0.25,
      symmetry: 0.6,
    },
  },
  {
    id: 'dramatic-grecian',
    name: 'Grecian',
    description: 'Straight, prominent bridge inspired by classical art',
    category: 'dramatic',
    isPremium: true,
    thumbnail: '🏛️',
    parameters: {
      bridgeWidth: -0.1,
      bridgeHeight: 0.35,
      tipSize: -0.15,
      tipRotation: -0.1,
      nostrilWidth: -0.15,
      nostrilFlare: -0.1,
      length: 0.1,
      symmetry: 0.8,
    },
  },
  {
    id: 'dramatic-celestial',
    name: 'Celestial',
    description: 'Delicate with a pronounced upturn',
    category: 'dramatic',
    isPremium: true,
    thumbnail: '⭐',
    parameters: {
      bridgeWidth: -0.25,
      bridgeHeight: 0.05,
      tipSize: -0.25,
      tipRotation: 0.4,
      nostrilWidth: -0.2,
      nostrilFlare: -0.1,
      length: -0.15,
      symmetry: 0.5,
    },
  },
];

export const getShapesByCategory = (category: NoseShape['category']) =>
  noseShapes.filter(shape => shape.category === category);

export const getFreeShapes = () =>
  noseShapes.filter(shape => !shape.isPremium);

export const getPremiumShapes = () =>
  noseShapes.filter(shape => shape.isPremium);

export const interpolateParameters = (
  from: NoseParameters,
  to: NoseParameters,
  t: number
): NoseParameters => {
  const lerp = (a: number, b: number) => a + (b - a) * t;

  return {
    bridgeWidth: lerp(from.bridgeWidth, to.bridgeWidth),
    bridgeHeight: lerp(from.bridgeHeight, to.bridgeHeight),
    tipSize: lerp(from.tipSize, to.tipSize),
    tipRotation: lerp(from.tipRotation, to.tipRotation),
    nostrilWidth: lerp(from.nostrilWidth, to.nostrilWidth),
    nostrilFlare: lerp(from.nostrilFlare, to.nostrilFlare),
    length: lerp(from.length, to.length),
    symmetry: lerp(from.symmetry, to.symmetry),
  };
};
