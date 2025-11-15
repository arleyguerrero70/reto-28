import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private mapRecord(record: any): UserEntity {
    return {
      id: record.id,
      email: record.email,
      fullName: record.full_name ?? record.fullname ?? '',
      role: (record.role as UserEntity['role']) ?? 'participant',
      mentorIds: record.mentor_ids ?? [],
      motivation: record.motivation ?? undefined,
      expectation: record.expectation ?? undefined,
      timezone: record.timezone ?? undefined,
      createdAt: record.created_at ?? new Date().toISOString(),
    };
  }

  async create(dto: CreateUserDto): Promise<UserEntity> {
    const payload = {
      email: dto.email,
      full_name: dto.fullName,
      mentor_ids: dto.mentorIds ?? [],
      motivation: dto.motivation ?? null,
      expectation: dto.expectation ?? null,
      role: 'participant',
    };

    const { data, error } = await this.supabaseService
      .getClient()
      .from('users')
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return this.mapRecord(data);
  }

  async findAll(pagination: PaginationDto): Promise<UserEntity[]> {
    const limit = pagination.limit ?? 20;
    const page = pagination.page ?? 1;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error } = await this.supabaseService
      .getClient()
      .from('users')
      .select('*')
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return (data ?? []).map((record) => this.mapRecord(record));
  }

  async findOne(id: string): Promise<UserEntity> {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.mapRecord(data);
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserEntity> {
    const payload = {
      full_name: dto.fullName,
      mentor_ids: dto.mentorIds,
      motivation: dto.motivation,
      expectation: dto.expectation,
      timezone: dto.timezone,
    };

    const { data, error } = await this.supabaseService
      .getClient()
      .from('users')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.mapRecord(data);
  }
}
