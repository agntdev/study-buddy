// Storage helpers that work with ctx.session for durable data.
// In production with REDIS_URL, the session is Redis-backed (durable).
// In dev/test, the session is per-bot-instance (fresh per test spec).

import type { Session, UserProfile, StudySession } from "./bot.js";

let sessionCounter = 0;

export function generateSessionId(): string {
  return `ses_${++sessionCounter}`;
}

export function getOrCreateUserProfile(session: Session): UserProfile {
  if (!session.userProfile) {
    session.userProfile = {
      default_duration: 30,
      notification_frequency: 15,
      study_goals: "",
    };
  }
  return session.userProfile;
}

export function getStudySessions(session: Session): StudySession[] {
  if (!session.studySessions) session.studySessions = [];
  return session.studySessions;
}

export function getActiveSession(session: Session): StudySession | null {
  const sessions = getStudySessions(session);
  return sessions.find((s) => s.status === "active") ?? null;
}

export function saveStudySession(session: Session, studySession: StudySession): void {
  const sessions = getStudySessions(session);
  const idx = sessions.findIndex((s) => s.session_id === studySession.session_id);
  if (idx >= 0) sessions[idx] = studySession;
  else sessions.push(studySession);
}
