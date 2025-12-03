import { ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class BypassAuthGuard {
  canActivate(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();

    request.user = {
      sub: 'test-user-id',
      uid: 'test-user-id',
      email: 'john.doe@gmail.com',
      email_verified: true,
      phone_number: undefined,
      picture: 'https://johnspics.com/air.png',
      aud: 'your-firebase-project-id',
      auth_time: Math.floor(Date.now() / 1000) - 300, // 5 minutes ago
      exp: Math.floor(Date.now() / 1000) + 3600, // expires in 1 hour
      iat: Math.floor(Date.now() / 1000) - 300, // issued 5 minutes ago
      iss: 'https://securetoken.google.com/your-firebase-project-id',
      firebase: {
        identities: {
          email: ['john.doe@gmail.com'],
        },
        sign_in_provider: 'password',
      },
    };
    return true;
  }
}
