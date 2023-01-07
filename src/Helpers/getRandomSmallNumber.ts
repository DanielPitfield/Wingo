import { getRandomElementFrom } from "./getRandomElementFrom";

export function getRandomSmallNumber(): number | null {
  // The numbers 1 through 10
  const smallNumbers = Array.from({ length: 10 }, (_, i) => i + 1);

  return getRandomElementFrom(smallNumbers);
}
