import { config } from "dotenv";

config({ path: '../../.env' });

type Env = {
  botToken: string;
  groupId: string;
  apiBaseUrl: string;
  timezone: string;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variable de entorno faltante: ${name}`);
  }
  return value.trim();
}

export const env: Env = {
  botToken: requireEnv('TELEGRAM_BOT_TOKEN'),
  groupId: requireEnv('TELEGRAM_GROUP_ID'),
  apiBaseUrl: process.env.API_BASE_URL?.trim() ?? 'http://localhost:3000',
  timezone: process.env.TZ?.trim() ?? 'America/Bogota',
};
