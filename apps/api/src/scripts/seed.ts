import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';

loadEnv({ path: resolve(__dirname, '../../../../.env') });

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error('Variables SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY son obligatorias');
}

const supabase = createClient(url, serviceRoleKey);

async function ensureDemoUser() {
  const email = 'demo@reto28.app';

  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw fetchError;
  }

  if (existingUser) {
    return existingUser;
  }

  const { data, error } = await supabase
    .from('users')
    .insert({
      id: randomUUID(),
      email,
      full_name: 'Demo User',
      mentor_ids: ['mentor-ikigai', 'mentor-deepwork'],
      motivation: 'Quiero construir una rutina saludable durante 28 días.',
      expectation: 'Sentirme con más energía al finalizar el reto.',
      timezone: 'America/Bogota',
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

async function ensureDemoChallenge(userId: string) {
  const { data: existing, error: fetchError } = await supabase
    .from('challenges')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw fetchError;
  }

  if (existing) {
    return existing;
  }

  const { data, error } = await supabase
    .from('challenges')
    .insert({
      id: randomUUID(),
      user_id: userId,
      starts_at: new Date().toISOString(),
      goal_description: 'Registrar progreso diario del hábito principal.',
      timezone: 'America/Bogota',
      status: 'active',
      current_day: 1,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

async function run() {
  console.log('Seeding datos demo...');
  const user = await ensureDemoUser();
  console.log('Usuario demo listo:', user.email);
  const challenge = await ensureDemoChallenge(user.id);
  console.log('Reto demo listo:', challenge.id);
  console.log('Seed finalizado.');
}

run().catch((err) => {
  console.error('Error durante el seed', err);
  process.exit(1);
});
