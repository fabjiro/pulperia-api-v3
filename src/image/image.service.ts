import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from './entity/image.entity';
import { ImagePostRes } from './dto/image.dto';
import * as sharp from 'sharp';
import axios, { AxiosInstance } from 'axios';
import { IMAGEENUM } from './enum/image.enum';
import * as fs from 'fs';
import * as os from 'os';
import { join } from 'path';
import * as FormData from 'form-data';

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

    if (
      image.id === IMAGEENUM.DEFAULTPRODUCT ||
      image.id === IMAGEENUM.DEFAULTUSER ||
      image.id === IMAGEENUM.DEFAULTCATEGORY
    ) {
      return;
    }

    if (image.original_link === image.min_link) {
      await this.deleteImagePost(image.original_link);
    } else {
      await Promise.all([
        this.deleteImagePost(image.original_link),
        this.deleteImagePost(image.min_link),
      ]);
    }

    return await this.imageRepository.remove(image);
  }

  async findById(id: number): Promise<Image> {
    return await this.imageRepository.findOne({ where: { id } });
  }

  async saveOnCloundImage(base64?: string) {
    try {
      if (!base64) return null;

      const minImage = await this.compressImage(base64);

      const [imageOriginal, imageMin] = await Promise.all([
        this.uploadImage(base64),
        this.uploadImage(minImage),
      ]);

      return {
        imageOriginal,
        imageMin,
      };
    } catch (error) {
      console.log(error);
      throw new Error('Error al subir la imagen');
    }
  }

  async create(base64?: string): Promise<Image | null> {
    try {
      if (!base64) return;

      const { imageOriginal, imageMin } = await this.saveOnCloundImage(base64);

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
  async update(image: Image, base64?: string) {
    if (!base64) {
      throw new Error('Base64 is required');
    }

    const { imageOriginal, imageMin } = await this.saveOnCloundImage(base64);

    await this.imageRepository.update(image.id, {
      original_link: imageOriginal.link,
      min_link: imageMin.link,
    });

    return await this.findById(image.id);
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

  async uploadImage(base64: string): Promise<ImagePostRes> {
    const { data } = await this.axiosInstance.post(
      '/file',
      {
        file: base64,
      },
      {
        timeout: 60000, // 60 seconds
      },
    );

    return data as ImagePostRes;
  }

  async deleteImagePost(link: string) {
    await this.axiosInstance.delete(`/file/${link.match(uuidRegex)[0]}`);
  }

  async uploadFile(file: Express.Multer.File): Promise<Image | null> {
    const tempDir = os.tmpdir();

    // Crear la ruta del archivo temporal
    const tempFilePath = join(tempDir, file.originalname);

    fs.writeFileSync(tempFilePath, file.buffer);

    // Crear un nuevo FormData
    const formData = new FormData();

    formData.append('file', fs.createReadStream(tempFilePath), {
      filename: file.originalname,
      contentType: file.mimetype,
    });
    const { data } = await this.axiosInstance.post<ImagePostRes>(
      '/file/form',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    // Eliminar el archivo temporal
    fs.unlinkSync(tempFilePath);

    return await this.imageRepository.save({
      original_link: data.link,
      min_link: data.link,
    });
  }
}
