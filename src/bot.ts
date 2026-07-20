import { Composer } from "grammy";
import { readdirSync } from "node:fs";
import { createBot, type BotContext } from "./toolkit/index.js";

export interface UserProfile {
  default_duration: number;
  notification_frequency: number;
  study_goals: string;
}

export interface StudySession {
  session_id: string;
  start_time: number;
  end_time: number | null;
  duration: number | null;
  topic: string;
  status: "active" | "completed" | "cancelled";
}

export interface Session {
  step?: "idle" | "awaiting_settings";
  activeSessionId?: string;
  currentTopic?: string;
  userProfile?: UserProfile;
  studySessions?: StudySession[];
}

export type Ctx = BotContext<Session>;

export async function buildBot(token: string) {
  const bot = createBot<Session>(token, {
    initial: () => ({
      step: "idle",
      userProfile: { default_duration: 30, notification_frequency: 15, study_goals: "" },
      studySessions: [],
    }),
  });

  const dir = new URL("./handlers/", import.meta.url);
  let files: string[] = [];
  try {
    files = readdirSync(dir).filter(
      (f) =>
        (f.endsWith(".js") || f.endsWith(".ts")) &&
        !f.endsWith(".d.ts") &&
        !f.includes(".test.") &&
        !f.includes(".spec."),
    );
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    files = [];
  }
  for (const file of files.sort()) {
    const mod = (await import(new URL(file, dir).href)) as { default?: Composer<Ctx> };
    if (!mod.default) {
      throw new Error(`handler ${file} must default-export a grammY Composer`);
    }
    bot.use(mod.default);
  }

  bot.on("message", (ctx) => ctx.reply("Sorry, I didn't understand that. Try /help."));

  return bot;
}
