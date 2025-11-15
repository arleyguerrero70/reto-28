import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { RequestMagicLinkDto } from './dto/request-magic-link.dto';
import { VerifyTokenDto } from './dto/verify-token.dto';

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async requestMagicLink(dto: RequestMagicLinkDto) {
    const { error } = await this.supabaseService.getClient().auth.signInWithOtp({
      email: dto.email,
      options: {
        emailRedirectTo: dto.redirectTo,
      },
    });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return { message: 'Magic link enviado' };
  }

  async verifyAccessToken(dto: VerifyTokenDto) {
    const { data, error } = await this.supabaseService
      .getClient()
      .auth.getUser(dto.accessToken);

    if (error || !data.user) {
      throw new UnauthorizedException('Token inválido');
    }

    return data.user;
  }
}
