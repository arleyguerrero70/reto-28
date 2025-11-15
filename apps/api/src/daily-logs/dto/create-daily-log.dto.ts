import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, MaxLength, Min, ValidateIf } from 'class-validator';

export class CreateDailyLogDto {
  @IsString()
  challengeId!: string;

  @IsDateString()
  logDate!: string;

  @IsBoolean()
  completed!: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  minutesSpent?: number;

  @ValidateIf((o) => o.completed)
  @IsString()
  @MaxLength(280)
  moodBefore?: string;

  @ValidateIf((o) => o.completed)
  @IsString()
  @MaxLength(280)
  moodAfter?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;

  @IsOptional()
  @IsBoolean()
  sharedInGroup?: boolean;

  @IsOptional()
  @IsString()
  sharedMessageId?: string;
}
