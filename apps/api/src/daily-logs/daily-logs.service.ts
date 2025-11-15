import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateDailyLogDto } from './dto/create-daily-log.dto';
import { DailyLogEntity } from './entities/daily-log.entity';
import { UpdateDailyLogDto } from './dto/update-daily-log.dto';
import { isRewardDay } from './utils/rewards.utils';
import { RewardEntity } from './entities/reward.entity';

@Injectable()
export class DailyLogsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private mapRecord(record: any): DailyLogEntity {
    return {
      id: record.id,
      challengeId: record.challenge_id,
      logDate: record.log_date,
      completed: record.completed,
      minutesSpent: record.minutes_spent ?? 0,
      moodBefore: record.mood_before ?? undefined,
      moodAfter: record.mood_after ?? undefined,
      note: record.note ?? undefined,
      sharedInGroup: record.shared_in_group ?? false,
      sharedMessageId: record.shared_message_id ?? undefined,
      createdAt: record.created_at ?? new Date().toISOString(),
    };
  }

  private mapReward(record: any): RewardEntity {
    return {
      id: record.id,
      userId: record.user_id,
      type: record.type ?? 'shield',
      grantedDay: record.granted_day ?? 0,
      consumed: record.consumed ?? false,
      createdAt: record.created_at ?? new Date().toISOString(),
    };
  }

  async create(dto: CreateDailyLogDto): Promise<DailyLogEntity> {
    const payload = {
      challenge_id: dto.challengeId,
      log_date: dto.logDate,
      completed: dto.completed,
      minutes_spent: dto.minutesSpent ?? 0,
      mood_before: dto.moodBefore ?? null,
      mood_after: dto.moodAfter ?? null,
      note: dto.note ?? null,
      shared_in_group: dto.sharedInGroup ?? false,
      shared_message_id: dto.sharedMessageId ?? null,
    };

    const { data, error } = await this.supabaseService
      .getClient()
      .from('daily_logs')
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    await this.updateChallengeProgress(dto.challengeId, dto.completed);

    return this.mapRecord(data);
  }

  async findByChallenge(challengeId: string): Promise<DailyLogEntity[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('daily_logs')
      .select('*')
      .eq('challenge_id', challengeId)
      .order('log_date', { ascending: true });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []).map((record) => this.mapRecord(record));
  }

  async update(id: string, dto: UpdateDailyLogDto): Promise<DailyLogEntity> {
    const payload = {
      completed: dto.completed,
      minutes_spent: dto.minutesSpent,
      note: dto.note,
      shared_in_group: dto.sharedInGroup,
      moderator_note: dto.moderatorNote,
    };

    const { data, error } = await this.supabaseService
      .getClient()
      .from('daily_logs')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException('Registro no encontrado');
    }

    return this.mapRecord(data);
  }

  async findRewardsByUser(userId: string): Promise<RewardEntity[]> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('rewards')
      .select('*')
      .eq('user_id', userId)
      .order('granted_day', { ascending: true });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []).map((record) => this.mapReward(record));
  }

  private async updateChallengeProgress(challengeId: string, completed: boolean) {
    if (!completed) {
      return;
    }

    const client = this.supabaseService.getClient();
    const { data: challenge, error } = await client
      .from('challenges')
      .select('*')
      .eq('id', challengeId)
      .single();

    if (error || !challenge) {
      throw new NotFoundException('Reto no encontrado');
    }

    const newDay = (challenge.current_day ?? 1) + 1;

    await client.from('challenges').update({ current_day: newDay }).eq('id', challengeId);

    if (isRewardDay(newDay)) {
      const { count } = await client
        .from('rewards')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', challenge.user_id)
        .eq('granted_day', newDay);

      if (!count) {
        await client.from('rewards').insert({
          user_id: challenge.user_id,
          type: 'shield',
          granted_day: newDay,
        });
      }
    }
  }
}
