import { DownloandUtils } from './downloand.utils';
import * as sharp from 'sharp';

export class GeneratorUtils {
  // Función para combinar imágenes y obtener Base64
  static async createSuperposedImageAndGetBase64(urls) {
    // Llenar espacios vacíos con null si hay menos de 3 URLs
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

    // Altura total de la imagen base
    const canvasHeight = 350;

    // Todas las imágenes tendrán la misma coordenada `top` para alinearlas en el fondo
    const bottomAlignedTop = canvasHeight - 300; // Alinear imágenes al fondo (canvasHeight - altura de imagen)

    // Combinar las imágenes con alineación inferior (bottom: 0)
    const combinedImageBuffer = await sharp({
      create: {
        width: 600, // Tamaño del canvas total (ajusta según tus necesidades)
        height: canvasHeight,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 0 }, // Fondo transparente
      },
    })
      .composite([
        { input: images[0], top: bottomAlignedTop, left: 50 }, // Imagen 1, alineada al fondo
        { input: images[1], top: bottomAlignedTop, left: 150 }, // Imagen 2, alineada al fondo
        { input: images[2], top: bottomAlignedTop, left: 250 }, // Imagen 3, alineada al fondo
      ])
      .png() // Exportar como PNG
      .toBuffer(); // Obtener el buffer de la imagen combinada

    // Convertir el buffer a Base64
    const base64Image = combinedImageBuffer.toString('base64');

    return `data:image/png;base64,${base64Image}`;
  }
}
