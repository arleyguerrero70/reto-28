import { IsDateString, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateChallengeDto {
  @IsUUID()
  userId!: string;

  @IsDateString()
  startsAt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(280)
  goalDescription?: string;

  @IsString()
  timezone!: string;
}
