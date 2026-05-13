import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { TenantContextService } from '../../../tenancy/tenant-context/tenant-context.service';
import { JwtPayload } from '../../../common/decorators/current-user.decorator';

@Injectable()
export class TenantMembershipGuard implements CanActivate {
  constructor(private readonly tenantContext: TenantContextService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user: JwtPayload }>();
    const user = request.user;
    const tenantId = this.tenantContext.getCurrentTenantIdOrNull();

    if (!tenantId) return true;

    const hasMembership = user.tenantMemberships.some(
      (m) => m.tenantId === tenantId,
    );

    if (!hasMembership) {
      throw new ForbiddenException('You do not have access to this tenant');
    }

    return true;
  }
}
