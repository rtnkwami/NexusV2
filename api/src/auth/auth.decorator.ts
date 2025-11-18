import { applyDecorators, UseGuards } from '@nestjs/common';
import { FirebaseAuthGuard } from './auth.guard';
import { Roles } from './role.decorator';

export function Auth(...roles: string[]) {
  return applyDecorators(Roles(...roles), UseGuards(FirebaseAuthGuard));
}
