export type AssistantTrigger =
  | "app_open"
  | "before_focus"
  | "during_focus"
  | "after_completion"
  | "streak";

export function getAssistantMessage(
  trigger: AssistantTrigger,
  goalTitle: string,
  reason: string,
  streak: number,
  daysLeft: number,
): string {
  const title = goalTitle || "your goal";
  const why = reason || "your reason";

  switch (trigger) {
    case "app_open":
      return `Your goal is ${title}. You have ${daysLeft} days left this year.`;
    case "before_focus":
      return `Focus on ${why}. Every session moves you forward.`;
    case "during_focus":
      return `Stay with it. ${why} is why you started.`;
    case "after_completion":
      return `All tasks done. ${title} is within reach.`;
    case "streak":
      return streak > 1
        ? `${streak} days straight. Don't break the chain.`
        : `Day one. ${title} starts now.`;
    default:
      return `Stay focused. ${title} matters.`;
  }
}

export function getDaysLeftInYear(): number {
  const now = new Date();
  const endOfYear = new Date(now.getFullYear(), 11, 31);
  const diff = endOfYear.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

export function calculateStreak(completedDates: string[]): number {
  if (!completedDates.length) return 0;
  const sorted = [...completedDates].sort().reverse();
  const today = getTodayDate();
  let streak = 0;
  let current = new Date(today);

  for (let i = 0; i < 365; i++) {
    const dateStr = current.toISOString().split("T")[0];
    if (sorted.includes(dateStr)) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}
