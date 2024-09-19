import { DownloandUtils } from './downloand.utils';
import * as sharp from 'sharp';

export class GeneratorUtils {
  // Función para combinar imágenes y obtener Base64
  static async createImageGridAndGetBase64(urls) {
    // Llenar espacios vacíos con null si hay menos de 4 URLs
    while (urls.length < 4) {
      urls.push(null);
    }

    // Descargar imágenes o crear un buffer de fondo blanco si la imagen no está presente
    const images = await Promise.all(
      urls.map(async (url) => {
        if (url) {
          const img = await DownloandUtils.downloadImage(url); // Suponiendo que tienes esta función implementada
          return sharp(img)
            .resize({
              width: 300,
              height: 300,
              fit: 'contain', // Ajustar la imagen sin distorsión
              background: { r: 255, g: 255, b: 255, alpha: 0 }, // Fondo transparente
            })
            .toBuffer();
        } else {
          // Crear un buffer de una imagen con fondo blanco
          return sharp({
            create: {
              width: 300,
              height: 300,
              channels: 4,
              background: { r: 255, g: 255, b: 255, alpha: 0 }, // Fondo blanco
            },
          })
            .png()
            .toBuffer();
        }
      }),
    );

    // Combinar las imágenes en una cuadrícula 2x2 y obtener el buffer
    const combinedImageBuffer = await sharp({
      create: {
        width: 600, // 2 imágenes de ancho
        height: 600, // 2 imágenes de alto
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 0 }, // Fondo transparente
      },
    })
      .composite([
        { input: images[0], top: 0, left: 0 },
        { input: images[1], top: 0, left: 300 },
        { input: images[2], top: 300, left: 0 },
        { input: images[3], top: 300, left: 300 },
      ])
      .png() // Exportar como PNG
      .toBuffer(); // Obtener el buffer de la imagen combinada

    // Convertir el buffer a Base64
    const base64Image = combinedImageBuffer.toString('base64');

    return `data:image/png;base64,${base64Image}`;
  }
}
