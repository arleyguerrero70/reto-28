import cron from 'node-cron';
import { env } from './config';
import { Bot } from 'grammy';
import { fetchMotivationPhrase } from './api';

const WEEKDAY_TIMES = ['0 9 * * 1-5', '0 15 * * 1-5', '0 19 * * 1-5'];
const WEEKEND_TIMES = ['0 10 * * 6,0', '0 18 * * 6,0'];

export function scheduleGroupReminders(bot: Bot) {
  WEEKDAY_TIMES.forEach((expr, index) => {
    cron.schedule(
      expr,
      async () => {
        await sendReminder(bot, index < 2 ? 'weekdayMorning' : 'weekdayEvening');
      },
      { timezone: env.timezone }
    );
  });

  WEEKEND_TIMES.forEach((expr, index) => {
    cron.schedule(
      expr,
      async () => {
        await sendReminder(bot, index === 0 ? 'weekendMorning' : 'weekendEvening');
      },
      { timezone: env.timezone }
    );
  });
}

type ReminderSlot = 'weekdayMorning' | 'weekdayAfternoon' | 'weekdayEvening' | 'weekendMorning' | 'weekendEvening';

async function sendReminder(bot: Bot, slot: ReminderSlot) {
  let message = '';
  if (slot === 'weekdayMorning') {
    message = '☀️ ¡Buenos días! ¿Listo para tu hábito de hoy?';
  } else if (slot === 'weekdayAfternoon') {
    message = '🌤️ Mitad de jornada. Cuéntanos cómo va tu progreso.';
  } else if (slot === 'weekdayEvening') {
    message = '🌙 Ya es hora de registrar tu avance y emociones del día.';
  } else if (slot === 'weekendMorning') {
    message = '😌 Fin de semana: toma aire, pero no pierdas la racha. ¡Vamos!';
  } else {
    message = '🌇 Cierra tu día dejando tu registro. Un paso a la vez.';
  }

  try {
    await bot.api.sendMessage(env.groupId, message);
  } catch (error) {
    console.error('No se pudo enviar recordatorio', error);
  }
}
