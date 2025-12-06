import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { auth } from './auth.config';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './role.decorator';
import { DecodedIdToken } from 'firebase-admin/auth';

type UserRoles = 'admin' | 'user';

interface DecodedIdTokenWithRoles extends DecodedIdToken {
  roles?: UserRoles;
}

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const req: Request = context.switchToHttp().getRequest();
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        throw new UnauthorizedException('Missing Authorization Header');
      }

      const token = authHeader.split(' ');
      if (!token) {
        throw new UnauthorizedException('Invalid Authorization Header');
      }

      const payload = (await auth.verifyIdToken(
        token[1],
      )) as DecodedIdTokenWithRoles;
      req.user = payload;

      const requiredRoles = this.reflector.getAllAndOverride<string[]>(
        ROLES_KEY,
        [context.getHandler(), context.getClass()],
      );

      // if there are no required roles from @Auth(), make auth succeed; no authorization required
      if (!requiredRoles || requiredRoles.length === 0) {
        return true;
      }

      const userRole = payload.roles;

      if (!userRole) {
        throw new ForbiddenException('User has no role assigned');
      }

      const hasRole = requiredRoles.includes(userRole);

      if (!hasRole) {
        throw new ForbiddenException('Insufficient permissions');
      }

      return true;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new UnauthorizedException('Invalid token');
    }
  }
}
