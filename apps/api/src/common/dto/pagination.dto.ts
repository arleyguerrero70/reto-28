import { IsNumber, IsOptional, IsPositive, Max } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  page?: number = 1;
}
