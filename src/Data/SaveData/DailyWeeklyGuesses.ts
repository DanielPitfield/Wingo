import { TileStatus } from "../../Pages/WingoInterlinked";

export type DailyWingoSaveData = {
  dailyWord: string;
  guesses: string[];
  wordIndex: number;
  inProgress: boolean;
  inDictionary: boolean;
  currentWord: string;
};

export type CrossWordSaveData = {
  words: string[];
  inProgress: boolean;
  tileStatuses: TileStatus[];
  currentWords: string[];
  currentWordIndex: number;
  remainingGridGuesses: number;
  remainingWordGuesses?: number;
};

/**
 * Gets the last daily word guesses played, or null if not yet played.
 */
export function getDailyWordGuesses(): DailyWingoSaveData | null {
  const dailyWordGuesses = localStorage.getItem("dailyWordGuesses");

  if (dailyWordGuesses) {
    return JSON.parse(dailyWordGuesses) as DailyWingoSaveData;
  }

  return null;
}

/**
 * Sets the last daily word guesses played.
 * @param dailyWord The word being played.
 * @param guesses The guesses made.
 * @param wordIndex
 * @param inProgress
 * @param inDictionary
 * @param currentWord
 */
export function setDailyWordGuesses(
  dailyWord: string,
  guesses: string[],
  wordIndex: number,
  inProgress: boolean,
  inDictionary: boolean,
  currentWord: string
) {
  localStorage.setItem(
    "dailyWordGuesses",
    JSON.stringify({
      dailyWord,
      guesses,
      wordIndex,
      inDictionary,
      inProgress,
      currentWord,
    } as DailyWingoSaveData)
  );
}

/**
 * Gets the last daily crossword guesses played, or null if not yet played.
 */
export function getDailyCrossWordGuesses(): CrossWordSaveData | null {
  const dailyCrossWordGuesses = localStorage.getItem("dailyCrossWordGuesses");

  if (dailyCrossWordGuesses) {
    return JSON.parse(dailyCrossWordGuesses) as CrossWordSaveData;
  }

  return null;
}

/**
 * Sets the last daily crossword guesses played.
 * @param words The word being played.
 * @param inProgress
 * @param tileStatuses
 * @param currentWords
 * @param currentWordIndex
 * @param remainingGridGuesses
 * @param remainingWordGuesses
 */
export function setDailyCrossWordGuesses(
  words: string[],
  inProgress: boolean,
  tileStatuses: TileStatus[],
  currentWords: string[],
  currentWordIndex: number,
  remainingGridGuesses: number,
  remainingWordGuesses?: number
) {
  localStorage.setItem(
    "dailyCrossWordGuesses",
    JSON.stringify({
      words,
      inProgress,
      tileStatuses,
      currentWords,
      currentWordIndex,
      remainingGridGuesses,
      remainingWordGuesses,
    } as CrossWordSaveData)
  );
}

/**
 * Gets the last weekly crossword guesses played, or null if not yet played.
 */
export function getWeeklyCrossWordGuesses(): CrossWordSaveData | null {
  const weeklyCrossWordGuesses = localStorage.getItem("weeklyCrossWordGuesses");

  if (weeklyCrossWordGuesses) {
    return JSON.parse(weeklyCrossWordGuesses) as CrossWordSaveData;
  }

  return null;
}

/**
 * Sets the last daily crossword guesses played.
 * @param words The word being played.
 * @param inProgress
 * @param tileStatuses
 * @param currentWords
 * @param currentWordIndex
 * @param remainingGridGuesses
 * @param remainingWordGuesses
 */
export function setWeeklyCrossWordGuesses(
  words: string[],
  inProgress: boolean,
  tileStatuses: TileStatus[],
  currentWords: string[],
  currentWordIndex: number,
  remainingGridGuesses: number,
  remainingWordGuesses?: number
) {
  localStorage.setItem(
    "weeklyCrossWordGuesses",
    JSON.stringify({
      words,
      inProgress,
      tileStatuses,
      currentWords,
      currentWordIndex,
      remainingGridGuesses,
      remainingWordGuesses,
    } as CrossWordSaveData)
  );
}
