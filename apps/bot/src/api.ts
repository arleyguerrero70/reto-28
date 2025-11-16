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
