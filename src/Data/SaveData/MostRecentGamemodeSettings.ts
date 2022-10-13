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
 * Saves the most recent gamemodeSettings for Wingo Config.
 * @param gamemodeSettings The latest gamemodeSettings for Wingo Config to save.
 */
export function setMostRecentWingoConfigGamemodeSettings(page: PagePath, gamemodeSettings: WingoConfigProps["gamemodeSettings"]) {
  const itemName = getLocalStorageItemName(page);

  if (itemName) {
    localStorage.setItem(itemName, JSON.stringify(gamemodeSettings));
  }
}

/**
 * Gets the saved gamemodeSettings for Wingo Config, or null if no saved gamemodeSettings were found.
 * @returns The saved gamemodeSettings for Wingo Config to save.
 */
export function getMostRecentWingoConfigGamemodeSettings(page: PagePath): WingoConfigProps["gamemodeSettings"] | null {
  const itemName = getLocalStorageItemName(page);

  if (itemName) {
    const wingoConfigGamemodeSettings = localStorage.getItem(itemName);

    // If saved gamemodeSettings were found
    if (wingoConfigGamemodeSettings) {
      return JSON.parse(wingoConfigGamemodeSettings) as WingoConfigProps["gamemodeSettings"];
    }
  }

  // Else if not found; return null
  return null;
}

export function setMostRecentWingoInterlinkedGamemodeSettings(
  page: PagePath,
  gamemodeSettings: WingoInterlinkedProps["gamemodeSettings"]
) {
  const itemName = getLocalStorageItemName(page);

  if (itemName) {
    localStorage.setItem(itemName, JSON.stringify(gamemodeSettings));
  }
}

export function getMostRecentWingoInterlinkedGamemodeSettings(page: PagePath): WingoInterlinkedProps["gamemodeSettings"] | null {
  const itemName = getLocalStorageItemName(page);

  if (itemName) {
    const wingoInterlinkedConfigGamemodeSettings = localStorage.getItem(itemName);

    if (wingoInterlinkedConfigGamemodeSettings) {
      return JSON.parse(wingoInterlinkedConfigGamemodeSettings) as WingoInterlinkedProps["gamemodeSettings"];
    }
  }

  return null;
}

export function setMostRecentNumbleConfigGamemodeSettings(gamemodeSettings: NumbleConfigProps["gamemodeSettings"]) {
  localStorage.setItem("numbleConfigGamemodeSettings", JSON.stringify(gamemodeSettings));
}

export function getMostRecentNumbleConfigGamemodeSettings(): NumbleConfigProps["gamemodeSettings"] | null {
  const numbleConfigGamemodeSettings = localStorage.getItem("numbleConfigGamemodeSettings");

  if (numbleConfigGamemodeSettings) {
    return JSON.parse(numbleConfigGamemodeSettings) as NumbleConfigProps["gamemodeSettings"];
  }

  return null;
}

export function setMostRecentLetterCategoriesConfigGamemodeSettings(
  gamemodeSettings: LetterCategoriesConfigProps["gamemodeSettings"]
) {
  localStorage.setItem("letterCategoriesConfigGamemodeSettings", JSON.stringify(gamemodeSettings));
}

export function getMostRecentLetterCategoriesConfigGamemodeSettings(): LetterCategoriesConfigProps["gamemodeSettings"] | null {
  const letterCategoriesConfigGamemodeSettings = localStorage.getItem("letterCategoriesConfigGamemodeSettings");

  if (letterCategoriesConfigGamemodeSettings) {
    return JSON.parse(letterCategoriesConfigGamemodeSettings) as LetterCategoriesConfigProps["gamemodeSettings"];
  }

  return null;
}

export function setMostRecentLettersGameConfigGamemodeSettings(gamemodeSettings: LettersGameConfigProps["gamemodeSettings"]) {
  localStorage.setItem("lettersGameConfigGamemodeSettings", JSON.stringify(gamemodeSettings));
}

export function getMostRecentLettersGameConfigGamemodeSettings(): LettersGameConfigProps["gamemodeSettings"] | null {
  const lettersGameConfigGamemodeSettings = localStorage.getItem("lettersGameConfigGamemodeSettings");

  if (lettersGameConfigGamemodeSettings) {
    return JSON.parse(lettersGameConfigGamemodeSettings) as LettersGameConfigProps["gamemodeSettings"];
  }

  return null;
}

export function setMostRecentNumbersGameConfigGamemodeSettings(gamemodeSettings: NumbersGameConfigProps["gamemodeSettings"]) {
  localStorage.setItem("numbersGameConfigGamemodeSettings", JSON.stringify(gamemodeSettings));
}

export function getMostRecentNumbersGameConfigGamemodeSettings(): NumbersGameConfigProps["gamemodeSettings"] | null {
  const numbersGameConfigGamemodeSettings = localStorage.getItem("numbersGameConfigGamemodeSettings");

  if (numbersGameConfigGamemodeSettings) {
    return JSON.parse(numbersGameConfigGamemodeSettings) as NumbersGameConfigProps["gamemodeSettings"];
  }

  return null;
}

export function setMostRecentArithmeticRevealGamemodeSettings(gamemodeSettings: ArithmeticRevealProps["gamemodeSettings"]) {
  localStorage.setItem("arithmeticRevealGamemodeSettings", JSON.stringify(gamemodeSettings));
}

export function getMostRecentArithmeticRevealGamemodeSettings(): ArithmeticRevealProps["gamemodeSettings"] | null {
  const arithmeticRevealGamemodeSettings = localStorage.getItem("arithmeticRevealGamemodeSettings");

  if (arithmeticRevealGamemodeSettings) {
    return JSON.parse(arithmeticRevealGamemodeSettings) as ArithmeticRevealProps["gamemodeSettings"];
  }

  return null;
}

export function setMostRecentArithmeticDragGamemodeSettings(
  page: PagePath,
  gamemodeSettings: ArithmeticDragProps["gamemodeSettings"]
) {
  const itemName = getLocalStorageItemName(page);

  if (itemName) {
    localStorage.setItem(itemName, JSON.stringify(gamemodeSettings));
  }
}

export function getMostRecentArithmeticDragGamemodeSettings(page: PagePath): ArithmeticDragProps["gamemodeSettings"] | null {
  const itemName = getLocalStorageItemName(page);

  if (itemName) {
    const arithmeticDragGamemodeSettings = localStorage.getItem(itemName);

    if (arithmeticDragGamemodeSettings) {
      return JSON.parse(arithmeticDragGamemodeSettings) as ArithmeticDragProps["gamemodeSettings"];
    }
  }

  return null;
}

export function setMostRecentOnlyConnectGamemodeSettings(gamemodeSettings: OnlyConnectProps["gamemodeSettings"]) {
  localStorage.setItem("onlyConnectGamemodeSettings", JSON.stringify(gamemodeSettings));
}

export function getMostRecentOnlyConnectGamemodeSettings(): OnlyConnectProps["gamemodeSettings"] | null {
  const onlyConnectGamemodeSettings = localStorage.getItem("onlyConnectGamemodeSettings");

  if (onlyConnectGamemodeSettings) {
    return JSON.parse(onlyConnectGamemodeSettings) as OnlyConnectProps["gamemodeSettings"];
  }

  return null;
}

export function setMostRecentSameLetterWordsGamemodeSettings(gamemodeSettings: SameLetterWordsProps["gamemodeSettings"]) {
  localStorage.setItem("sameLetterWordsGamemodeSettings", JSON.stringify(gamemodeSettings));
}

export function getMostRecentSameLetterWordsGamemodeSettings(): SameLetterWordsProps["gamemodeSettings"] | null {
  const sameLetterWordsGamemodeSettings = localStorage.getItem("sameLetterWordsGamemodeSettings");

  if (sameLetterWordsGamemodeSettings) {
    return JSON.parse(sameLetterWordsGamemodeSettings) as SameLetterWordsProps["gamemodeSettings"];
  }

  return null;
}

export function setMostRecentNumberSetsGamemodeSettings(gamemodeSettings: NumberSetsProps["gamemodeSettings"]) {
  localStorage.setItem("numberSetsGamemodeSettings", JSON.stringify(gamemodeSettings));
}

export function getMostRecentNumberSetsGamemodeSettings(): NumberSetsProps["gamemodeSettings"] | null {
  const numberSetsGamemodeSettings = localStorage.getItem("numberSetsGamemodeSettings");

  if (numberSetsGamemodeSettings) {
    return JSON.parse(numberSetsGamemodeSettings) as NumberSetsProps["gamemodeSettings"];
  }

  return null;
}

export function setMostRecentAlgebraGamemodeSettings(gamemodeSettings: AlgebraProps["gamemodeSettings"]) {
  localStorage.setItem("algebraGamemodeSettings", JSON.stringify(gamemodeSettings));
}

export function getMostRecentAlgebraGamemodeSettings(): AlgebraProps["gamemodeSettings"] | null {
  const algebraGamemodeSettings = localStorage.getItem("algebraGamemodeSettings");

  if (algebraGamemodeSettings) {
    return JSON.parse(algebraGamemodeSettings) as AlgebraProps["gamemodeSettings"];
  }

  return null;
}

export function setMostRecentWordCodesGamemodeSettings(page: PagePath, gamemodeSettings: WordCodesProps["gamemodeSettings"]) {
  const itemName = getLocalStorageItemName(page);

  if (itemName) {
    localStorage.setItem(itemName, JSON.stringify(gamemodeSettings));
  }
}

export function getMostRecentWordCodesGamemodeSettings(page: PagePath): WordCodesProps["gamemodeSettings"] | null {
  const itemName = getLocalStorageItemName(page);

  if (itemName) {
    const wordCodesGamemodeSettings = localStorage.getItem(itemName);

    if (wordCodesGamemodeSettings) {
      return JSON.parse(wordCodesGamemodeSettings) as WordCodesProps["gamemodeSettings"];
    }
  }

  return null;
}
