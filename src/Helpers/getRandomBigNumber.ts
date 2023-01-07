import { getRandomElementFrom } from "./getRandomElementFrom";

export function getRandomBigNumber(hasScaryNumbers: boolean): number | null {
  const bigNumbers = hasScaryNumbers
    ? // The numbers 1 to 99 (without multiples of 10 becuase they would be too easy)
      Array.from({ length: 99 }, (_, i) => i + 1).filter((number) => number % 10 !== 0)
    : // The four standard big numbers
      [25, 50, 75, 100];

  return getRandomElementFrom(bigNumbers);
}
