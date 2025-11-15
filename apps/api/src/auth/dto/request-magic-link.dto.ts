import { IsEmail, IsOptional, IsString, IsUrl } from 'class-validator';

export class RequestMagicLinkDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @IsUrl({ require_tld: false })
  redirectTo?: string;
}
