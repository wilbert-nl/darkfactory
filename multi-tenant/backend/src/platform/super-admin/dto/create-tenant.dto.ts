import { IsString, IsNotEmpty, Matches, MaxLength, IsOptional, IsIn } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'slug must be lowercase alphanumeric with hyphens' })
  @MaxLength(63)
  slug: string;

  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'subdomain must be lowercase alphanumeric with hyphens' })
  @MaxLength(63)
  subdomain: string;

  @IsOptional()
  @IsIn(['free', 'starter', 'pro', 'enterprise'])
  plan?: string;
}
