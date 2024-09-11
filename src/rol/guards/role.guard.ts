import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserService } from '../../user/user.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  @Inject()
  private readonly userService: UserService;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles: number[] = this.reflector.get<number[]>(
      'roles',
      context.getHandler(),
    );

    if (!roles) return true;

    const request = context.switchToHttp().getRequest();
    const { user } = request;

    const userDB = await this.userService.findBydId(user.id);
    const isAdmin = roles.includes(userDB.rol.id);

    if (!isAdmin || !user) {
      throw new HttpException('No access', 403);
    }

    return true;
  }
}
