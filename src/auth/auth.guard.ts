import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { auth } from './auth.config';
import { Request } from 'express';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
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

      const payload = await auth.verifyIdToken(token[1]);
      req.user = payload;
      return true;
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      throw new UnauthorizedException('Invalid token');
    }
  }
}
