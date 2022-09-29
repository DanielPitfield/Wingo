export function getRandomElementFrom(array: any[]) {
  if (!array || array.length === 0) {
    return null;
  }

  // Math.floor() can be used because Math.random() generates a number between 0 (inclusive) and 1 (exclusive)
  return array[Math.floor(Math.random() * array.length)];
}
