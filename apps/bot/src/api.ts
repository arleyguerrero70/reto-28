import axios from 'axios';
import { env } from './config';

export const api = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 8000,
});

export async function sendDailyLog(payload: {
  challengeId: string;
  logDate: string;
  completed: boolean;
  minutesSpent: number;
  moodBefore?: string;
  moodAfter?: string;
  note?: string;
  sharedInGroup?: boolean;
  sharedMessageId?: string;
}) {
  return api.post('/daily-logs', payload);
}

export async function fetchMotivationPhrase(userId: string) {
  try {
    const res = await api.get(`/users/${userId}`);
    const mentors: string[] = res.data?.mentorIds ?? [];
    if (!mentors.length) return 'Recuerda por qué empezaste este reto.';
    const sample = mentors[Math.floor(Math.random() * mentors.length)];
    return `Hoy inspírate en ${sample} y mantén el paso.`;
  } catch (error) {
    console.error('Error obteniendo frase', error);
    return 'Tu constancia inspira a toda la comunidad.';
  }
}

export async function findActiveChallengeByUserId(userId: string) {
  try {
    const res = await api.get(`/challenges/user/${userId}`);
    return res.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function findUserByTelegramId(telegramId: number): Promise<string | null> {
  try {
    const res = await api.get(`/users/telegram/${telegramId}`);
    return res.data?.id ?? null;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error('Error buscando usuario por Telegram ID', error);
    return null;
  }
}

export async function createUserFromTelegram(
  telegramId: number,
  firstName: string,
  lastName?: string,
  username?: string,
): Promise<string> {
  const fullName = lastName ? `${firstName} ${lastName}`.trim() : firstName;
  const email = `telegram_${telegramId}@reto28.app`;

  try {
    const res = await api.post('/users', {
      email,
      fullName,
      telegramUserId: telegramId.toString(),
      mentorIds: [],
    });
    console.log(`Usuario creado exitosamente: ${res.data.id}`);
    return res.data.id;
  } catch (error: any) {
    console.error('Error creando usuario desde Telegram:', {
      telegramId,
      email,
      fullName,
      status: error?.response?.status,
      message: error?.response?.data?.message || error?.message,
      data: error?.response?.data,
    });
    throw error;
  }
}

export async function getOrCreateUserByTelegramId(
  telegramId: number,
  firstName: string,
  lastName?: string,
  username?: string,
): Promise<{ userId: string; wasCreated: boolean }> {
  let userId = await findUserByTelegramId(telegramId);
  if (!userId) {
    console.log(`Usuario no encontrado, creando nuevo usuario para Telegram ID: ${telegramId}`);
    userId = await createUserFromTelegram(telegramId, firstName, lastName, username);
    return { userId, wasCreated: true };
  }
  return { userId, wasCreated: false };
}

export async function updateUserProfile(
  userId: string,
  payload: {
    emailContact?: string;
    mentorIds?: string[];
    motivation?: string;
    expectation?: string;
    habitGoal?: string;
  },
) {
  return api.patch(`/users/${userId}`, payload);
}

export async function createDefaultChallengeForUser(userId: string) {
  // Crea un reto activo de 28 días a partir de hoy.
  const startsAt = new Date().toISOString();
  const timezone = 'America/Bogota';

  const payload = {
    userId,
    startsAt,
    timezone,
    goalDescription: 'Reto 28 días: construir y consolidar tu hábito principal.',
  };

  const res = await api.post('/challenges', payload);
  return res.data;
}
