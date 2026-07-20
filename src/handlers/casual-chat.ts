import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";
import { getOrCreateUserProfile } from "../storage.js";

const GREETINGS: Record<string, string> = {
  hi: "Hey there! Ready to get some studying done? 📚",
  hello: "Hi! What are we working on today? 🎯",
  hey: "Hey! Good to see you — let's make today count 💪",
  "good morning": "Morning! Rise and grind ☀️ What's on the study plan?",
  "good afternoon": "Afternoon! Time for a focus session? 🧠",
  "good evening": "Evening! Still got some study energy left? 🌙",
};

const TOPICS = [
  "I'm always down to help you study! What topic are you tackling?",
  "Ooh, studying? Love that energy. Tap 📚 Focus to get started!",
  "You've got this! Pick a topic and let's dive in.",
  "Study mode activated! Tap a button below to begin.",
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const composer = new Composer<Ctx>();

composer.on("message:text", async (ctx, next) => {
  if (ctx.session.step === "awaiting_settings") {
    const goals = ctx.message.text.trim();
    if (goals.length < 2) {
      await ctx.reply("That's a bit short — try describing your goals in a sentence or two.");
      return;
    }
    const profile = getOrCreateUserProfile(ctx.session);
    profile.study_goals = goals;
    ctx.session.step = "idle";
    await ctx.reply(
      `✅ Goals saved!\n\n` +
        `🎯 ${goals}\n\n` +
        `I'll keep these in mind. You're going to crush it!`,
      {
        reply_markup: inlineKeyboard([
          [inlineButton("⬅️ Back to menu", "menu:main")],
        ]),
      },
    );
    return;
  }

  const text = ctx.message.text.trim();
  if (text.startsWith("/")) return next();

  const lower = text.toLowerCase();

  for (const [key, response] of Object.entries(GREETINGS)) {
    if (lower === key || lower === `${key}!` || lower === `${key}.`) {
      await ctx.reply(response, {
        reply_markup: inlineKeyboard([
          [inlineButton("📚 Start focus", "focus:start")],
          [inlineButton("📊 My stats", "stats:view")],
        ]),
      });
      return;
    }
  }

  if (
    lower.includes("study") ||
    lower.includes("focus") ||
    lower.includes("learn") ||
    lower.includes("exam") ||
    lower.includes("test") ||
    lower.includes("homework") ||
    lower.includes("revision")
  ) {
    await ctx.reply(pickRandom(TOPICS), {
      reply_markup: inlineKeyboard([
        [inlineButton("📚 Start focus", "focus:start")],
        [inlineButton("📊 My stats", "stats:view")],
      ]),
    });
    return;
  }

  if (
    lower.includes("help") ||
    lower.includes("what can you do") ||
    lower.includes("how do") ||
    lower.includes("how does")
  ) {
    await ctx.reply(
      "I'm your study buddy! Here's what I can do:\n\n" +
        "📚 Start a focus session\n" +
        "📊 Track your study stats\n" +
        "⚙️ Set study goals and preferences\n\n" +
        "Tap /start to see all the options!",
      {
        reply_markup: inlineKeyboard([
          [inlineButton("⬅️ Back to menu", "menu:main")],
        ]),
      },
    );
    return;
  }

  const responses = [
    "Interesting! But are you here to study? 😄 Tap a button below!",
    "That's cool and all, but let's get those study goals going! 📚",
    "Love the chat, but I'm better at keeping you focused 💪",
    "I'm just a study bot, but I appreciate the conversation! Ready to focus?",
  ];
  await ctx.reply(pickRandom(responses), {
    reply_markup: inlineKeyboard([
      [inlineButton("📚 Start focus", "focus:start")],
      [inlineButton("📊 My stats", "stats:view")],
    ]),
  });
});

export default composer;
