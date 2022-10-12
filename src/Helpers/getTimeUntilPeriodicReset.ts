import endOfDay from "date-fns/endOfDay";
import endOfWeek from "date-fns/endOfWeek";
import intervalToDuration from "date-fns/intervalToDuration";

type TimePeriod = "Day" | "Week";

// Instead of displaying 6:9:23, make sure to display 06:09:23
const zeroPad = (timeUnit: number | undefined) => timeUnit?.toString().padStart(2, "0");

export function getTimeUntilPeriodicReset(period: TimePeriod): string {
  const now = new Date();

  // Midnight at the end of the current day or the end of the week (Sunday)
  const resetTime = period === "Day" ? endOfDay(now) : endOfWeek(now);

  const duration = intervalToDuration({
    start: now,
    end: resetTime,
  });

  // Construct the day part of the string (as this will be needed regardless of the time period)
  const dayString = `${zeroPad(duration.hours)}:${zeroPad(duration.minutes)}:${zeroPad(duration.seconds)}`;

  return period === "Day"
    ? dayString
    : // Also show the number of days until the reset for the weekly period
      `${zeroPad(duration.days)}:${dayString}`;
}
