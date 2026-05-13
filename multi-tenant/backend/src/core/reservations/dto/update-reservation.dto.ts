import { IsOptional, IsIn, IsDateString, IsString } from 'class-validator';

export class UpdateReservationDto {
  @IsOptional()
  @IsIn(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'])
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';

  @IsOptional()
  @IsDateString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endTime?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
