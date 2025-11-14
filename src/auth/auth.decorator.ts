import { applyDecorators, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from './auth.guard';

export function Auth() {
  return applyDecorators(UseGuards(FirebaseAuthGuard));
}
