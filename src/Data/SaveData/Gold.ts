/**
 * Reads the stored amount of gold from storage.
 */
export function readGold(): number {
  const gold = localStorage.getItem("gold") ?? "0";
  const parsedGold: number = parseInt(gold);

  if (isNaN(parsedGold)) {
    return 0;
  }

  return parsedGold;
}

/**
 * Sets the specified amount of gold, and saves it in storage.
 * @param gold Gold to set to.
 */
export function setGold(gold: number) {
  localStorage.setItem("gold", gold.toString());
}
