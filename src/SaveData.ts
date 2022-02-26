export type DailyWordSaveData = {
  dailyWord: string;
  guesses: string[];
  wordIndex: number;
  inProgress: boolean;
  currentWord: string;
};

/** */
export class SaveData {
  /**
   * Sets the last daily word guesses played.
   * @param dailyWord The word being played.
   * @param guesses The guesses made.
   */
  public static setDailyWordGuesses(dailyWord: string, guesses: string[], wordIndex: number, inProgress: boolean, currentWord: string) {
    localStorage.setItem(
      "dailyWordGuesses",
      JSON.stringify({ dailyWord, guesses, wordIndex, inProgress, currentWord })
    );
  }

  /**
   * Gets the last daily word guesses played, or null if not yet played.
   */
  public static getDailyWordGuesses(): DailyWordSaveData | null {
    const dailyWordGuesses = localStorage.getItem("dailyWordGuesses");

    if (dailyWordGuesses) {
      return JSON.parse(dailyWordGuesses) as DailyWordSaveData;
    }

    return null;
  }

  /**
   * Adds the specified amount of gold, and saves it in storage.
   * @param gold Gold to add.
   */
  public static addGold(gold: number) {
    const existingGold = SaveData.readGold();

    const newGold = existingGold + gold;

    // Update the data item in local storage
    localStorage.setItem("gold", newGold.toString());
  }

  /**
   * Reads the stored amount of gold from storage.
   */
  public static readGold(): number {
    const gold = localStorage.getItem("gold");

    if (gold) {
      return parseInt(gold);
    }

    return 0;
  }
}
