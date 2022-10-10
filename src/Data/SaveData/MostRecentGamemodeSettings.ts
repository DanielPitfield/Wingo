import { getLocalStorageItemName } from "../../Helpers/getLocalStorageItemName";
import { AlgebraProps } from "../../Pages/Algebra";
import { ArithmeticDragProps } from "../../Pages/ArithmeticDrag";
import { ArithmeticRevealProps } from "../../Pages/ArithmeticReveal";
import { LetterCategoriesConfigProps } from "../../Pages/LetterCategoriesConfig";
import { LettersGameConfigProps } from "../../Pages/LettersGameConfig";
import { NumberSetsProps } from "../../Pages/NumberSets";
import { NumbersGameConfigProps } from "../../Pages/NumbersGameConfig";
import { NumbleConfigProps } from "../../Pages/NumbleConfig";
import { OnlyConnectProps } from "../../Pages/OnlyConnect";
import { SameLetterWordsProps } from "../../Pages/SameLetterWords";
import { WingoConfigProps } from "../../Pages/WingoConfig";
import { WingoInterlinkedProps } from "../../Pages/WingoInterlinked";
import { WordCodesProps } from "../../Pages/WordCodes";
import { PagePath } from "../PageNames";

/**
 * Saves the most recent gamemode settings for Wingo Config.
 * @param gameSettings The latest gamemode settings for Wingo Config to save.
 */
export function setWingoConfigGamemodeSettings(page: PagePath, gameSettings: WingoConfigProps["gamemodeSettings"]) {
  const itemName = getLocalStorageItemName(page);

  if (itemName) {
    localStorage.setItem(itemName, JSON.stringify(gameSettings));
  }
}

/**
 * Gets the saved gamemode settings for Wingo Config, or null if no saved gamemode settings were found.
 * @returns The saved gamemode settings for Wingo Config to save.
 */
export function getWingoConfigGamemodeSettings(page: PagePath): WingoConfigProps["gamemodeSettings"] | null {
  const itemName = getLocalStorageItemName(page);

  if (itemName) {
    const wingoConfigGamemodeSettings = localStorage.getItem(itemName);

    // If saved gamemode settings were found
    if (wingoConfigGamemodeSettings) {
      return JSON.parse(wingoConfigGamemodeSettings) as WingoConfigProps["gamemodeSettings"];
    }
  }

  // Else if not found; return null
  return null;
}

export function setWingoInterlinkedGamemodeSettings(
  page: PagePath,
  gameSettings: WingoInterlinkedProps["gamemodeSettings"]
) {
  const itemName = getLocalStorageItemName(page);

  if (itemName) {
    localStorage.setItem(itemName, JSON.stringify(gameSettings));
  }
}

export function getWingoInterlinkedGamemodeSettings(page: PagePath): WingoInterlinkedProps["gamemodeSettings"] | null {
  const itemName = getLocalStorageItemName(page);

  if (itemName) {
    const wingoInterlinkedConfigGamemodeSettings = localStorage.getItem(itemName);

    if (wingoInterlinkedConfigGamemodeSettings) {
      return JSON.parse(wingoInterlinkedConfigGamemodeSettings) as WingoInterlinkedProps["gamemodeSettings"];
    }
  }

  return null;
}

export function setNumbleConfigGamemodeSettings(gameSettings: NumbleConfigProps["gamemodeSettings"]) {
  localStorage.setItem("numbleConfigGamemodeSettings", JSON.stringify(gameSettings));
}

export function getNumbleConfigGamemodeSettings(): NumbleConfigProps["gamemodeSettings"] | null {
  const numbleConfigGamemodeSettings = localStorage.getItem("numbleConfigGamemodeSettings");

  if (numbleConfigGamemodeSettings) {
    return JSON.parse(numbleConfigGamemodeSettings) as NumbleConfigProps["gamemodeSettings"];
  }

  return null;
}

export function setLetterCategoriesConfigGamemodeSettings(
  gameSettings: LetterCategoriesConfigProps["gamemodeSettings"]
) {
  localStorage.setItem("letterCategoriesConfigGamemodeSettings", JSON.stringify(gameSettings));
}

export function getLetterCategoriesConfigGamemodeSettings(): LetterCategoriesConfigProps["gamemodeSettings"] | null {
  const letterCategoriesConfigGamemodeSettings = localStorage.getItem("letterCategoriesConfigGamemodeSettings");

  if (letterCategoriesConfigGamemodeSettings) {
    return JSON.parse(letterCategoriesConfigGamemodeSettings) as LetterCategoriesConfigProps["gamemodeSettings"];
  }

  return null;
}

export function setLettersGameConfigGamemodeSettings(gameSettings: LettersGameConfigProps["gamemodeSettings"]) {
  localStorage.setItem("lettersGameConfigGamemodeSettings", JSON.stringify(gameSettings));
}

export function getLettersGameConfigGamemodeSettings(): LettersGameConfigProps["gamemodeSettings"] | null {
  const lettersGameConfigGamemodeSettings = localStorage.getItem("lettersGameConfigGamemodeSettings");

  if (lettersGameConfigGamemodeSettings) {
    return JSON.parse(lettersGameConfigGamemodeSettings) as LettersGameConfigProps["gamemodeSettings"];
  }

  return null;
}

export function setNumbersGameConfigGamemodeSettings(gameSettings: NumbersGameConfigProps["gamemodeSettings"]) {
  localStorage.setItem("numbersGameConfigGamemodeSettings", JSON.stringify(gameSettings));
}

export function getNumbersGameConfigGamemodeSettings(): NumbersGameConfigProps["gamemodeSettings"] | null {
  const numbersGameConfigGamemodeSettings = localStorage.getItem("numbersGameConfigGamemodeSettings");

  if (numbersGameConfigGamemodeSettings) {
    return JSON.parse(numbersGameConfigGamemodeSettings) as NumbersGameConfigProps["gamemodeSettings"];
  }

  return null;
}

export function setArithmeticRevealGamemodeSettings(gameSettings: ArithmeticRevealProps["gamemodeSettings"]) {
  localStorage.setItem("arithmeticRevealGamemodeSettings", JSON.stringify(gameSettings));
}

export function getArithmeticRevealGamemodeSettings(): ArithmeticRevealProps["gamemodeSettings"] | null {
  const arithmeticRevealGamemodeSettings = localStorage.getItem("arithmeticRevealGamemodeSettings");

  if (arithmeticRevealGamemodeSettings) {
    return JSON.parse(arithmeticRevealGamemodeSettings) as ArithmeticRevealProps["gamemodeSettings"];
  }

  return null;
}

export function setArithmeticDragGamemodeSettings(
  page: PagePath,
  gameSettings: ArithmeticDragProps["gamemodeSettings"]
) {
  const itemName = getLocalStorageItemName(page);

  if (itemName) {
    localStorage.setItem(itemName, JSON.stringify(gameSettings));
  }
}

export function getArithmeticDragGamemodeSettings(page: PagePath): ArithmeticDragProps["gamemodeSettings"] | null {
  const itemName = getLocalStorageItemName(page);

  if (itemName) {
    const arithmeticDragGamemodeSettings = localStorage.getItem(itemName);

    if (arithmeticDragGamemodeSettings) {
      return JSON.parse(arithmeticDragGamemodeSettings) as ArithmeticDragProps["gamemodeSettings"];
    }
  }

  return null;
}

export function setOnlyConnectGamemodeSettings(gameSettings: OnlyConnectProps["gamemodeSettings"]) {
  localStorage.setItem("onlyConnectGamemodeSettings", JSON.stringify(gameSettings));
}

export function getOnlyConnectGamemodeSettings(): OnlyConnectProps["gamemodeSettings"] | null {
  const onlyConnectGamemodeSettings = localStorage.getItem("onlyConnectGamemodeSettings");

  if (onlyConnectGamemodeSettings) {
    return JSON.parse(onlyConnectGamemodeSettings) as OnlyConnectProps["gamemodeSettings"];
  }

  return null;
}

export function setSameLetterWordsGamemodeSettings(gameSettings: SameLetterWordsProps["gamemodeSettings"]) {
  localStorage.setItem("sameLetterWordsGamemodeSettings", JSON.stringify(gameSettings));
}

export function getSameLetterWordsGamemodeSettings(): SameLetterWordsProps["gamemodeSettings"] | null {
  const sameLetterWordsGamemodeSettings = localStorage.getItem("sameLetterWordsGamemodeSettings");

  if (sameLetterWordsGamemodeSettings) {
    return JSON.parse(sameLetterWordsGamemodeSettings) as SameLetterWordsProps["gamemodeSettings"];
  }

  return null;
}

export function setNumberSetsGamemodeSettings(gameSettings: NumberSetsProps["gamemodeSettings"]) {
  localStorage.setItem("numberSetsGamemodeSettings", JSON.stringify(gameSettings));
}

export function getNumberSetsGamemodeSettings(): NumberSetsProps["gamemodeSettings"] | null {
  const numberSetsGamemodeSettings = localStorage.getItem("numberSetsGamemodeSettings");

  if (numberSetsGamemodeSettings) {
    return JSON.parse(numberSetsGamemodeSettings) as NumberSetsProps["gamemodeSettings"];
  }

  return null;
}

export function setAlgebraGamemodeSettings(gameSettings: AlgebraProps["gamemodeSettings"]) {
  localStorage.setItem("algebraGamemodeSettings", JSON.stringify(gameSettings));
}

export function getAlgebraGamemodeSettings(): AlgebraProps["gamemodeSettings"] | null {
  const algebraGamemodeSettings = localStorage.getItem("algebraGamemodeSettings");

  if (algebraGamemodeSettings) {
    return JSON.parse(algebraGamemodeSettings) as AlgebraProps["gamemodeSettings"];
  }

  return null;
}

export function setWordCodesGamemodeSettings(page: PagePath, gameSettings: WordCodesProps["gamemodeSettings"]) {
  const itemName = getLocalStorageItemName(page);

  if (itemName) {
    localStorage.setItem(itemName, JSON.stringify(gameSettings));
  }
}

export function getWordCodesGamemodeSettings(page: PagePath): WordCodesProps["gamemodeSettings"] | null {
  const itemName = getLocalStorageItemName(page);

  if (itemName) {
    const wordCodesGamemodeSettings = localStorage.getItem(itemName);

    if (wordCodesGamemodeSettings) {
      return JSON.parse(wordCodesGamemodeSettings) as WordCodesProps["gamemodeSettings"];
    }
  }

  return null;
}
