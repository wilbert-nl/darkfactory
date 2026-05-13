import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface JwtPayload {
  sub: string;
  email: string;
  isSuperAdmin: boolean;
  tenantMemberships: Array<{ tenantId: string; roleSlug: string }>;
  isImpersonation?: boolean;
  impersonatedBy?: string;
  impersonationId?: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<{ user: JwtPayload }>();
    return request.user;
  },
);
