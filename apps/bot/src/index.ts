import { Bot } from "grammy";
import { config } from "dotenv";

config();

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.warn("TELEGRAM_BOT_TOKEN no está configurado. El bot no se iniciará.");
  process.exit(0);
}

const bot = new Bot(token);

bot.command("start", async (ctx) => {
  await ctx.reply(
    "¡Hola! Muy pronto este bot sincronizará tus avances del Reto 28 días."
  );
});

bot.catch((err) => {
  console.error("Error en el bot", err);
});

async function bootstrap() {
  console.log("Bot de Reto 28 días listo. Esperando actualizaciones de Telegram...");
  await bot.start();
}

bootstrap();
