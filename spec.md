# Elyon

## Current State
New project. No existing application files.

## Requested Changes (Diff)

### Add
- Full authentication system (email/password) with persistent sessions
- Dashboard: days left in year counter, today's tasks (max 5), mountain progress SVG visual, Start Focus button
- Goal system: create goals with title + mandatory reason; goals link to user
- Task system: tasks with name, completion status, date, linked to goal and user; checkbox complete; filter by user + today
- Calendar view: show completed/missed days, streak count
- Focus Mode: Pomodoro timer (customizable work/break intervals), fullscreen minimal UI, shows current goal and reason, contextual assistant messages
- AI Assistant: floating assistant widget, contextual messages at key moments (app open, before focus, during focus, after completion), uses goal/reason/streak data, short 1-sentence calm messages (curated logic-based, no external API)
- Progress tab: visual goal completion progress
- Bottom navigation: Home, Calendar, Focus, Progress
- Dark premium minimal UI with smooth animations

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: User profiles, Goals (title, reason, userId), Tasks (name, completed, date, goalId, userId), session management via authorization component
2. Backend APIs: CRUD for goals, CRUD for tasks, get tasks by user+date, get streak data (completed days), get calendar data
3. Frontend: Auth screens (login/register), Dashboard, Goals/Tasks management, Calendar, Focus Mode with Pomodoro, Progress tab, floating AI assistant widget
4. Contextual assistant logic: rule-based message selection using goal title, reason, streak count at trigger moments
