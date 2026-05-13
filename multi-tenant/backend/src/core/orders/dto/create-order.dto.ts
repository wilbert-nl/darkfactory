import {
  IsUUID, IsOptional, IsString, IsArray, ValidateNested, IsInt, IsPositive, IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsUUID()
  productId: string;

  @IsInt()
  @IsPositive()
  quantity: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  unitPrice: number;
}

export class CreateOrderDto {
  @IsUUID()
  customerId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}
