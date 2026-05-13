import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { TenantContextService } from '../../../tenancy/tenant-context/tenant-context.service';
import { JwtPayload } from '../../../common/decorators/current-user.decorator';

@Injectable()
export class TenantOwnerGuard implements CanActivate {
  constructor(private readonly tenantContext: TenantContextService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<{ user: JwtPayload }>();
    const user = req.user;
    if (user?.isSuperAdmin) return true;

    const tenantId = this.tenantContext.getCurrentTenantIdOrNull();
    if (!tenantId) throw new ForbiddenException('No tenant context');

    const membership = user?.tenantMemberships.find((m) => m.tenantId === tenantId);
    if (!membership || membership.roleSlug !== 'tenant_owner') {
      throw new ForbiddenException('TenantOwner access required');
    }
    return true;
  }
}
