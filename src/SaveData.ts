import { defaultAreaStatuses, Page } from "./App";
import { AreaConfig } from "./Area";
import { BaseChallenge } from "./Challenges/BaseChallenge";
import { LevelConfig } from "./Level";

export type CampaignSaveData = {
  name: string;
  status: "locked" | "unlockable" | "unlocked";
  current_level: number;
}[];

export type DailyWordSaveData = {
  dailyWord: string;
  guesses: string[];
  wordIndex: number;
  inProgress: boolean;
  inDictionary: boolean;
  currentWord: string;
};

export type RedeemedChallengesData = {
  id: BaseChallenge["userFacingTitle"];
  redeemedTimestamp: string;
}[];

export type HistorySaveData = {
  games: {
    /** Unique identifer of the game */
    id: string;

    /** Page/mode of the game */
    page: Page;

    /** Configuration at the start of the game */
    configAtStartOfGame: {
      timestamp: string;
      wordLength: number;
      numGuesses: number;
      firstLetterProvided: boolean;
      puzzleRevealMs: number;
      puzzleLeaveNumBlanks: number;
    };

    /** Configuration of the rounds in the game (including the last) */
    completedRounds: {
      /** Unique identifer of the game */
      id: string;

      timestamp: string;
      wordLength: number;
      numGuesses: number;
      firstLetterProvided: boolean;
      puzzleRevealMs: number;
      puzzleLeaveNumBlanks: number;
      currentWord: string;
      guesses: string[];
      outcome: "success" | "failure";
    }[];
  }[];
};

/** Generates a new identifier. */
export function newGuid(): string {
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
}

/** */
export class SaveData {
  /**
   * Sets the latest campaign progress.
   * @param selectedArea AreaConfig of the selected campaign area
   * @param level LevelConfig of most recently completed level
   */

  public static setCampaignProgress(selectedArea: AreaConfig, level: LevelConfig) {
    // Get the current campaign progress (which is to be updated)
    const campaignProgress = SaveData.getCampaignProgress();

    // Completed level was the unlock level for the area
    if (level === selectedArea?.unlock_level) {
      // Update area status
      const newCampaignProgress = campaignProgress.map((area) => {
        if (area.name === selectedArea?.name && area.status === "unlockable") {
          area.status = "unlocked";
          // The first 'real' level of the area is now the current level
          area.current_level = 1;
        }
        return area;
      });
      // Update local storage
      localStorage.setItem("campaign_progress", JSON.stringify(newCampaignProgress));
    }
    // Normal level
    else {
      // Index 0 is Level 1 (so add 1)
      const current_level = selectedArea?.levels.findIndex((x) => x === level) + 1;
      if (current_level) {
        const newCampaignProgress = campaignProgress.map((area) => {
          if (area.name === selectedArea?.name && area.status === "unlocked") {
            // The current level becomes the next level
            area.current_level = current_level + 1;
          }
          return area;
        });
        localStorage.setItem("campaign_progress", JSON.stringify(newCampaignProgress));
        console.log(newCampaignProgress);
      }
    }
  }

  /**
   * Gets the campaign progress.
   * @returns Campaign progress (default campaign start if not found in save data).
   */
  public static getCampaignProgress(): CampaignSaveData {
    const campaign_progress = localStorage.getItem("campaign_progress");

    if (campaign_progress) {
      return JSON.parse(campaign_progress) as CampaignSaveData;
    }

    return defaultAreaStatuses as CampaignSaveData;
  }

  /**
   * Adds a game to the save history.
   * @param game Game to save to history.
   * @returns Identifier of the game.
   */
  public static addGameToHistory(
    page: Page,
    configAtStartOfGame: HistorySaveData["games"][0]["configAtStartOfGame"]
  ): string {
    const history = SaveData.getHistory();
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
   * Adds a game to the save history.
   * @param gameId Identifier of the game to which to add a round.
   * @param round Round to add.
   * @returns Identifier of the round.
   */
  public static addCompletedRoundToGameHistory(
    gameId: string,
    round: Omit<HistorySaveData["games"][0]["completedRounds"][0], "id">
  ) {
    const history = SaveData.getHistory();

    const newHistory: HistorySaveData = {
      ...history,
      games: history.games.map((game) => {
        // Find the game
        if (game.id === gameId) {
          // Add the round
          game.completedRounds.push({ id: newGuid(), ...round });
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
  public static getHistory(): HistorySaveData {
    const history = localStorage.getItem("history");

    if (history) {
      return JSON.parse(history) as HistorySaveData;
    }

    return {
      games: [],
    };
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
  public static setDailyWordGuesses(
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
      } as DailyWordSaveData)
    );
  }

  /**
   * Adds a redeemed challeng.
   * @param challege Redeemed challenge.
   */
  public static addRedeemedChallenge(challenge: BaseChallenge) {
    const redeemedChallenges = SaveData.getRedeemedChallenges() || [];

    redeemedChallenges.push({
      id: challenge.id(),
      redeemedTimestamp: new Date().toISOString(),
    });

    localStorage.setItem("redeemedChallenges", JSON.stringify(redeemedChallenges));
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
   * Gets the redeemed challenges, or null if not yet played.
   */
  public static getRedeemedChallenges(): RedeemedChallengesData | null {
    const redeemedChallenges = localStorage.getItem("redeemedChallenges");

    if (redeemedChallenges) {
      return JSON.parse(redeemedChallenges) as RedeemedChallengesData;
    }

    return null;
  }

  /**
   * Sets the specified amount of gold, and saves it in storage.
   * @param gold Gold to set to.
   */
  public static setGold(gold: number) {
    // Update the data item in local storage
    localStorage.setItem("gold", gold.toString());
  }

  /**
   * Reads the stored amount of gold from storage.
   */
  public static readGold(): number {
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
}
