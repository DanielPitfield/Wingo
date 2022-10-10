import { LevelConfig } from "../../Components/Level";
import { PagePath } from "../PageNames";

export type HistorySaveData = {
  games: {
    /** Unique identifer of the game */
    id: string;

    /** Page/mode of the game */
    page: PagePath;

    /** Configuration at the start of the game */
    configAtStartOfGame: {
      timestamp: string;
    } & LevelConfig["level"];

    /** Configuration of the rounds in the game (including the last) */
    completedRounds: ({
      /** Unique identifer of the game */
      id: string;

      timestamp: string;
      outcome: "success" | "failure";
    } & LevelConfig["level"])[];
  }[];
};

/** Generates a new identifier. */
const newGuid = (): string => {
  const guidTemplate = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx";

  return guidTemplate
    .split("")
    .map((char) => {
      if (char === "x") {
        return Math.round(Math.random() * 16).toString(16);
      }
      return char;
    })
    .join("");
};

/**
 * Adds a game to the save history.
 * @param game Game to save to history.
 * @returns Identifier of the game.
 */
export function addGameToHistory(
  page: PagePath,
  configAtStartOfGame: HistorySaveData["games"][0]["configAtStartOfGame"]
): string {
  const history = getHistory();
  const id = newGuid();

  history.games.push({
    id,
    page,
    configAtStartOfGame,
    completedRounds: [],
  });

  localStorage.setItem("history", JSON.stringify(history));

  return id;
}

/**
 * Adds a round to a game's history.
 * @param gameId Identifier of the game to which to add a round.
 * @param round Round to add.
 * @returns Identifier of the round.
 */
export function addCompletedRoundToGameHistory(
  gameId: string,
  round: Omit<HistorySaveData["games"][0]["completedRounds"][0], "id">
) {
  const history = getHistory();

  const newHistory: HistorySaveData = {
    ...history,
    games: history.games.map((game) => {
      // Find the game
      if (game.id === gameId) {
        const roundWithId = round as HistorySaveData["games"][0]["completedRounds"][0]; // Add the round
        roundWithId.id = newGuid();
        game.completedRounds.push(roundWithId);
      }

      return game;
    }),
  };

  localStorage.setItem("history", JSON.stringify(newHistory));
}

/**
 * Reads the save history.
 * @returns Save history.
 */
export function getHistory(): HistorySaveData {
  const history = localStorage.getItem("history");

  if (history) {
    return JSON.parse(history) as HistorySaveData;
  }

  return {
    games: [],
  };
}
