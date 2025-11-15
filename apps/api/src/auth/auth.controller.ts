import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RequestMagicLinkDto } from './dto/request-magic-link.dto';
import { VerifyTokenDto } from './dto/verify-token.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('magic-link')
  requestMagicLink(@Body() dto: RequestMagicLinkDto) {
    return this.authService.requestMagicLink(dto);
  }

  @Post('verify')
  verify(@Body() dto: VerifyTokenDto) {
    return this.authService.verifyAccessToken(dto);
  }
}
