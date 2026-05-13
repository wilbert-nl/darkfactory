import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { JwtPayload } from '../../../common/decorators/current-user.decorator';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<{ user: JwtPayload }>();
    if (!req.user?.isSuperAdmin) {
      throw new ForbiddenException('SuperAdmin access required');
    }
    return true;
  }
}
