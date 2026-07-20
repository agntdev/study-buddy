# Study Buddy — Bot specification

**Archetype:** workflow

**Voice:** warm and playful — write every user-facing message, button label, error, and empty state in this voice.

A Telegram bot that acts as a supportive study companion, encouraging users to focus, offering light banter, and helping with study sessions. It's not a tutor but a motivator and accountability partner.

> This is the complete contract for the bot. Implement EVERY entry point, flow, feature, integration, and edge case below. The completeness review checks the bot against this document after each build pass.

## Primary audience

- students
- learners
- self-improvers

## Success criteria

- Users start study sessions with /focus
- Users check their study progress with /stats
- Bot sends motivational messages and gentle reminders
- Bot responds to casual chat with human-like banter

## Entry points

Every feature must be reachable from the bot's command/button surface (button-first; only /start and /help are slash commands).

- **/start** (command, actor: user, command: /start) — Open the main menu
- **Start focus session** (command, actor: user, command: /focus) — Start a new study session
  - inputs: duration (optional), topic (optional)
  - outputs: session started confirmation, motivational message
- **Check study stats** (command, actor: user, command: /stats) — View study progress and statistics
  - outputs: study summary, duration totals, topic breakdown
- **Set study preferences** (command, actor: user, command: /settings) — Configure study preferences and goals
  - inputs: default session duration, notification frequency, study goals
  - outputs: settings saved confirmation
- **Start focus session** (button, actor: user, callback: focus:start) — Start a new study session
  - inputs: duration (optional), topic (optional)
  - outputs: session started confirmation, motivational message
- **Check stats** (button, actor: user, callback: stats:view) — View study progress and statistics
  - outputs: study summary, duration totals, topic breakdown
- **Settings** (button, actor: user, callback: settings:edit) — Configure study preferences and goals
  - inputs: default session duration, notification frequency, study goals
  - outputs: settings saved confirmation
- **Help** (button, actor: user, callback: help:show) — Show help and usage instructions
  - outputs: help message, command list, usage examples

## Flows

### Focus session
_Trigger:_ /focus or button

1. User starts session
2. Bot confirms and sends motivational message
3. Bot tracks session duration
4. Bot sends periodic reminders
5. User completes session
6. Bot provides summary and encouragement

_Data touched:_ user profile, study sessions

### Stats view
_Trigger:_ /stats or button

1. User requests stats
2. Bot retrieves session history
3. Bot calculates totals and averages
4. Bot displays summary with topic breakdown

_Data touched:_ study sessions

### Settings edit
_Trigger:_ /settings or button

1. User accesses settings
2. Bot displays current preferences
3. User modifies settings
4. Bot saves changes
5. Bot confirms update

_Data touched:_ user profile

### Casual chat
_Trigger:_ Any message

1. User sends message
2. Bot processes intent
3. Bot responds with appropriate tone
4. Bot provides helpful or playful response

_Data touched:_ user profile

### Reminder notification
_Trigger:_ Timer expiration

1. Timer expires
2. Bot sends reminder message
3. User acknowledges or dismisses
4. Bot updates session status

_Data touched:_ study sessions

## Data entities

Durable data (must survive a restart) uses the toolkit's persistent store, never in-memory maps.

- **User profile** _(retention: persistent)_ — User's study preferences, goals, and settings
  - fields: user_id, default_session_duration, notification_frequency, study_goals, created_at
- **Study sessions** _(retention: persistent)_ — Record of user's study sessions
  - fields: session_id, user_id, start_time, end_time, duration, topic, status, notes
- **Notifications** _(retention: none)_ — Scheduled reminder notifications
  - fields: notification_id, user_id, scheduled_time, message, status, sent_at

## Integrations

- **Telegram** (required) — Bot API messaging
Call external APIs against their real contract (correct endpoints, ids, params); credentials from env. Do not fake responses.

## Owner controls

- View user statistics
- Manage notification settings
- Reset user data
- Export study data

## Notifications

- Study session reminders
- Motivational messages
- Session completion summaries
- Weekly study reports

## Permissions & privacy

- User data is private and not shared
- Study sessions are stored securely
- User preferences are configurable
- Bot respects user notification preferences

## Edge cases

- User starts session without specifying duration
- User sends casual chat messages during a session
- User wants to pause or resume a session
- User has no study history yet
- Bot receives an unexpected message format

## Required tests

- User can start a focus session with /focus
- User can check their study stats with /stats
- Bot sends motivational messages during sessions
- Bot responds to casual chat with appropriate tone
- User can set study preferences with /settings
- Bot handles edge cases gracefully
- Bot respects user notification preferences

## Assumptions

- Casual tone: The bot uses a friendly, casual tone with occasional light teasing and modern slang
- Study session defaults: Initial study sessions are set to 30 minutes unless the user specifies otherwise
- Notification frequency: Reminders are sent at reasonable intervals to avoid overwhelming the user
- Human-like responses: The bot responds to questions it doesn't know with realistic, human-like answers
