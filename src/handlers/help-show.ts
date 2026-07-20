import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";

const HELP =
  "ℹ️ Tap /start to open the menu, then pick what you want from the buttons.\n\n" +
  "Everything in this bot is reachable by tapping — you don't need to remember any commands.";

const composer = new Composer<Ctx>();

// "Help" button from the /start main menu.
composer.callbackQuery("help:show", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(HELP, {
    reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]),
  });
});

export default composer;
