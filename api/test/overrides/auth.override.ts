import { Injectable } from '@nestjs/common';

@Injectable()
export class BypassAuthGuard {
  canActivate() {
    return true;
  }
}
