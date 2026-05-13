import { IsEmail, IsOptional, IsString, IsIn } from 'class-validator';

export class InviteUserDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @IsIn(['tenant_owner', 'tenant_user'])
  roleSlug?: string;
}
