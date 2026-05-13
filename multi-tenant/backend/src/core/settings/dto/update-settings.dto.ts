import { IsOptional, IsString, IsHexColor, MaxLength, IsUrl } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsHexColor()
  primaryColor?: string;

  @IsOptional()
  @IsHexColor()
  accentColor?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  fontFamily?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  tenantDisplayName?: string;
}
