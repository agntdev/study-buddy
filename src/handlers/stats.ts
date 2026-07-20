import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { registerMainMenuItem, inlineButton, inlineKeyboard } from "../toolkit/index.js";
import { getStudySessions } from "../storage.js";

registerMainMenuItem({ label: "📊 Stats", data: "stats:view", order: 20 });

function formatDuration(totalMinutes: number): string {
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

const composer = new Composer<Ctx>();

composer.command("stats", async (ctx) => {
  const sessions = getStudySessions(ctx.session);
  const completed = sessions.filter((s) => s.status === "completed");

  if (completed.length === 0) {
    await ctx.reply(
      "📊 No study sessions yet!\n\n" +
        "Start your first focus session to see your progress here.",
      {
        reply_markup: inlineKeyboard([
          [inlineButton("📚 Start a session", "focus:start")],
          [inlineButton("⬅️ Back to menu", "menu:main")],
        ]),
      },
    );
    return;
  }

  const totalMinutes = completed.reduce((sum, s) => sum + (s.duration ?? 0), 0);
  const topicMap = new Map<string, number>();
  for (const s of completed) {
    topicMap.set(s.topic, (topicMap.get(s.topic) ?? 0) + (s.duration ?? 0));
  }

  const topicLines = [...topicMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([topic, mins]) => `  • ${topic}: ${formatDuration(mins)}`)
    .join("\n");

  const avgMinutes = Math.round(totalMinutes / completed.length);

  await ctx.reply(
    `📊 Study Stats\n\n` +
      `Total sessions: ${completed.length}\n` +
      `Total time: ${formatDuration(totalMinutes)}\n` +
      `Average session: ${formatDuration(avgMinutes)}\n\n` +
      `📂 By topic:\n${topicLines}`,
    {
      reply_markup: inlineKeyboard([
        [inlineButton("📚 Start a session", "focus:start")],
        [inlineButton("⬅️ Back to menu", "menu:main")],
      ]),
    },
  );
});

export default composer;
