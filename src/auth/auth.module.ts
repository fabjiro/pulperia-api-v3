import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module'; // Importar UserModule
import { EncryptionService } from '../utils/encrypt.utils';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { ImageModule } from '../image/image.module';

@Module({
  imports: [
    UserModule, // Asegúrate de importar el módulo que contiene UserService
    ImageModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        return {
          global: true,
          secret: config.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: '8h',
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, EncryptionService, JwtStrategy], // No necesitas el UserService aquí, ya lo provee el UserModule
  exports: [AuthService, EncryptionService], // UserService también es exportado por UserModule
})
export class AuthModule {}
