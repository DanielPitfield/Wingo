/**
 * Reads the stored amount of gold from storage.
 */
//TODO: Refactor
export function readGold(): number {
  const gold = localStorage.getItem("gold");

  if (!gold) {
    return 0;
  }

  const parsedGold = parseInt(gold);

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
  // Update the data item in local storage
  localStorage.setItem("gold", gold.toString());
}
