import {
  defaultWingoGamemodeSettings,
  fallbackWingoSettings,
  defaultLetterCategoriesGamemodeSettings,
  defaultLettersGameGamemodeSettings,
  defaultNumbersGameGamemodeSettings,
  defaultArithmeticRevealGamemodeSettings,
  defaultArithmeticDragOrderGamemodeSettings,
  defaultArithmeticDragMatchGamemodeSettings,
  defaultNumbleGamemodeSettings,
  defaultOnlyConnectGamemodeSettings,
  defaultSameLetterWordsGamemodeSettings,
  defaultNumberSetsGamemodeSettings,
  defaultAlgebraGamemodeSettings,
  defaultWordCodesQuestionGamemodeSettings,
  defaultWordCodesMatchGamemodeSettings,
} from "../Data/DefaultGamemodeSettings";
import { PageName } from "../Data/PageNames";
import { SaveData } from "../Data/SaveData";
import { AlgebraProps } from "../Pages/Algebra";
import { ArithmeticDragProps } from "../Pages/ArithmeticDrag";
import { ArithmeticRevealProps } from "../Pages/ArithmeticReveal";
import { LetterCategoriesConfigProps } from "../Pages/LetterCategoriesConfig";
import { LettersGameConfigProps } from "../Pages/LettersGameConfig";
import { NumberSetsProps } from "../Pages/NumberSets";
import { NumbersGameConfigProps } from "../Pages/NumbersGameConfig";
import { NumbleConfigProps } from "../Pages/NumbleConfig";
import { OnlyConnectProps } from "../Pages/OnlyConnect";
import { SameLetterWordsProps } from "../Pages/SameLetterWords";
import { WingoConfigProps } from "../Pages/WingoConfig";
import { WordCodesProps } from "../Pages/WordCodes";

// TODO: Uses the path not the PageName?
export function getPageGamemodeSettings(page: PageName) {
  switch (page) {
    case "wingo/daily":
      // Daily mode should always use the same settings (never from SaveData)
      return (defaultWingoGamemodeSettings.find((x) => x.page === page)?.settings ??
        fallbackWingoSettings) as WingoConfigProps["gamemodeSettings"];

    case "wingo/repeat":
    case "wingo/category":
    case "wingo/increasing":
    case "wingo/limitless":
    case "wingo/puzzle":
    case "Conundrum":
      return (SaveData.getWingoConfigGamemodeSettings(page) ??
        defaultWingoGamemodeSettings.find((x) => x.page === page)?.settings ??
        fallbackWingoSettings) as WingoConfigProps["gamemodeSettings"];

    case "wingo/interlinked":
    case "wingo/crossword":
    case "wingo/crossword/fit":
    case "wingo/crossword/daily":
    case "wingo/crossword/weekly":
      /*
        The gamemode settings are redefined in WingoConfig (when rendering a WingoInterlinked component)
        Just pass fallback settings through, because gamemodeSettings can't be left undefined
      */
      return fallbackWingoSettings as WingoConfigProps["gamemodeSettings"];

    case "LettersCategories":
      return (SaveData.getLetterCategoriesConfigGamemodeSettings() ??
        defaultLetterCategoriesGamemodeSettings) as LetterCategoriesConfigProps["gamemodeSettings"];

    case "LettersGame":
      return (SaveData.getLettersGameConfigGamemodeSettings() ??
        defaultLettersGameGamemodeSettings) as LettersGameConfigProps["gamemodeSettings"];

    case "NumbersGame":
      return (SaveData.getNumbersGameConfigGamemodeSettings() ??
        defaultNumbersGameGamemodeSettings) as NumbersGameConfigProps["gamemodeSettings"];

    case "ArithmeticReveal":
      return (SaveData.getArithmeticRevealGamemodeSettings() ??
        defaultArithmeticRevealGamemodeSettings) as ArithmeticRevealProps["gamemodeSettings"];

    case "ArithmeticDrag/Order":
      return (SaveData.getArithmeticDragGamemodeSettings("ArithmeticDrag/Order") ??
        defaultArithmeticDragOrderGamemodeSettings) as ArithmeticDragProps["gamemodeSettings"];

    case "ArithmeticDrag/Match":
      return (SaveData.getArithmeticDragGamemodeSettings("ArithmeticDrag/Match") ??
        defaultArithmeticDragMatchGamemodeSettings) as ArithmeticDragProps["gamemodeSettings"];

    case "Numble":
      return (SaveData.getNumbleConfigGamemodeSettings() ??
        defaultNumbleGamemodeSettings) as NumbleConfigProps["gamemodeSettings"];

    case "OnlyConnect":
      return (SaveData.getOnlyConnectGamemodeSettings() ??
        defaultOnlyConnectGamemodeSettings) as OnlyConnectProps["gamemodeSettings"];

    case "SameLetters":
      return (SaveData.getSameLetterWordsGamemodeSettings() ??
        defaultSameLetterWordsGamemodeSettings) as SameLetterWordsProps["gamemodeSettings"];

    case "NumberSets":
      return (SaveData.getNumberSetsGamemodeSettings() ??
        defaultNumberSetsGamemodeSettings) as NumberSetsProps["gamemodeSettings"];

    case "Algebra":
      return (SaveData.getAlgebraGamemodeSettings() ??
        defaultAlgebraGamemodeSettings) as AlgebraProps["gamemodeSettings"];

    case "WordCodes/Question":
      return (SaveData.getWordCodesGamemodeSettings("WordCodes/Question") ??
        defaultWordCodesQuestionGamemodeSettings) as WordCodesProps["gamemodeSettings"];

    case "WordCodes/Match":
      return (SaveData.getWordCodesGamemodeSettings("WordCodes/Match") ??
        defaultWordCodesMatchGamemodeSettings) as WordCodesProps["gamemodeSettings"];

    default:
      return fallbackWingoSettings as WingoConfigProps["gamemodeSettings"];
  }
}
