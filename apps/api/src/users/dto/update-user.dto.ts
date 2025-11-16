import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsArray()
  mentorIds?: string[];

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  emailContact?: string;

  @IsOptional()
  @IsString()
  telegramUserId?: string;

  @IsOptional()
  @IsString()
  habitGoal?: string;
}
