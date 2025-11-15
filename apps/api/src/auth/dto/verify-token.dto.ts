import { IsString, MinLength } from 'class-validator';

export class VerifyTokenDto {
  @IsString()
  @MinLength(10)
  accessToken!: string;
}
