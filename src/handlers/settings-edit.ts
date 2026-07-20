import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { getOrCreateUserProfile } from "../storage.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";

const composer = new Composer<Ctx>();

composer.callbackQuery("settings:edit", async (ctx) => {
  await ctx.answerCallbackQuery();
  const profile = getOrCreateUserProfile(ctx.session);
  const goalsDisplay = profile.study_goals || "Not set yet";

  await ctx.editMessageText(
    `⚙️ Study Settings\n\n` +
      `⏱ Default session: ${profile.default_duration} min\n` +
      `🔔 Reminder every: ${profile.notification_frequency} min\n` +
      `🎯 Goals: ${goalsDisplay}\n\n` +
      `Tap a button to change a setting.`,
    {
      reply_markup: inlineKeyboard([
        [inlineButton("⏱ Session duration", "settings:duration")],
        [inlineButton("🔔 Reminders", "settings:reminders")],
        [inlineButton("🎯 Study goals", "settings:goals")],
        [inlineButton("⬅️ Back to menu", "menu:main")],
      ]),
    },
  );
});

composer.callbackQuery("settings:duration", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(
    "⏱ How long should a focus session be?\n\nPick a default duration:",
    {
      reply_markup: inlineKeyboard([
        [
          inlineButton("15 min", "settings:setduration:15"),
          inlineButton("25 min", "settings:setduration:25"),
          inlineButton("30 min", "settings:setduration:30"),
        ],
        [
          inlineButton("45 min", "settings:setduration:45"),
          inlineButton("60 min", "settings:setduration:60"),
        ],
        [inlineButton("⬅️ Back", "settings:edit")],
      ]),
    },
  );
});

composer.callbackQuery(/^settings:setduration:(\d+)$/, async (ctx) => {
  await ctx.answerCallbackQuery({ text: "Duration updated!" });
  const mins = parseInt(ctx.match![1], 10);
  const profile = getOrCreateUserProfile(ctx.session);
  profile.default_duration = mins;

  await ctx.editMessageText(
    `✅ Default session duration set to ${mins} minutes.\n\n` +
      `Your next focus session will use this duration.`,
    {
      reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to settings", "settings:edit")]]),
    },
  );
});

composer.callbackQuery("settings:reminders", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(
    "🔔 How often should I check in during a session?\n\nPick a reminder interval:",
    {
      reply_markup: inlineKeyboard([
        [
          inlineButton("10 min", "settings:setreminder:10"),
          inlineButton("15 min", "settings:setreminder:15"),
          inlineButton("20 min", "settings:setreminder:20"),
        ],
        [
          inlineButton("30 min", "settings:setreminder:30"),
          inlineButton("Off", "settings:setreminder:0"),
        ],
        [inlineButton("⬅️ Back", "settings:edit")],
      ]),
    },
  );
});

composer.callbackQuery(/^settings:setreminder:(\d+)$/, async (ctx) => {
  await ctx.answerCallbackQuery({ text: "Reminders updated!" });
  const mins = parseInt(ctx.match![1], 10);
  const profile = getOrCreateUserProfile(ctx.session);
  profile.notification_frequency = mins;

  const display = mins === 0 ? "off" : `every ${mins} minutes`;
  await ctx.editMessageText(
    `✅ Reminders set to ${display}.\n\n` +
      (mins === 0
        ? "I won't send any reminders during your sessions."
        : `I'll check in with you ${display} during focus sessions.`),
    {
      reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to settings", "settings:edit")]]),
    },
  );
});

composer.callbackQuery("settings:goals", async (ctx) => {
  await ctx.answerCallbackQuery();
  ctx.session.step = "awaiting_settings";
  await ctx.editMessageText(
    "🎯 What are your study goals?\n\n" +
      "Type your goals and I'll save them. For example:\n" +
      '"Pass the calculus exam" or "Learn 50 Spanish words"',
  );
});

export default composer;
