const { createCanvas, loadImage } = require('canvas');

// Floyd-Steinberg dithering algorithm
function ditherImage(imageData, width, height) {
  const pixels = new Uint8ClampedArray(imageData);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      
      // Convert to grayscale
      const oldPixel = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;
      const newPixel = oldPixel < 128 ? 0 : 255;
      
      // Set to pure black or white
      pixels[idx] = pixels[idx + 1] = pixels[idx + 2] = newPixel;
      
      // Calculate error
      const error = oldPixel - newPixel;
      
      // Distribute error to neighboring pixels (Floyd-Steinberg)
      if (x + 1 < width) {
        const rightIdx = (y * width + (x + 1)) * 4;
        pixels[rightIdx] += error * 7 / 16;
        pixels[rightIdx + 1] += error * 7 / 16;
        pixels[rightIdx + 2] += error * 7 / 16;
      }
      
      if (y + 1 < height) {
        if (x > 0) {
          const bottomLeftIdx = ((y + 1) * width + (x - 1)) * 4;
          pixels[bottomLeftIdx] += error * 3 / 16;
          pixels[bottomLeftIdx + 1] += error * 3 / 16;
          pixels[bottomLeftIdx + 2] += error * 3 / 16;
        }
        
        const bottomIdx = ((y + 1) * width + x) * 4;
        pixels[bottomIdx] += error * 5 / 16;
        pixels[bottomIdx + 1] += error * 5 / 16;
        pixels[bottomIdx + 2] += error * 5 / 16;
        
        if (x + 1 < width) {
          const bottomRightIdx = ((y + 1) * width + (x + 1)) * 4;
          pixels[bottomRightIdx] += error * 1 / 16;
          pixels[bottomRightIdx + 1] += error * 1 / 16;
          pixels[bottomRightIdx + 2] += error * 1 / 16;
        }
      }
    }
  }
  
  return pixels;
}

// Process image for thermal printing
async function processImageForPrinting(imageBuffer, maxWidth = 576) {
  try {
    // Load image
    const img = await loadImage(imageBuffer);
    
    // Calculate new dimensions (maintain aspect ratio)
    let width = img.width;
    let height = img.height;
    
    if (width > maxWidth) {
      const ratio = maxWidth / width;
      width = maxWidth;
      height = Math.floor(height * ratio);
    }
    
    // Create canvas and draw resized image
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, width, height);
    
    // Apply dithering
    const ditheredPixels = ditherImage(imageData.data, width, height);
    
    // Convert to bitmap for ESC/POS
    const bitmap = convertToBitmap(ditheredPixels, width, height);
    
    return {
      width,
      height,
      bitmap
    };
    
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
}

// Convert dithered pixels to ESC/POS bitmap format
function convertToBitmap(pixels, width, height) {
  const bytesPerLine = Math.ceil(width / 8);
  const bitmap = [];
  
  for (let y = 0; y < height; y++) {
    const line = new Array(bytesPerLine).fill(0);
    
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const isBlack = pixels[idx] < 128;
      
      if (isBlack) {
        const byteIndex = Math.floor(x / 8);
        const bitIndex = 7 - (x % 8);
        line[byteIndex] |= (1 << bitIndex);
      }
    }
    
    bitmap.push(...line);
  }
  
  return Buffer.from(bitmap);
}

module.exports = {
  processImageForPrinting,
  ditherImage
};
