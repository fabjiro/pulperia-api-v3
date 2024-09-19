import { DownloandUtils } from './downloand.utils';
import * as sharp from 'sharp';

export class GeneratorUtils {
  static async createImageGrid(urls) {
    // Llenar espacios vacíos con null si hay menos de 4 URLs
    while (urls.length < 4) {
      urls.push(null);
    }

    // Descargar imágenes o crear un buffer de fondo blanco si la imagen no está presente
    const images = await Promise.all(
      urls.map(async (url) => {
        if (url) {
          const img = await DownloandUtils.downloadImage(url);
          return sharp(img).resize(300, 300).toBuffer();
        } else {
          // Crear un buffer de una imagen en blanco
          return sharp({
            create: {
              width: 300,
              height: 300,
              channels: 4,
              background: { r: 255, g: 255, b: 255, alpha: 1 }, // Fondo blanco
            },
          })
            .png()
            .toBuffer();
        }
      }),
    );

    // Combinar las imágenes en una cuadrícula 2x2
    const combinedImage = await sharp({
      create: {
        width: 600, // 2 imágenes de ancho
        height: 600, // 2 imágenes de alto
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }, // Fondo blanco
      },
    })
      .composite([
        { input: images[0], top: 0, left: 0 },
        { input: images[1], top: 0, left: 300 },
        { input: images[2], top: 300, left: 0 },
        { input: images[3], top: 300, left: 300 },
      ])
      .toFile('output-grid-image.png'); // Guardar la imagen generada

    return combinedImage;
  }
}
