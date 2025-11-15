import { PartialType } from '@nestjs/mapped-types';
import { CreateChallengeDto } from './create-challenge.dto';
import { IsEnum, IsOptional } from 'class-validator';

enum ChallengeStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused',
}

export class UpdateChallengeDto extends PartialType(CreateChallengeDto) {
  @IsOptional()
  @IsEnum(ChallengeStatus)
  status?: ChallengeStatus;
}
