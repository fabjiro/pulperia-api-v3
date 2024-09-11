import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { RolModule } from './rol/rol.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ImageModule } from './image/image.module';
import { CategoryModule } from './category/category.module';
import { StatusModule } from './status/status.module';
import { ProductModule } from './product/product.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.POSTGRES_URL, //  + '?sslmode=require' or process.env.POSTGRES_URL_NON_POOLING for non-pooling connection
      entities: ['./dist/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: true,
    }),
    RolModule,
    UserModule,
    AuthModule,
    ImageModule,
    CategoryModule,
    StatusModule,
    ProductModule,
  ],
})
export class AppModule {}
