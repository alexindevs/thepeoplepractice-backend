import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      ROLES_KEY,
      context.getHandler(),
    );
    const request = context.switchToHttp().getRequest();

    if (!request.user) {
      throw new ForbiddenException(
        'User not found in request. Ensure JWT is valid.',
      );
    }

    if (!requiredRoles) {
      return true;
    }

    if (!requiredRoles.includes(request.user.role)) {
      throw new ForbiddenException('Access Denied');
    }

    return true;
  }
}
