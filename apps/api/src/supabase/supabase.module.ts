import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from './supabase.tokens';
import { SupabaseService } from './supabase.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: SUPABASE_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): SupabaseClient => {
        const url = configService.get<string>('supabase.url');
        const serviceRoleKey = configService.get<string>('supabase.serviceRoleKey');

        if (!url || !serviceRoleKey) {
          throw new Error('Supabase credentials are missing in environment variables');
        }

        return createClient(url, serviceRoleKey, {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        });
      },
    },
    SupabaseService,
  ],
  exports: [SupabaseService, SUPABASE_CLIENT],
})
export class SupabaseModule {}
