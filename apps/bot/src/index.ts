import { Bot, InlineKeyboard } from 'grammy';
import { env } from './config';
import { scheduleGroupReminders } from './scheduler';
import { fetchMotivationPhrase } from './api';

const bot = new Bot(env.botToken);

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
    const payload = ctx.match;
    const textLines = [
      '👋 ¡Bienvenido al bot del Reto 28 días!',
      'Usa `/registro` para anotar tu avance diario y comparte tus emociones.',
    ];
    if (payload) {
      textLines.push(`Hemos recibido tu enlace de invitación (${payload}).`);
    }
    await ctx.reply(textLines.join('\n'), { parse_mode: 'Markdown' });
    console.log('Comando /start procesado correctamente');
  } catch (error) {
    console.error('Error en comando /start:', error);
    try {
      await ctx.reply('Hubo un error procesando tu comando. Intenta de nuevo.');
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

bot.callbackQuery('log:start', async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.reply(
    'Envíame un mensaje con este formato:\n`minutos|cómo te sentías antes|cómo te sientes ahora|nota opcional`',
    { parse_mode: 'Markdown' },
  );
});

bot.command('frase', async (ctx) => {
  const userId = ctx.from?.id?.toString() ?? '';
  const phrase = await fetchMotivationPhrase(userId);
  await ctx.reply(phrase);
});

bot.on('message:text', async (ctx, next) => {
  const text = ctx.message.text ?? '';
  if (text.includes('|')) {
    await ctx.reply('¡Gracias! Pronto enviaremos esto al dashboard.');
    return;
  }
  await next();
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
