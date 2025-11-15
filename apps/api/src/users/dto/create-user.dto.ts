import { IsArray, IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName!: string;

  @IsOptional()
  @IsArray()
  mentorIds?: string[];

  @IsOptional()
  @IsString()
  motivation?: string;

  @IsOptional()
  @IsString()
  expectation?: string;
}
