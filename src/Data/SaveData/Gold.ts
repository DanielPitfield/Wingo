/**
 * Reads the stored amount of gold from storage.
 */
export function readGold(): number {
  const gold: number = parseInt(localStorage.getItem("gold") ?? "0");

  if (isNaN(gold)) {
    return 0;
  }

  return gold;
}

/**
 * Sets the specified amount of gold, and saves it in storage.
 * @param gold Gold to set to.
 */
export function setGold(gold: number) {
  localStorage.setItem("gold", gold.toString());
}
