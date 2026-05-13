import { IsString, IsOptional, MaxLength, IsIn } from 'class-validator';

export class UpdateTenantDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsIn(['PENDING', 'ACTIVE', 'SUSPENDED'])
  status?: 'PENDING' | 'ACTIVE' | 'SUSPENDED';

  @IsOptional()
  @IsIn(['free', 'starter', 'pro', 'enterprise'])
  plan?: string;
}
