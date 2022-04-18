import { Page } from "./App";
import { BaseChallenge } from "./Challenges/BaseChallenge";

export type CampaignSaveData = {
  areas: { name: string; status: "locked" | "unlockable" | "unlocked"; completedLevelIds: string[] }[];
};

export type SettingsData = {
  sound: {
    soundEnabled: boolean;
    volume: number;
  };
};

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
   *
   * @param updatedSettings
   */
  public static setSettings(updatedSettings: Partial<SettingsData>) {
    const currentSettings = SaveData.getSettings();

    const settings = { ...currentSettings, ...updatedSettings };

    localStorage.setItem("settings", JSON.stringify(settings));
  }

  /**
   *
   * @returns
   */
  public static getSettings(): SettingsData {
    const settings = localStorage.getItem("settings");

    if (settings) {
      return JSON.parse(settings) as SettingsData;
    }

    return { sound: { volume: 1.0, soundEnabled: true } };
  }

  /**
   * Incements the completed level count for the specified area.
   * @param areaName Name of the campaign area.
   */
  public static addCompletedCampaignAreaUnlockLevel(areaName: CampaignSaveData["areas"][0]["name"]) {
    // Get the current campaign progress (which is to be updated)
    const campaignProgress = SaveData.getCampaignProgress();

    const newAreaData: CampaignSaveData["areas"][0] = {
      name: areaName,
      status: "unlocked",
      completedLevelIds: ["unlock"],
    };

    const newCampaignProgress = {
      ...campaignProgress,
      areas: campaignProgress.areas.filter((x) => x.name !== areaName).concat([newAreaData]),
    };

    localStorage.setItem("campaign_progress", JSON.stringify(newCampaignProgress));
  }

  /**
   * Incements the completed level count for the specified area.
   * @param areaName Name of the campaign area.
   * @param levelId ID of the area.
   */
  public static addCompletedCampaignAreaLevel(areaName: CampaignSaveData["areas"][0]["name"], levelId: string) {
    // Get the current campaign progress (which is to be updated)
    const campaignProgress = SaveData.getCampaignProgress();

    // Find the existing area info (if any)
    const existingArea = campaignProgress.areas.find((x) => x.name === areaName);

    const newAreaData: CampaignSaveData["areas"][0] = {
      name: areaName,
      status: "unlocked",
      completedLevelIds: Array.from(new Set((existingArea?.completedLevelIds || ["unlock"]).concat(levelId))),
    };

    const newCampaignProgress = {
      ...campaignProgress,
      areas: campaignProgress.areas.filter((x) => x.name !== areaName).concat([newAreaData]),
    };

    localStorage.setItem("campaign_progress", JSON.stringify(newCampaignProgress));
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

    return { areas: [] };
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
