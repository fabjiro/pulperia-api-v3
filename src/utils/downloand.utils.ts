import axios from 'axios';

export class DownloandUtils {
  static async downloadImage(url: string) {
    const response = await axios({
      url,
      responseType: 'arraybuffer',
    });
    return Buffer.from(response.data, 'binary');
  }
}
