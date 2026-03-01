import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || "");

export function setupTelegramBot() {
  bot.start((ctx) => {
    const webAppUrl = process.env.TELEGRAM_WEBAPP_URL;
    const userId = ctx.from?.id;

    ctx.reply("Xush kelibsiz! Kalori kuzatish ilovasiga.", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "📱 Ilovani ochish",
              web_app: { url: `${webAppUrl}?userId=${userId}` },
            },
          ],
        ],
      },
    });
  });

  bot.help((ctx) => {
    ctx.reply(
      `Kaloriya hisoblagich ilovasiga xush kelibsiz!

Quyidagi buyruqlardan foydalaning:
/start - Ilovani boshlash
/help - Yordam olish`,
    );
  });

  bot.on(message("text"), (ctx) => {
    ctx.reply("Iltimos, ilovani ochish uchun /start buyrug'ini ishlating.");
  });

  bot.launch();
}
