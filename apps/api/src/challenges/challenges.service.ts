import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { ChallengeEntity, ChallengeStatus } from './entities/challenge.entity';

@Injectable()
export class ChallengesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private mapRecord(record: any): ChallengeEntity {
    return {
      id: record.id,
      userId: record.user_id,
      startsAt: record.starts_at,
      currentDay: record.current_day ?? 1,
      status: (record.status as ChallengeStatus) ?? 'active',
      goalDescription: record.goal_description ?? undefined,
      timezone: record.timezone ?? 'America/Bogota',
      createdAt: record.created_at ?? new Date().toISOString(),
    };
  }

  async create(dto: CreateChallengeDto): Promise<ChallengeEntity> {
    const payload = {
      user_id: dto.userId,
      starts_at: dto.startsAt,
      goal_description: dto.goalDescription ?? null,
      timezone: dto.timezone,
      status: 'active',
      current_day: 1,
    };

    const { data, error } = await this.supabaseService
      .getClient()
      .from('challenges')
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return this.mapRecord(data);
  }

  async findActiveByUser(userId: string): Promise<ChallengeEntity | null> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('challenges')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new InternalServerErrorException(error.message);
    }

    if (!data) {
      return null;
    }

    return this.mapRecord(data);
  }

  async update(id: string, dto: UpdateChallengeDto): Promise<ChallengeEntity> {
    const payload = {
      starts_at: dto.startsAt,
      goal_description: dto.goalDescription,
      timezone: dto.timezone,
      status: dto.status,
    };

    const { data, error } = await this.supabaseService
      .getClient()
      .from('challenges')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException('Reto no encontrado');
    }

    return this.mapRecord(data);
  }
}
