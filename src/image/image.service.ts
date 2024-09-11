import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from './entity/image.entity';
import { ImagePostRes } from './dto/image.dto';
import * as sharp from 'sharp';
import axios, { AxiosInstance } from 'axios';

const uuidRegex =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

@Injectable()
export class ImageService {
  private readonly axiosInstance: AxiosInstance;

  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {
    this.axiosInstance = axios.create({
      baseURL: process.env.UPLOADER_PATH,
    });

    this.axiosInstance.interceptors.request.use((config) => {
      config.headers = Object.assign({}, config.headers, {
        Authorization: `Bearer ${process.env.UPLOADER_TOKEN}`,
      });
      return config;
    });
  }

  async deleteById(id: number) {
    const image = await this.findById(id);

    if (!image) {
      throw new Error('Image not found');
    }

    await Promise.all([
      this.deleteImagePost(image.original_link),
      this.deleteImagePost(image.min_link),
    ]);

    return await this.imageRepository.remove(image);
  }

  async findById(id: number): Promise<Image> {
    return await this.imageRepository.findOne({ where: { id } });
  }

  async saveImage(base64?: string): Promise<Image | null> {
    try {
      if (!base64) return null;

      const minImage = await this.compressImage(base64);

      const [imageOriginal, imageMin] = await Promise.all([
        this.postImage(base64),
        this.postImage(minImage),
      ]);

      const newImage = this.imageRepository.create({
        original_link: imageOriginal.link,
        min_link: imageMin.link,
      });

      return await this.imageRepository.save(newImage);
    } catch (error) {
      console.log(error);
      throw new Error('Error al subir la imagen');
    }
  }

  async compressImage(
    base64Str: string,
    quality: number = 80,
  ): Promise<string> {
    const buffer = Buffer.from(base64Str.split(',')[1], 'base64');

    const image = await sharp(buffer)
      .png({ quality: quality }) // Ajustar la calidad (cuanto menor, más comprimida)
      .toBuffer(); // Convertir a buffer

    const compressedBase64 = `data:image/png;base64,${image.toString('base64')}`;
    return compressedBase64;
  }

  async postImage(base64: string): Promise<ImagePostRes> {
    const { data } = await this.axiosInstance.post('/file', {
      file: base64,
    });

    return data as ImagePostRes;
  }

  async deleteImagePost(link: string) {
    await this.axiosInstance.delete(`/file/${link.match(uuidRegex)[0]}`);
  }
}
