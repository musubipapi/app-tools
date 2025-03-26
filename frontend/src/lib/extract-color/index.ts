import 'canvas';

// taken from '@byted-tiktok/fly-color-wasm-lib' but package is not TTP compliant
// https://code.byted.org/search/ies/tiktok_web_monorepo/tree/562fbb9/packages/libs/fly-color-wasm-lib
import { WasmUtils } from './fly-color/index';
//@ts-expect-error
import sharp from 'sharp';

interface ColorExtractorOptions {
  mergingTolerance?: number;
  lightnessAddition?: number;
  cLeft?: number;
  cRight?: number;
  iLeft?: number;
  iRight?: number;
  strategyThreshold?: number;
}

const defaultOptions: ColorExtractorOptions = {
  mergingTolerance: 0,
  lightnessAddition: 0,
  cLeft: 0,
  cRight: 0.4,
  iLeft: 0,
  iRight: 1,
  strategyThreshold: 0,
};


export class ColorExtractor {
  private static instance: WasmUtils;

  private static async getInstance(): Promise<WasmUtils> {
    if (!this.instance) {
      // Set up environment for WASM
      global.document = {} as any;
      global.window = global as any;

      this.instance = await WasmUtils.getInstance();
    }
    return this.instance;
  }

  private static async processImage(input: string | Buffer) {
    const image = sharp(input);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      throw new Error('Unable to get image dimensions');
    }

    // Convert to raw RGBA pixels
    const { data, info } = await image
      .raw()
      .ensureAlpha()
      .toBuffer({ resolveWithObject: true });

    return {
      data: new Uint8ClampedArray(data), // Convert Buffer to Uint8ClampedArray
      width: info.width,
      height: info.height
    };
  }

  static async extractColors(
    input: string | Buffer,
    options: ColorExtractorOptions = {}
  ): Promise<{ colors: string[], frequencies: number[] }> {
    try {
      // Merge with default options
      const finalOptions = { ...defaultOptions, ...options };

      // Get WASM instance
      const wasmInstance = await this.getInstance();

      // Process image using sharp
      const { data, width, height } = await this.processImage(input);

      // Create a proper ImageData-like object that the WASM module expects
      const imageDataLike = {
        data: data,
        width: width,
        height: height,
        colorSpace: 'srgb' as PredefinedColorSpace
      };

      // Extract initial colors
      const flyColorResult = wasmInstance.cutMainColor(imageDataLike);

      // Process colors with options
      const solvedColors = wasmInstance.solveMainColor(
        flyColorResult.colorNum,
        flyColorResult.colorArr,
        flyColorResult.histogram,
        finalOptions.mergingTolerance!,
        finalOptions.lightnessAddition!,
        finalOptions.cLeft!,
        finalOptions.cRight!,
        finalOptions.iLeft!,
        finalOptions.iRight!,
        finalOptions.strategyThreshold!
      );

      // Convert to hex colors - IMPORTANT: maintain the same order as histogram
      const colors = solvedColors.colorArr.map(color =>
        wasmInstance.convertColorValue(color)
      );

      // Return both arrays in matching order
      return {
        colors: colors,
        frequencies: solvedColors.histogram
      };

    } catch (error) {
      console.error('Failed to extract colors:', error);
      throw error;
    }
  }
}

// From a URL
export async function extractFromUrl(url: string) {
  try {
    const response = await fetch(url);
    const imageBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(imageBuffer);

    const result = await ColorExtractor.extractColors(buffer);

    // The primary color is the first one
    const primaryColor = result.colors[0];

    console.log('Sorted colors by frequency:', result.colors.map((color, index) => `${color} (${result.frequencies[index]})`));
    console.log('Primary color:', primaryColor);
    return primaryColor;

  } catch (error) {
    console.error('Error:', error);
    return null;
  }
}


// update the url to here to get color
extractFromUrl('https://sf16-sg.tiktokcdn.com/obj/eden-sg/vhneh7fkuh/mock-icons/1.webp');
