import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { registerMainMenuItem, inlineButton, inlineKeyboard } from "../toolkit/index.js";
import {
  getOrCreateUserProfile,
  getActiveSession,
  saveStudySession,
  generateSessionId,
} from "../storage.js";

registerMainMenuItem({ label: "📚 Focus", data: "focus:start", order: 10 });

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

composer.command("focus", async (ctx) => {
  const userId = ctx.from!.id;
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
  const topic = ctx.match?.trim() || "General study";

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

composer.callbackQuery("focus:done", async (ctx) => {
  await ctx.answerCallbackQuery();
  const userId = ctx.from.id;
  const active = getActiveSession(ctx.session);
  if (!active) {
    await ctx.editMessageText("No active session to finish. Tap /start to begin again.", {
      reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]),
    });
    return;
  }

  const elapsed = Math.round((now() - active.start_time) / 60000);
  active.end_time = now();
  active.duration = Math.max(1, elapsed);
  active.status = "completed";
  saveStudySession(ctx.session, active);

  ctx.session.activeSessionId = undefined;
  ctx.session.currentTopic = undefined;

  const encouraging =
    elapsed >= 25
      ? "Amazing focus session! You're on fire 🔥"
      : elapsed >= 10
        ? "Nice work! Every minute counts 💪"
        : "Good start! Try going longer next time 🌱";

  await ctx.editMessageText(
    `✅ Session complete!\n\n` +
      `Topic: ${active.topic}\n` +
      `Duration: ${active.duration} minutes\n\n` +
      `${encouraging}`,
    { reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]) },
  );
});

composer.callbackQuery("focus:cancel", async (ctx) => {
  await ctx.answerCallbackQuery();
  const active = getActiveSession(ctx.session);
  if (active) {
    active.end_time = now();
    active.status = "cancelled";
    saveStudySession(ctx.session, active);
  }

  ctx.session.activeSessionId = undefined;
  ctx.session.currentTopic = undefined;

  await ctx.editMessageText("Session ended. No worries — there's always next time! 🌟", {
    reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]),
  });
});

export default composer;
