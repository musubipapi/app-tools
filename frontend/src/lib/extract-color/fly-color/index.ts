import createModule from './fly-color-wrapper.mjs';

type Address = number;

interface WasmModule {
  _malloc: (length: number) => Address;
  _free: (addr: Address) => void;
  HEAPU8: Uint8Array;
  HEAPU16: Uint16Array;
  HEAPU32: Uint32Array;
  HEAP32: Int32Array;
  cwrap: (...args: any[]) => any;
}

export interface FlyColorResult {
  colorNum: number;
  colorArr: number[];
  histogram: number[];
  weight?: number[];
}

const MAX_COLOR_NUM = 16;

class WasmUtils {
  private static _instance: WasmUtils | null;

  private _module: WasmModule;

  private _addC: (a: number, b: number) => number;
  private _transformToRGB565: (imgData: Address, length: number, dstData: Address) => number;
  private _cutMainColor: (imgData: Address, length: number, colorArr: Address, histogramArr: Address) => number;
  private _solveMainColor: (
    colorNum: number,
    colorArr: Address,
    histogram: Address,
    weight: Address,
    colorMergingTolerance: number,
    lightnessAddition: number,
    chromaForm: number,
    chromaTo: number,
    lightnessFrom: number,
    lightnessTo: number,
    strategyThreshold: number,
  ) => number;

  private constructor(module: WasmModule) {
    this._module = module;

    this._addC = module.cwrap('add', 'number', new Array(2).fill('number'));
    this._transformToRGB565 = module.cwrap('transformToRGB565', 'number', new Array(3).fill('number'));
    this._cutMainColor = module.cwrap('cut_main_color_at_rgb_565_c', 'number', new Array(4).fill('number'));
    this._solveMainColor = module.cwrap('solveMainColor', 'number', new Array(11).fill('number'));
  }

  static async getInstance(): Promise<WasmUtils> {
    if (!WasmUtils._instance) {
      const module = await createModule();
      WasmUtils._instance = new WasmUtils(module);
    }

    return WasmUtils._instance;
  }

  addC(a: number, b: number): number {
    return this._addC(a, b);
  }

  private _moduleHeapU32Slice(begin: Address, length: number): number[] {
    return Array.from(this._module.HEAPU32.slice(begin >> 2, (begin >> 2) + length));
  }

  cutMainColor(imgData: ImageData): FlyColorResult {
    const rawRGBA = new Uint8Array(imgData.data);
    const length = imgData.width * imgData.height;

    //bufferSize(in byte): width * height * (sizeof(R | G | B | A)) * 4
    const rawBufferSize = length * 4;
    //bufferSize: width * height * sizeof(rgb565)=2
    const rgb565BufferSize = length * 2;

    //allocate wasm memory for inputRawArray
    const rawBuffer = this._module._malloc(rawBufferSize);
    this._module.HEAPU8.set(rawRGBA, rawBuffer); //write ImageData to wasm memory

    //allocate wasm memory for rgb565Array
    const rgbBuf = this._module._malloc(rgb565BufferSize);

    this._transformToRGB565(rawBuffer, length, rgbBuf);

    console.log('passed 565');

    //allocate wasm memory for colorArr
    const colorArrBuffer = this._module._malloc(MAX_COLOR_NUM * 4);
    const histogramBuffer = this._module._malloc(MAX_COLOR_NUM * 4);

    const colorNum = this._cutMainColor(rgbBuf, length, colorArrBuffer, histogramBuffer);

    // this._test(rgbBuf, length, colorArrBuffer, histogramBuffer);

    const res = {
      colorNum,
      colorArr: this._moduleHeapU32Slice(colorArrBuffer, MAX_COLOR_NUM),
      histogram: this._moduleHeapU32Slice(histogramBuffer, MAX_COLOR_NUM),
    };


    //free heap memory
    this._module._free(rawBuffer);
    this._module._free(rgbBuf);
    this._module._free(colorArrBuffer);
    this._module._free(histogramBuffer);

    return res;
  }

  convertColorValue(color: number): string {
    return color ? `#${color.toString(16).substring(2)}` : '#000000';
  }

  solveMainColor(
    colorNum: number,
    colorArr: number[],
    histogram: number[],
    colorMergingTolerance: number,
    lightnessAddition: number,
    chromaFrom: number,
    chromaTo: number,
    lightnessFrom: number,
    lightnessTo: number,
    strategyThreshold: number,
  ): FlyColorResult {
    const bufferSize = MAX_COLOR_NUM * 4;

    const colorArrBuffer = this._module._malloc(bufferSize);
    const histogramBuffer = this._module._malloc(bufferSize);
    const weightBuffer = this._module._malloc(bufferSize);

    this._module.HEAPU32.set(colorArr, colorArrBuffer >> 2);
    this._module.HEAPU32.set(histogram, histogramBuffer >> 2);

    const newColorNum = this._solveMainColor(
      colorNum,
      colorArrBuffer,
      histogramBuffer,
      weightBuffer,
      colorMergingTolerance,
      lightnessAddition,
      chromaFrom,
      chromaTo,
      lightnessFrom,
      lightnessTo,
      strategyThreshold,
    );

    const res = {
      colorNum: newColorNum,
      colorArr: this._moduleHeapU32Slice(colorArrBuffer, MAX_COLOR_NUM),
      histogram: this._moduleHeapU32Slice(histogramBuffer, MAX_COLOR_NUM),
      weightBuffer: this._moduleHeapU32Slice(weightBuffer, MAX_COLOR_NUM),
    };

    this._module._free(colorArrBuffer);
    this._module._free(histogramBuffer);
    this._module._free(weightBuffer);

    return res;
  }
}

export { WasmUtils };
