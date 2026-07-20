import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";
import {
  getOrCreateUserProfile,
  getActiveSession,
  saveStudySession,
  generateSessionId,
} from "../storage.js";

function now(): number {
  return Date.now();
}

const MOTIVATIONAL = [
  "You've got this! Stay locked in 🔥",
  "Deep work mode — let's crush it 💪",
  "Focus up! Your future self will thank you 🎯",
  "Time to get in the zone 🧠",
  "Let's go — you're capable of amazing things ✨",
];

function pickMotivation(userId: number): string {
  return MOTIVATIONAL[userId % MOTIVATIONAL.length];
}

const composer = new Composer<Ctx>();

composer.callbackQuery("focus:start", async (ctx) => {
  await ctx.answerCallbackQuery();
  const userId = ctx.from.id;
  const existing = getActiveSession(ctx.session);
  if (existing) {
    await ctx.reply(
      "You already have a focus session running! Finish it first or tap /start to go back.",
      { reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]) },
    );
    return;
  }

  const profile = getOrCreateUserProfile(ctx.session);
  const duration = profile.default_duration;
  const topic = "General study";

  const session = {
    session_id: generateSessionId(),
    start_time: now(),
    end_time: null,
    duration: null,
    topic,
    status: "active" as const,
  };
  saveStudySession(ctx.session, session);

  ctx.session.activeSessionId = session.session_id;
  ctx.session.currentTopic = topic;

  const mins = duration;
  await ctx.reply(
    `📚 Focus session started!\n\n` +
      `Topic: ${topic}\n` +
      `Duration: ${mins} minutes\n\n` +
      `${pickMotivation(userId)}\n\n` +
      `Tap "Done" when you finish, or I'll check in when time's up.`,
    {
      reply_markup: inlineKeyboard([
        [inlineButton("✅ Done", "focus:done"), inlineButton("❌ End session", "focus:cancel")],
        [inlineButton("⬅️ Back to menu", "menu:main")],
      ]),
    },
  );
});

export default composer;
