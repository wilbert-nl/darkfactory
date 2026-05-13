import { IsEmail, IsString, IsNotEmpty, MinLength, MaxLength, Matches } from 'class-validator';

export class TenantSignupDto {
  // Tenant info
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  tenantName: string;

  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'slug must be lowercase alphanumeric with hyphens' })
  @MaxLength(63)
  slug: string;

  @IsString()
  @Matches(/^[a-z0-9-]+$/)
  @MaxLength(63)
  subdomain: string;

  // Owner account
  @IsEmail()
  ownerEmail: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  ownerPassword: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  ownerFirstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  ownerLastName: string;
}
