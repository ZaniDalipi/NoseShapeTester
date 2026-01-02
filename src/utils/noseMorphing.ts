import type { NoseParameters, FaceLandmarks } from '../types';
import { getNoseCenter, getNoseDimensions, getInterPupillaryDistance } from './faceDetection';

interface MorphField {
  cx: number;
  cy: number;
  radius: number;
  dx: number;
  dy: number;
  strength: number;
}

/**
 * Advanced Nose Morphing Algorithm
 * Uses displacement field-based image warping for realistic results
 */
export class NoseMorphingEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private originalImageData: ImageData | null = null;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!;
  }

  /**
   * Apply nose morphing transformation to an image
   */
  async morphNose(
    sourceImage: HTMLImageElement,
    landmarks: FaceLandmarks,
    parameters: NoseParameters,
    addWatermark: boolean = false
  ): Promise<string> {
    // Set canvas size to match image
    this.canvas.width = sourceImage.naturalWidth;
    this.canvas.height = sourceImage.naturalHeight;

    // Draw original image
    this.ctx.drawImage(sourceImage, 0, 0);
    this.originalImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

    // Calculate morph fields based on parameters and landmarks
    const morphFields = this.calculateMorphFields(landmarks, parameters);

    // Apply displacement field morphing
    const morphedData = this.applyDisplacementField(this.originalImageData, morphFields);

    // Put morphed data back on canvas
    this.ctx.putImageData(morphedData, 0, 0);

    // Apply post-processing for smoother results
    this.applyPostProcessing(landmarks);

    // Add watermark if required
    if (addWatermark) {
      this.addWatermark();
    }

    return this.canvas.toDataURL('image/jpeg', 0.95);
  }

  /**
   * Calculate displacement fields based on nose parameters
   */
  private calculateMorphFields(landmarks: FaceLandmarks, params: NoseParameters): MorphField[] {
    const fields: MorphField[] = [];
    const noseCenter = getNoseCenter(landmarks);
    const noseDims = getNoseDimensions(landmarks);
    const ipd = getInterPupillaryDistance(landmarks);

    // Scale factor based on face size
    const scaleFactor = ipd / 100;
    const nose = landmarks.nose;

    // Bridge morphing (points 0-3 in nose array)
    if (params.bridgeWidth !== 0 || params.bridgeHeight !== 0) {
      const bridgeTop = nose[0];
      const bridgeMid = nose[1];

      // Narrow/widen bridge
      fields.push({
        cx: bridgeTop.x - noseDims.width * 0.3,
        cy: bridgeTop.y,
        radius: noseDims.width * 0.8,
        dx: params.bridgeWidth * scaleFactor * 8,
        dy: 0,
        strength: 0.7,
      });
      fields.push({
        cx: bridgeTop.x + noseDims.width * 0.3,
        cy: bridgeTop.y,
        radius: noseDims.width * 0.8,
        dx: -params.bridgeWidth * scaleFactor * 8,
        dy: 0,
        strength: 0.7,
      });

      // Raise/lower bridge
      fields.push({
        cx: bridgeMid.x,
        cy: bridgeMid.y,
        radius: noseDims.width * 1.2,
        dx: 0,
        dy: -params.bridgeHeight * scaleFactor * 6,
        strength: 0.6,
      });
    }

    // Tip morphing (point 3 is tip, 4-8 are around tip)
    if (params.tipSize !== 0 || params.tipRotation !== 0) {
      const tip = nose[3];

      // Tip size
      const tipRadius = noseDims.width * 0.6;
      fields.push({
        cx: tip.x,
        cy: tip.y,
        radius: tipRadius,
        dx: 0,
        dy: params.tipSize * scaleFactor * 5,
        strength: 0.8,
      });

      // Tip rotation (up/down)
      fields.push({
        cx: tip.x,
        cy: tip.y + tipRadius * 0.3,
        radius: tipRadius * 0.8,
        dx: 0,
        dy: -params.tipRotation * scaleFactor * 10,
        strength: 0.7,
      });
    }

    // Nostril morphing (points 4-8 around nostrils)
    if (params.nostrilWidth !== 0 || params.nostrilFlare !== 0) {
      const leftNostril = nose[4];
      const rightNostril = nose[8];
      const nostrilRadius = noseDims.width * 0.5;

      // Width
      fields.push({
        cx: leftNostril.x,
        cy: leftNostril.y,
        radius: nostrilRadius,
        dx: params.nostrilWidth * scaleFactor * 10,
        dy: params.nostrilFlare * scaleFactor * 3,
        strength: 0.75,
      });
      fields.push({
        cx: rightNostril.x,
        cy: rightNostril.y,
        radius: nostrilRadius,
        dx: -params.nostrilWidth * scaleFactor * 10,
        dy: params.nostrilFlare * scaleFactor * 3,
        strength: 0.75,
      });
    }

    // Length morphing
    if (params.length !== 0) {
      const tip = nose[3];
      fields.push({
        cx: tip.x,
        cy: tip.y,
        radius: noseDims.height * 0.8,
        dx: 0,
        dy: params.length * scaleFactor * 12,
        strength: 0.65,
      });
    }

    // Symmetry correction
    if (params.symmetry > 0) {
      const leftNostril = nose[4];
      const rightNostril = nose[8];
      const center = noseCenter.x;

      const leftOffset = center - leftNostril.x;
      const rightOffset = rightNostril.x - center;
      const avgOffset = (leftOffset + rightOffset) / 2;

      const leftCorrection = (avgOffset - leftOffset) * params.symmetry;
      const rightCorrection = (avgOffset - rightOffset) * params.symmetry;

      fields.push({
        cx: leftNostril.x,
        cy: leftNostril.y,
        radius: noseDims.width * 0.4,
        dx: -leftCorrection,
        dy: 0,
        strength: 0.5,
      });
      fields.push({
        cx: rightNostril.x,
        cy: rightNostril.y,
        radius: noseDims.width * 0.4,
        dx: rightCorrection,
        dy: 0,
        strength: 0.5,
      });
    }

    return fields;
  }

  /**
   * Apply displacement field to image data
   */
  private applyDisplacementField(imageData: ImageData, fields: MorphField[]): ImageData {
    const { width, height, data } = imageData;
    const result = new ImageData(width, height);
    const resultData = result.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Calculate total displacement at this pixel
        let totalDx = 0;
        let totalDy = 0;
        let totalWeight = 0;

        for (const field of fields) {
          const dist = Math.sqrt(
            Math.pow(x - field.cx, 2) + Math.pow(y - field.cy, 2)
          );

          if (dist < field.radius) {
            // Smooth falloff using cosine interpolation
            const t = dist / field.radius;
            const weight = field.strength * (1 - t * t) * (1 - t * t);

            totalDx += field.dx * weight;
            totalDy += field.dy * weight;
            totalWeight += weight;
          }
        }

        // Source coordinates (inverse mapping)
        const srcX = x - totalDx;
        const srcY = y - totalDy;

        // Bilinear interpolation for smooth sampling
        const pixel = this.bilinearSample(data, width, height, srcX, srcY);

        const idx = (y * width + x) * 4;
        resultData[idx] = pixel.r;
        resultData[idx + 1] = pixel.g;
        resultData[idx + 2] = pixel.b;
        resultData[idx + 3] = pixel.a;
      }
    }

    return result;
  }

  /**
   * Bilinear sampling for smooth interpolation
   */
  private bilinearSample(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    x: number,
    y: number
  ): { r: number; g: number; b: number; a: number } {
    // Clamp to bounds
    x = Math.max(0, Math.min(width - 1.001, x));
    y = Math.max(0, Math.min(height - 1.001, y));

    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const x1 = Math.min(x0 + 1, width - 1);
    const y1 = Math.min(y0 + 1, height - 1);

    const xFrac = x - x0;
    const yFrac = y - y0;

    const getPixel = (px: number, py: number) => {
      const idx = (py * width + px) * 4;
      return {
        r: data[idx],
        g: data[idx + 1],
        b: data[idx + 2],
        a: data[idx + 3],
      };
    };

    const p00 = getPixel(x0, y0);
    const p10 = getPixel(x1, y0);
    const p01 = getPixel(x0, y1);
    const p11 = getPixel(x1, y1);

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    return {
      r: lerp(lerp(p00.r, p10.r, xFrac), lerp(p01.r, p11.r, xFrac), yFrac),
      g: lerp(lerp(p00.g, p10.g, xFrac), lerp(p01.g, p11.g, xFrac), yFrac),
      b: lerp(lerp(p00.b, p10.b, xFrac), lerp(p01.b, p11.b, xFrac), yFrac),
      a: lerp(lerp(p00.a, p10.a, xFrac), lerp(p01.a, p11.a, xFrac), yFrac),
    };
  }

  /**
   * Apply post-processing for smoother transitions
   */
  private applyPostProcessing(landmarks: FaceLandmarks): void {
    // Apply subtle edge-preserving smoothing around nose area
    const noseCenter = getNoseCenter(landmarks);
    const noseDims = getNoseDimensions(landmarks);

    // Get region around nose
    const padding = noseDims.width * 1.5;
    const x = Math.max(0, noseCenter.x - padding);
    const y = Math.max(0, noseCenter.y - noseDims.height - padding * 0.5);
    const w = Math.min(this.canvas.width - x, padding * 2);
    const h = Math.min(this.canvas.height - y, noseDims.height + padding * 1.5);

    // Apply subtle blur for skin smoothing
    this.ctx.filter = 'blur(0.5px)';
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.drawImage(this.canvas, x, y, w, h, 0, 0, w, h);

    this.ctx.filter = 'none';
    this.ctx.globalAlpha = 0.3;
    this.ctx.drawImage(tempCanvas, x, y);
    this.ctx.globalAlpha = 1;
  }

  /**
   * Add watermark for free tier users
   */
  private addWatermark(): void {
    const text = 'NoseShape Tester';
    const fontSize = Math.max(16, this.canvas.width * 0.025);

    this.ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`;
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'bottom';

    // Shadow for visibility
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    this.ctx.shadowBlur = 4;
    this.ctx.shadowOffsetX = 2;
    this.ctx.shadowOffsetY = 2;

    // Gradient fill
    const gradient = this.ctx.createLinearGradient(
      this.canvas.width - 200,
      this.canvas.height,
      this.canvas.width,
      this.canvas.height - 30
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(200, 200, 255, 0.8)');

    this.ctx.fillStyle = gradient;
    this.ctx.fillText(text, this.canvas.width - 20, this.canvas.height - 20);

    // Reset shadow
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
  }

  /**
   * Get canvas for direct manipulation if needed
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
}

// Singleton instance
let morphingEngine: NoseMorphingEngine | null = null;

export function getMorphingEngine(): NoseMorphingEngine {
  if (!morphingEngine) {
    morphingEngine = new NoseMorphingEngine();
  }
  return morphingEngine;
}
