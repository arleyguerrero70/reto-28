import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from './supabase.tokens';

@Injectable()
export class SupabaseService {
  constructor(
    @Inject(SUPABASE_CLIENT)
    private readonly client: SupabaseClient,
  ) {}

  getClient(): SupabaseClient {
    return this.client;
  }

  async healthCheck(): Promise<{ status: string }> {
    await this.client.from('users').select('id').limit(1);
    return { status: 'ok' };
  }
}
