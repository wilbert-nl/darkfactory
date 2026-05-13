import {
  IsString, IsNotEmpty, IsOptional, IsDateString, IsUUID,
} from 'class-validator';

export class CreateReservationDto {
  @IsUUID()
  customerId: string;

  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  metadata?: Record<string, unknown>;
}
