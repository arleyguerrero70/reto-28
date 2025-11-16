import { Bot, InlineKeyboard } from 'grammy';
import { env } from './config';
import { scheduleGroupReminders } from './scheduler';
import {
  fetchMotivationPhrase,
  getOrCreateUserByTelegramId,
  findActiveChallengeByUserId,
  sendDailyLog,
  updateUserProfile,
  createDefaultChallengeForUser,
} from './api';

const bot = new Bot(env.botToken);

type ProfileStep = 'email' | 'mentors' | 'motivation' | 'expectation' | 'habitGoal';

type ProfileSession = {
  userId: string;
  step: ProfileStep;
  emailContact?: string;
  mentorIds?: string[];
  motivation?: string;
  expectation?: string;
  habitGoal?: string;
};

const profileSessions = new Map<number, ProfileSession>();

function parseLogMessage(text: string): {
  minutes: number;
  moodBefore: string;
  moodAfter: string;
  note?: string;
} | null {
  const parts = text.split('|').map((p) => p.trim());
  if (parts.length < 3) {
    return null;
  }

  const minutes = parseInt(parts[0], 10);
  if (isNaN(minutes) || minutes < 0) {
    return null;
  }

  return {
    minutes,
    moodBefore: parts[1],
    moodAfter: parts[2],
    note: parts[3] || undefined,
  };
}

// Middleware para loggear todos los mensajes recibidos
bot.use(async (ctx, next) => {
  console.log('Mensaje recibido:', {
    chatId: ctx.chat?.id,
    chatType: ctx.chat?.type,
    from: ctx.from?.id,
    text: ctx.message?.text || ctx.callbackQuery?.data,
    command: ctx.message?.entities?.[0]?.type,
  });
  await next();
});

bot.command('start', async (ctx) => {
  try {
    const telegramUserId = ctx.from?.id;
    if (!telegramUserId || !ctx.from) {
      await ctx.reply('❌ No se pudo identificar tu usuario de Telegram.');
      return;
    }

    // Crear o obtener el usuario automáticamente
    const firstName = ctx.from.first_name || 'Usuario';
    const lastName = ctx.from.last_name;
    const username = ctx.from.username;
    
    const { userId, wasCreated } = await getOrCreateUserByTelegramId(telegramUserId, firstName, lastName, username);
    console.log(`Usuario ${userId} ${wasCreated ? 'creado' : 'encontrado'}`);

    const payload = ctx.match;
    const textLines = [
      '👋 ¡Bienvenido al bot del Reto 28 días!',
    ];
    
    if (wasCreated) {
      textLines.push('✅ Tu cuenta ha sido creada automáticamente.');
      textLines.push('📝 Completa tu perfil usando el comando `/crearperfil` para personalizar tu experiencia.');
    } else {
      textLines.push('👤 Tu cuenta ya está vinculada.');
    }
    
    textLines.push('');
    textLines.push('1️⃣ Usa `/crearperfil` para completar tus datos (correo, mentores, motivación, expectativa).');
    textLines.push('2️⃣ Usa `/registro` para anotar tu avance diario y compartir tus emociones.');
    
    if (payload) {
      textLines.push(`\n🔗 Hemos recibido tu enlace de invitación (${payload}).`);
    }
    
    await ctx.reply(textLines.join('\n'), { parse_mode: 'Markdown' });
    console.log('Comando /start procesado correctamente');
  } catch (error: any) {
    console.error('Error en comando /start:', error);
    const errorMessage = error?.response?.data?.message || error?.message || 'Error desconocido';
    console.error('Detalles del error:', {
      message: errorMessage,
      status: error?.response?.status,
      data: error?.response?.data,
      stack: error?.stack,
    });
    try {
      await ctx.reply(
        `❌ Error al procesar tu comando:\n\n` +
        `🔍 ${errorMessage}\n\n` +
        `Si el problema persiste, contacta al administrador.`,
      );
    } catch (e) {
      console.error('No se pudo enviar mensaje de error:', e);
    }
  }
});

bot.command('registro', async (ctx) => {
  const keyboard = new InlineKeyboard().text('Registrar avance', 'log:start');
  await ctx.reply(
    'Vamos a registrar tu hábito.\n(Pronto verás un formulario interactivo aquí). Por ahora responde cuánto tiempo dedicaste y cómo te sentiste.',
    { reply_markup: keyboard },
  );
});

// Alias antiguo por si alguien escribe sin la \"a\"
bot.command('creaperfil', async (ctx) => {
  await ctx.reply('El comando correcto ahora es `/crearperfil`. Úsalo para completar tu perfil.', {
    parse_mode: 'Markdown',
  });
});

bot.command('crearperfil', async (ctx) => {
  try {
    const telegramUserId = ctx.from?.id;
    if (!telegramUserId || !ctx.from) {
      await ctx.reply('❌ No se pudo identificar tu usuario de Telegram.');
      return;
    }

    const firstName = ctx.from.first_name || 'Usuario';
    const lastName = ctx.from.last_name;
    const username = ctx.from.username;

    const { userId } = await getOrCreateUserByTelegramId(
      telegramUserId,
      firstName,
      lastName,
      username,
    );

    profileSessions.set(telegramUserId, {
      userId,
      step: 'email',
    });

    await ctx.reply(
      '🧩 Vamos a crear tu perfil del reto.\n\n' +
        '1️⃣ Escribe tu **correo electrónico** (lo usaremos solo para enviarte accesos y novedades del reto).',
      { parse_mode: 'Markdown' },
    );
  } catch (error: any) {
    console.error('Error en comando /crearperfil:', error);
    const errorMessage = error?.response?.data?.message || error?.message || 'Error desconocido';
    await ctx.reply(
      `❌ Error al iniciar la creación de tu perfil:\n\n` +
        `🔍 ${errorMessage}\n\n` +
        `Intenta de nuevo o contacta al administrador.`,
    );
  }
});

bot.callbackQuery('log:start', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply(
    'Envíame un mensaje con este formato:\n`minutos|cómo te sentías antes|cómo te sientes ahora|nota opcional`',
    { parse_mode: 'Markdown' },
  );
});

bot.command('frase', async (ctx) => {
  try {
    const telegramUserId = ctx.from?.id;
    if (!telegramUserId || !ctx.from) {
      await ctx.reply('❌ No se pudo identificar tu usuario de Telegram.');
      return;
    }

    // Crear o obtener el usuario automáticamente
    const firstName = ctx.from.first_name || 'Usuario';
    const lastName = ctx.from.last_name;
    const username = ctx.from.username;
    
    const { userId } = await getOrCreateUserByTelegramId(telegramUserId, firstName, lastName, username);
    const phrase = await fetchMotivationPhrase(userId);
    await ctx.reply(phrase);
  } catch (error: any) {
    console.error('Error en comando /frase:', error);
    const errorMessage = error?.response?.data?.message || error?.message || 'Error desconocido';
    await ctx.reply(`❌ Error: ${errorMessage}\n\nTu constancia inspira a toda la comunidad.`);
  }
});

bot.on('message:text', async (ctx, next) => {
  const text = ctx.message.text ?? '';
  const telegramUserId = ctx.from?.id;

  // Primero, si hay una sesión de creación de perfil activa
  if (telegramUserId && profileSessions.has(telegramUserId) && !text.startsWith('/')) {
    const session = profileSessions.get(telegramUserId)!;

    try {
      if (session.step === 'email') {
        session.emailContact = text.trim();
        session.step = 'mentors';
        profileSessions.set(telegramUserId, session);

        await ctx.reply(
          '2️⃣ Ahora dime los **mentores** que te inspiran para este reto (separados por comas).\n\n' +
            'Ejemplo: `James Clear, Cal Newport, Naval Ravikant`',
          { parse_mode: 'Markdown' },
        );
        return;
      }

      if (session.step === 'mentors') {
        const mentors = text
          .split(',')
          .map((m) => m.trim())
          .filter((m) => m.length > 0);

        session.mentorIds = mentors;
        session.step = 'motivation';
        profileSessions.set(telegramUserId, session);

        await ctx.reply(
          '3️⃣ Cuéntame brevemente tu **motivación** para este reto.\n\n' +
            'Ejemplo: `Quiero construir una rutina saludable y sentirme con más energía cada día.`',
          { parse_mode: 'Markdown' },
        );
        return;
      }

      if (session.step === 'motivation') {
        session.motivation = text.trim();
        session.step = 'expectation';
        profileSessions.set(telegramUserId, session);

        await ctx.reply(
          '4️⃣ Finalmente, ¿qué **esperas** que haya cambiado en tu vida al terminar los 28 días?\n\n' +
            'Ejemplo: `Sentirme más disciplinado, con más claridad mental y orgullo de mi constancia.`',
          { parse_mode: 'Markdown' },
        );
        return;
      }

      if (session.step === 'expectation') {
        session.expectation = text.trim();
        session.step = 'habitGoal';
        profileSessions.set(telegramUserId, session);

        await ctx.reply(
          '5️⃣ ¿Qué **hábito** quieres adquirir o mejorar durante estos 28 días?\n\n' +
            'Ejemplo: `Meditar 10 minutos al día`, `Leer 20 páginas`, `Salir a caminar 30 minutos`.',
          { parse_mode: 'Markdown' },
        );
        return;
      }

      if (session.step === 'habitGoal') {
        session.habitGoal = text.trim();

        // Guardar en el backend
        await updateUserProfile(session.userId, {
          emailContact: session.emailContact,
          mentorIds: session.mentorIds,
          motivation: session.motivation,
          expectation: session.expectation,
          habitGoal: session.habitGoal,
        });

        profileSessions.delete(telegramUserId);

        await ctx.reply(
          '✅ ¡Perfil creado/actualizado con éxito!\n\n' +
            '🎯 Hábito objetivo: ' +
            `*${session.habitGoal}*.\n\n` +
            'A partir de ahora usaremos esta información para personalizar tus métricas y mensajes del reto. 💪',
          { parse_mode: 'Markdown' },
        );
        return;
      }
    } catch (error: any) {
      console.error('Error durante la creación de perfil:', error);
      const errorMsg =
        error?.response?.data?.message || error?.message || 'Error desconocido al guardar el perfil';
      await ctx.reply(
        `❌ Error al guardar tu perfil:\n\n` +
          `🔍 ${errorMsg}\n\n` +
          `Intenta de nuevo con /creaperfil o contacta al administrador.`,
      );
      profileSessions.delete(telegramUserId);
      return;
    }
  }

  // Si no hay sesión de perfil, procesamos el registro diario
  if (!text.includes('|')) {
    await next();
    return;
  }

  const parsed = parseLogMessage(text);
  if (!parsed) {
    await ctx.reply(
      '❌ Formato incorrecto. Usa:\n`minutos|emoción antes|emoción después|nota opcional`\n\nEjemplo: `45|Motivado|Orgulloso|Sesión productiva`',
      { parse_mode: 'Markdown' },
    );
    return;
  }

  if (!telegramUserId) {
    await ctx.reply('❌ No se pudo identificar tu usuario de Telegram.');
    return;
  }

  try {
    if (!ctx.from) {
      await ctx.reply('❌ No se pudo identificar tu usuario de Telegram.');
      return;
    }

    // Crear o obtener el usuario automáticamente
    const firstName = ctx.from.first_name || 'Usuario';
    const lastName = ctx.from.last_name;
    const username = ctx.from.username;
    
    const { userId } = await getOrCreateUserByTelegramId(telegramUserId, firstName, lastName, username);

    let challenge = await findActiveChallengeByUserId(userId);
    if (!challenge) {
      await ctx.reply(
        '⚠️ No tenías un reto activo, así que vamos a crear uno automáticamente y registrar tu avance de hoy. 💪',
      );
      challenge = await createDefaultChallengeForUser(userId);
    }

    const today = new Date().toISOString().split('T')[0];
    await sendDailyLog({
      challengeId: challenge.id,
      logDate: today,
      completed: true,
      minutesSpent: parsed.minutes,
      moodBefore: parsed.moodBefore,
      moodAfter: parsed.moodAfter,
      note: parsed.note,
      sharedInGroup: ctx.chat?.type === 'supergroup',
      sharedMessageId: ctx.chat?.type === 'supergroup' ? ctx.message.message_id.toString() : undefined,
    });

    await ctx.reply(
      `✅ ¡Registro guardado!\n\n📊 Tiempo: ${parsed.minutes} minutos\n😊 Emoción antes: ${parsed.moodBefore}\n😄 Emoción después: ${parsed.moodAfter}${parsed.note ? `\n📝 Nota: ${parsed.note}` : ''}`,
    );
    console.log('Registro diario guardado exitosamente');
  } catch (error: any) {
    console.error('Error guardando registro diario:', error);
    const errorMsg =
      error.response?.data?.message || error.message || 'Error desconocido al guardar el registro';
    console.error('Detalles del error:', {
      message: errorMsg,
      status: error?.response?.status,
      data: error?.response?.data,
      stack: error?.stack,
    });
    await ctx.reply(
      `❌ Error al guardar el registro:\n\n` +
      `🔍 ${errorMsg}\n\n` +
      `Intenta de nuevo o contacta al administrador.`,
    );
  }
});

bot.catch((err) => {
  console.error('Error en el bot', err);
});

async function bootstrap() {
  scheduleGroupReminders(bot);
  console.log('Bot de Reto 28 días listo. Esperando actualizaciones de Telegram...');
  await bot.start();
}

bootstrap();
