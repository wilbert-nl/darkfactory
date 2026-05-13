import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class StartImpersonationDto {
  @IsUUID()
  targetUserId: string;

  @IsUUID()
  targetTenantId: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
