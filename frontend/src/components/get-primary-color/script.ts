const NEURONS = 64;
const EPOCHS = 10;

class Neuron {
  r: number;
  g: number;
  b: number;
  frequency: number;
  saliency: number;

  constructor(r: number, g: number, b: number) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.frequency = 0;
    this.saliency = this.calculateSaliency();
  }

  calculateSaliency() {
    // Convert RGB to HSV space for better saliency calculation
    const max = Math.max(this.r, this.g, this.b) / 255;
    const min = Math.min(this.r, this.g, this.b) / 255;
    const delta = max - min;

    // Calculate saturation and value
    const saturation = max === 0 ? 0 : delta / max;
    const value = max;

    // Saliency combines saturation and value
    return saturation * 0.7 + value * 0.3;
  }

  distance(r: number, g: number, b: number) {
    // Perceptual color distance with saliency weighting
    const baseDist = Math.sqrt(
      Math.pow(this.r - r, 2) +
        Math.pow(this.g - g, 2) +
        Math.pow(this.b - b, 2)
    );

    const targetSaliency = this.calculateSaliencyForColor(r, g, b);
    const saliencyFactor = Math.min(1.5, 1 + targetSaliency);

    return baseDist / saliencyFactor;
  }

  calculateSaliencyForColor(r: number, g: number, b: number) {
    const max = Math.max(r, g, b) / 255;
    const min = Math.min(r, g, b) / 255;
    const delta = max - min;
    const saturation = max === 0 ? 0 : delta / max;
    const value = max;
    return saturation * 0.7 + value * 0.3;
  }

  adjust(r: number, g: number, b: number, learningRate: number) {
    const saliencyWeight = this.calculateSaliencyForColor(r, g, b);
    const adjustedRate = learningRate * (1 + saliencyWeight);

    this.r += adjustedRate * (r - this.r);
    this.g += adjustedRate * (g - this.g);
    this.b += adjustedRate * (b - this.b);
    this.frequency++;
    this.saliency = this.calculateSaliency();
  }
}

class MNNQ {
  neurons: Neuron[];
  numNeurons: number;

  constructor(numNeurons = 16) {
    this.neurons = [];
    this.numNeurons = numNeurons;
  }

  initializeNeurons(pixels: number[][]) {
    // Sample pixels for initialization
    const sampleSize = Math.min(1000, pixels.length);
    const samples = new Set<string>();

    while (samples.size < this.numNeurons) {
      const idx = Math.floor(Math.random() * pixels.length);
      const pixel = pixels[idx];
      const key = `${pixel[0]},${pixel[1]},${pixel[2]}`;
      samples.add(key);
    }

    this.neurons = Array.from(samples).map((s) => {
      const [r, g, b] = s.split(",").map(Number);
      return new Neuron(r, g, b);
    });
  }

  train(pixels: number[][], epochs = 10) {
    const initialLearningRate = 0.1;
    const minLearningRate = 0.01;

    for (let epoch = 0; epoch < epochs; epoch++) {
      const learningRate = Math.max(
        minLearningRate,
        initialLearningRate * (1 - epoch / epochs)
      );

      // Shuffle pixels for each epoch
      const shuffledPixels = [...pixels].sort(() => Math.random() - 0.5);

      for (const pixel of shuffledPixels) {
        const [r, g, b] = pixel;

        // Find winning neuron
        let winner = null;
        let minDist = Infinity;

        for (const neuron of this.neurons) {
          const dist = neuron.distance(r, g, b);
          if (dist < minDist) {
            minDist = dist;
            winner = neuron;
          }
        }

        // Adjust winning neuron
        if (winner) {
          winner.adjust(r, g, b, learningRate);
        }
      }
    }
  }

  getDominantColor() {
    // Score each neuron based on frequency and saliency
    const scores = this.neurons.map((n) => ({
      neuron: n,
      score: n.frequency * Math.pow(n.saliency, 2), // Square saliency to emphasize vibrant colors
    }));

    const winner = scores.sort((a, b) => b.score - a.score)[0].neuron;
    return [Math.round(winner.r), Math.round(winner.g), Math.round(winner.b)];
  }
}

async function getDominantColor(
  imageUrl: string,
  neurons?: number,
  epochs?: number
): Promise<{ rgb: { r: number; g: number; b: number }; hex: string }> {
  try {
    // Create canvas and context
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Could not get canvas context");
    }

    // Load image and process it
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });

    // allow UI to update
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Rest of the image processing code
    canvas.width = 100;
    canvas.height = 100;
    ctx.drawImage(img, 0, 0, 100, 100);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels: number[][] = [];

    for (let i = 0; i < imageData.data.length; i += 4) {
      pixels.push([
        imageData.data[i],
        imageData.data[i + 1],
        imageData.data[i + 2],
      ]);
    }

    // Create and train MNNQ - Break up heavy computation
    const mnnq = new MNNQ(neurons || NEURONS);
    mnnq.initializeNeurons(pixels);

    // Process epochs in chunks to allow UI updates
    const totalEpochs = epochs || EPOCHS;
    const chunkSize = 2;

    for (let i = 0; i < totalEpochs; i += chunkSize) {
      const currentChunk = Math.min(chunkSize, totalEpochs - i);
      mnnq.train(pixels, currentChunk);
      // Allow UI to update between chunks
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    const [r, g, b] = mnnq.getDominantColor();
    const hex = `#${r.toString(16).padStart(2, "0")}${g
      .toString(16)
      .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    return { rgb: { r, g, b }, hex };
  } catch (error) {
    console.error("Error processing image:", error);
    throw error;
  }
}

export default getDominantColor;
