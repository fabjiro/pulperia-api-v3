import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module'; // Importar UserModule
import { EncryptionService } from '../utils/encrypt.utils';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UserModule, // Asegúrate de importar el módulo que contiene UserService
    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: 8,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, EncryptionService], // No necesitas el UserService aquí, ya lo provee el UserModule
  exports: [AuthService, EncryptionService], // UserService también es exportado por UserModule
})
export class AuthModule {}
