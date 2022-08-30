import { Chance } from "chance";

/**
 * Gets a number guaranteed to be the same throughout today, and guaranteed to change every day.
 * @returns Seed value.
 */
function todaySeed(): number {
  return Number(
    new Date().toLocaleDateString("en-GB", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/[^\d]/g, "")
  );
}

/**
 * Gets a number guaranteed to be the same for all days of this week, and guaranteed to change every Monday.
 * @returns Seed value.
 */
function thisWeekSeed(): number {
  const mondayThisWeek = new Date();

  while (mondayThisWeek.getDay() !== 1) {
    mondayThisWeek.setDate(mondayThisWeek.getDate() - 1);
  }

  return Number(
    mondayThisWeek
      .toLocaleDateString("en-GB", { year: "numeric", month: "2-digit", day: "2-digit" })
      .replace(/[^\d]/g, "")
  );
}

/**
 * Gets a number of items from an array, guaranteed to be deterministic based on the seed.
 * @param seed Seed of the returned items.
 * @param numItems Number of items to return.
 * @param array Array of possible items.
 * @returns Deterministic items from array as per the seed.
 */
export function getDeterministicArrayItems<T>(
  seed: { seedType: "today" } | { seedType: "this-week" } | { seedType: "custom"; value: number },
  numItems: number,
  array: T[]
): T[] {
  const seedValue = (() => {
    switch (seed.seedType) {
      case "today":
        return todaySeed();

      case "this-week":
        return thisWeekSeed();

      case "custom":
        return seed.value;
    }
  })();

  const chance = new Chance(seedValue);

  return chance.shuffle(array.slice()).slice(0, numItems);
}