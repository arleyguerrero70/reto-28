import { PartialType } from '@nestjs/mapped-types';
import { CreateDailyLogDto } from './create-daily-log.dto';
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class UpdateDailyLogDto extends PartialType(CreateDailyLogDto) {
  @IsOptional()
  @IsBoolean()
  consumedShield?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  currentDay?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  moderatorNote?: string;
}
