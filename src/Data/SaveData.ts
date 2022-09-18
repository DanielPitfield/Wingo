import { pageDescriptions } from "./PageDescriptions";
import { LevelConfig } from "../Components/Level";
import { BaseChallenge } from "./Challenges/BaseChallenge";
import { LettersGameConfigProps } from "../Pages/LettersGameConfig";
import { NumbersGameConfigProps } from "../Pages/NumbersGameConfig";
import { LetterCategoriesConfigProps } from "../Pages/LetterCategoriesConfig";
import { NumbleConfigProps } from "../Pages/NumbleConfig";
import { ArithmeticDragProps } from "../Pages/ArithmeticDrag";
import { ArithmeticRevealProps } from "../Pages/ArithmeticReveal";
import { OnlyConnectProps } from "../Pages/OnlyConnect";
import { Themes } from "./Themes";
import { AlgebraProps } from "../Pages/Algebra";
import { NumberSetsProps } from "../Pages/NumberSets";
import { SameLetterWordsProps } from "../Pages/SameLetterWords";
import { WordCodesProps } from "../Pages/WordCodes";
import { WingoConfigProps } from "../Pages/WingoConfig";
import { TileStatus, WingoInterlinkedProps } from "../Pages/WingoInterlinked";
import { PageName } from "./PageNames";

export type CampaignSaveData = {
  areas: { name: string; status: "locked" | "unlockable" | "unlocked"; completedLevelIds: string[] }[];
};

export type SettingsData = {
  sound: {
    masterVolume: number;
    backgroundVolume: number;
    effectsVolume: number;
  };
  graphics: {
    preferredTheme: keyof typeof Themes | null;
    animation: boolean;
  };
  gameplay: {
    keyboard: boolean;
    skipSplashscreen: boolean;
    entryPage: string | null;
  };
};

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

export type RedeemedChallengesData = {
  id: BaseChallenge["userFacingTitle"];
  redeemedTimestamp: string;
}[];

export type HistorySaveData = {
  games: {
    /** Unique identifer of the game */
    id: string;

    /** Page/mode of the game */
    page: PageName;

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

function determineLocalStorageItemName(page: PageName): string | null {
  const modeName = pageDescriptions.find((x) => x.page === page)?.title;

  if (!modeName) {
    return null;
  }

  return modeName + "gamemodeSettings";
}

/** */
export class SaveData {
  /** Settings with everything disabled */
  public static DISABLED_SETTINGS: SettingsData = {
    sound: { masterVolume: 0, effectsVolume: 0, backgroundVolume: 0 },
    graphics: { preferredTheme: null, animation: false },
    gameplay: { keyboard: false, skipSplashscreen: true, entryPage: "Home" },
  };

  /** Default settings */
  public static DEFAULT_SETTINGS: SettingsData = {
    sound: { masterVolume: 0.5, effectsVolume: 0.5, backgroundVolume: 0.35 },
    graphics: { preferredTheme: null, animation: true },
    gameplay: { keyboard: true, skipSplashscreen: false, entryPage: "Home" },
  };

  /**
   * Sets saved settings.
   * @param updatedSettings Settings to update.
   */
  public static setSettings(updatedSettings: Partial<SettingsData>) {
    const currentSettings = SaveData.getSettings();

    const settings = { ...currentSettings, ...updatedSettings };

    localStorage.setItem("settings", JSON.stringify(settings));
  }

  /**
   * Gets saved settings.
   * @returns Saved settings, or a default settings object if no saved settings found.
   */
  public static getSettings(): SettingsData {
    const settings = localStorage.getItem("settings");

    if (settings) {
      return JSON.parse(settings) as SettingsData;
    }

    return SaveData.DEFAULT_SETTINGS;
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
    const campaignProgress = localStorage.getItem("campaign_progress");

    if (campaignProgress) {
      return JSON.parse(campaignProgress) as CampaignSaveData;
    }

    return { areas: [] };
  }

  /**
   * Adds a game to the save history.
   * @param game Game to save to history.
   * @returns Identifier of the game.
   */
  public static addGameToHistory(
    page: PageName,
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
      } as DailyWingoSaveData)
    );
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
  public static setDailyCrossWordGuesses(
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
   * Sets the last daily crossword guesses played.
   * @param words The word being played.
   * @param inProgress
   * @param tileStatuses
   * @param currentWords
   * @param currentWordIndex
   * @param remainingGridGuesses
   * @param remainingWordGuesses
   */
  public static setWeeklyCrossWordGuesses(
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
   * Saves the gamemode settings for Wingo Config.
   * @param gameSettings The latest gamemode settings for Wingo Config to save.
   */
  public static setWingoConfigGamemodeSettings(page: PageName, gameSettings: WingoConfigProps["gamemodeSettings"]) {
    const itemName = determineLocalStorageItemName(page);

    if (!itemName) {
      return;
    }

    localStorage.setItem(itemName, JSON.stringify(gameSettings));
  }

  /**
   * Gets the saved gamemode settings for Wingo Config, or null if no saved gamemode settings were found.
   * @returns The saved gamemode settings for Wingo Config to save.
   */
  public static getWingoConfigGamemodeSettings(page: PageName): WingoConfigProps["gamemodeSettings"] | null {
    const itemName = determineLocalStorageItemName(page);

    if (!itemName) {
      return null;
    }

    const wingoConfigGamemodeSettings = localStorage.getItem(itemName);

    // If saved gamemode settings were found
    if (wingoConfigGamemodeSettings) {
      return JSON.parse(wingoConfigGamemodeSettings) as WingoConfigProps["gamemodeSettings"];
    }

    // Else if not found; return null
    return null;
  }

  public static setWingoInterlinkedGamemodeSettings(
    page: PageName,
    gameSettings: WingoInterlinkedProps["gamemodeSettings"]
  ) {
    const itemName = determineLocalStorageItemName(page);

    if (!itemName) {
      return;
    }

    localStorage.setItem(itemName, JSON.stringify(gameSettings));
  }

  public static getWingoInterlinkedGamemodeSettings(page: PageName): WingoInterlinkedProps["gamemodeSettings"] | null {
    const itemName = determineLocalStorageItemName(page);

    if (!itemName) {
      return null;
    }

    const wingoInterlinkedConfigGamemodeSettings = localStorage.getItem(itemName);

    // If saved gamemode settings were found
    if (wingoInterlinkedConfigGamemodeSettings) {
      return JSON.parse(wingoInterlinkedConfigGamemodeSettings) as WingoInterlinkedProps["gamemodeSettings"];
    }

    // Else if not found; return null
    return null;
  }

  public static setNumbleConfigGamemodeSettings(gameSettings: NumbleConfigProps["gamemodeSettings"]) {
    localStorage.setItem("numbleConfigGamemodeSettings", JSON.stringify(gameSettings));
  }

  public static getNumbleConfigGamemodeSettings(): NumbleConfigProps["gamemodeSettings"] | null {
    const numbleConfigGamemodeSettings = localStorage.getItem("numbleConfigGamemodeSettings");

    if (numbleConfigGamemodeSettings) {
      return JSON.parse(numbleConfigGamemodeSettings) as NumbleConfigProps["gamemodeSettings"];
    }

    return null;
  }

  public static setLetterCategoriesConfigGamemodeSettings(
    gameSettings: LetterCategoriesConfigProps["gamemodeSettings"]
  ) {
    localStorage.setItem("letterCategoriesConfigGamemodeSettings", JSON.stringify(gameSettings));
  }

  public static getLetterCategoriesConfigGamemodeSettings(): LetterCategoriesConfigProps["gamemodeSettings"] | null {
    const letterCategoriesConfigGamemodeSettings = localStorage.getItem("letterCategoriesConfigGamemodeSettings");

    if (letterCategoriesConfigGamemodeSettings) {
      return JSON.parse(letterCategoriesConfigGamemodeSettings) as LetterCategoriesConfigProps["gamemodeSettings"];
    }

    return null;
  }

  public static setLettersGameConfigGamemodeSettings(gameSettings: LettersGameConfigProps["gamemodeSettings"]) {
    localStorage.setItem("lettersGameConfigGamemodeSettings", JSON.stringify(gameSettings));
  }

  public static getLettersGameConfigGamemodeSettings(): LettersGameConfigProps["gamemodeSettings"] | null {
    const lettersGameConfigGamemodeSettings = localStorage.getItem("lettersGameConfigGamemodeSettings");

    if (lettersGameConfigGamemodeSettings) {
      return JSON.parse(lettersGameConfigGamemodeSettings) as LettersGameConfigProps["gamemodeSettings"];
    }

    return null;
  }

  public static setNumbersGameConfigGamemodeSettings(gameSettings: NumbersGameConfigProps["gamemodeSettings"]) {
    localStorage.setItem("numbersGameConfigGamemodeSettings", JSON.stringify(gameSettings));
  }

  public static getNumbersGameConfigGamemodeSettings(): NumbersGameConfigProps["gamemodeSettings"] | null {
    const numbersGameConfigGamemodeSettings = localStorage.getItem("numbersGameConfigGamemodeSettings");

    if (numbersGameConfigGamemodeSettings) {
      return JSON.parse(numbersGameConfigGamemodeSettings) as NumbersGameConfigProps["gamemodeSettings"];
    }

    return null;
  }

  public static setArithmeticRevealGamemodeSettings(gameSettings: ArithmeticRevealProps["gamemodeSettings"]) {
    localStorage.setItem("arithmeticRevealGamemodeSettings", JSON.stringify(gameSettings));
  }

  public static getArithmeticRevealGamemodeSettings(): ArithmeticRevealProps["gamemodeSettings"] | null {
    const arithmeticRevealGamemodeSettings = localStorage.getItem("arithmeticRevealGamemodeSettings");

    if (arithmeticRevealGamemodeSettings) {
      return JSON.parse(arithmeticRevealGamemodeSettings) as ArithmeticRevealProps["gamemodeSettings"];
    }

    return null;
  }

  public static setArithmeticDragGamemodeSettings(
    page: PageName,
    gameSettings: ArithmeticDragProps["gamemodeSettings"]
  ) {
    const itemName = determineLocalStorageItemName(page);

    if (!itemName) {
      return;
    }

    localStorage.setItem(itemName, JSON.stringify(gameSettings));
  }

  public static getArithmeticDragGamemodeSettings(page: PageName): ArithmeticDragProps["gamemodeSettings"] | null {
    const itemName = determineLocalStorageItemName(page);

    if (!itemName) {
      return null;
    }

    const arithmeticDragGamemodeSettings = localStorage.getItem(itemName);

    // If saved gamemode settings were found
    if (arithmeticDragGamemodeSettings) {
      return JSON.parse(arithmeticDragGamemodeSettings) as ArithmeticDragProps["gamemodeSettings"];
    }

    // Else if not found; return null
    return null;
  }

  public static setOnlyConnectGamemodeSettings(gameSettings: OnlyConnectProps["gamemodeSettings"]) {
    localStorage.setItem("onlyConnectGamemodeSettings", JSON.stringify(gameSettings));
  }

  public static getOnlyConnectGamemodeSettings(): OnlyConnectProps["gamemodeSettings"] | null {
    const onlyConnectGamemodeSettings = localStorage.getItem("onlyConnectGamemodeSettings");

    if (onlyConnectGamemodeSettings) {
      return JSON.parse(onlyConnectGamemodeSettings) as OnlyConnectProps["gamemodeSettings"];
    }

    return null;
  }

  public static setSameLetterWordsGamemodeSettings(gameSettings: SameLetterWordsProps["gamemodeSettings"]) {
    localStorage.setItem("sameLetterWordsGamemodeSettings", JSON.stringify(gameSettings));
  }

  public static getSameLetterWordsGamemodeSettings(): SameLetterWordsProps["gamemodeSettings"] | null {
    const sameLetterWordsGamemodeSettings = localStorage.getItem("sameLetterWordsGamemodeSettings");

    if (sameLetterWordsGamemodeSettings) {
      return JSON.parse(sameLetterWordsGamemodeSettings) as SameLetterWordsProps["gamemodeSettings"];
    }

    return null;
  }

  public static setNumberSetsGamemodeSettings(gameSettings: NumberSetsProps["gamemodeSettings"]) {
    localStorage.setItem("numberSetsGamemodeSettings", JSON.stringify(gameSettings));
  }

  public static getNumberSetsGamemodeSettings(): NumberSetsProps["gamemodeSettings"] | null {
    const numberSetsGamemodeSettings = localStorage.getItem("numberSetsGamemodeSettings");

    if (numberSetsGamemodeSettings) {
      return JSON.parse(numberSetsGamemodeSettings) as NumberSetsProps["gamemodeSettings"];
    }

    return null;
  }

  public static setAlgebraGamemodeSettings(gameSettings: AlgebraProps["gamemodeSettings"]) {
    localStorage.setItem("algebraGamemodeSettings", JSON.stringify(gameSettings));
  }

  public static getAlgebraGamemodeSettings(): AlgebraProps["gamemodeSettings"] | null {
    const algebraGamemodeSettings = localStorage.getItem("algebraGamemodeSettings");

    if (algebraGamemodeSettings) {
      return JSON.parse(algebraGamemodeSettings) as AlgebraProps["gamemodeSettings"];
    }

    return null;
  }

  public static setWordCodesGamemodeSettings(page: PageName, gameSettings: WordCodesProps["gamemodeSettings"]) {
    const itemName = determineLocalStorageItemName(page);

    if (!itemName) {
      return;
    }

    localStorage.setItem(itemName, JSON.stringify(gameSettings));
  }

  public static getWordCodesGamemodeSettings(page: PageName): WordCodesProps["gamemodeSettings"] | null {
    const itemName = determineLocalStorageItemName(page);

    if (!itemName) {
      return null;
    }

    const wordCodesGamemodeSettings = localStorage.getItem(itemName);

    // If saved gamemode settings were found
    if (wordCodesGamemodeSettings) {
      return JSON.parse(wordCodesGamemodeSettings) as WordCodesProps["gamemodeSettings"];
    }

    // Else if not found; return null
    return null;
  }

  /**
   * Gets the last daily word guesses played, or null if not yet played.
   */
  public static getDailyWordGuesses(): DailyWingoSaveData | null {
    const dailyWordGuesses = localStorage.getItem("dailyWordGuesses");

    if (dailyWordGuesses) {
      return JSON.parse(dailyWordGuesses) as DailyWingoSaveData;
    }

    return null;
  }

  /**
   * Gets the last daily crossword guesses played, or null if not yet played.
   */
  public static getDailyCrossWordGuesses(): CrossWordSaveData | null {
    const dailyCrossWordGuesses = localStorage.getItem("dailyCrossWordGuesses");

    if (dailyCrossWordGuesses) {
      return JSON.parse(dailyCrossWordGuesses) as CrossWordSaveData;
    }

    return null;
  }

  /**
   * Gets the last weekly crossword guesses played, or null if not yet played.
   */
  public static getWeeklyCrossWordGuesses(): CrossWordSaveData | null {
    const weeklyCrossWordGuesses = localStorage.getItem("weeklyCrossWordGuesses");

    if (weeklyCrossWordGuesses) {
      return JSON.parse(weeklyCrossWordGuesses) as CrossWordSaveData;
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
