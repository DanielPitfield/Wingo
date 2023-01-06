import {
  defaultWingoGamemodeSettings,
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
  commonWingoSettings,
  defaultWingoInterlinkedGamemodeSettings,
} from "../Data/DefaultGamemodeSettings";
import { PagePath } from "../Data/PageNames";
import {
  getMostRecentWingoConfigGamemodeSettings,
  getMostRecentLetterCategoriesConfigGamemodeSettings,
  getMostRecentLettersGameConfigGamemodeSettings,
  getMostRecentNumbersGameConfigGamemodeSettings,
  getMostRecentArithmeticRevealGamemodeSettings,
  getMostRecentArithmeticDragGamemodeSettings,
  getMostRecentNumbleConfigGamemodeSettings,
  getMostRecentOnlyConnectGamemodeSettings,
  getMostRecentSameLetterWordsGamemodeSettings,
  getMostRecentAlgebraGamemodeSettings,
  getMostRecentWordCodesGamemodeSettings,
  getMostRecentNumberSetsGamemodeSettings,
} from "../Data/SaveData/MostRecentGamemodeSettings";
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
import { WingoInterlinkedProps } from "../Pages/WingoInterlinked";
import { WordCodesProps } from "../Pages/WordCodes";

export function getPageGamemodeSettings(page: PagePath) {
  switch (page) {
    case "/Wingo/Daily":
      // Daily mode should always use the same settings (never from SaveData)
      return (defaultWingoGamemodeSettings.find((x) => x.page === page)?.settings ??
        commonWingoSettings) as WingoConfigProps["gamemodeSettings"];

    case "/Wingo/Repeat":
    case "/Wingo/Category":
    case "/Wingo/Increasing":
    case "/Wingo/Limitless":
    case "/Wingo/Puzzle":
    case "/Conundrum":
      return (getMostRecentWingoConfigGamemodeSettings(page) ??
        defaultWingoGamemodeSettings.find((x) => x.page === page)?.settings ??
        commonWingoSettings) as WingoConfigProps["gamemodeSettings"];

    case "/Wingo/Interlinked":
    case "/Wingo/Crossword":
    case "/Wingo/Crossword/Fit":
    case "/Wingo/Crossword/Daily":
    case "/Wingo/Crossword/Weekly":
      /*
        The gamemode settings are redefined in WingoConfig (when rendering a WingoInterlinked component)
        Just pass fallback settings through, because gamemodeSettings can't be left undefined
      */
      return defaultWingoInterlinkedGamemodeSettings as WingoInterlinkedProps["gamemodeSettings"];

    case "/LettersCategories":
      return (getMostRecentLetterCategoriesConfigGamemodeSettings() ??
        defaultLetterCategoriesGamemodeSettings) as LetterCategoriesConfigProps["gamemodeSettings"];

    case "/LettersGame":
      return (getMostRecentLettersGameConfigGamemodeSettings() ??
        defaultLettersGameGamemodeSettings) as LettersGameConfigProps["gamemodeSettings"];

    case "/NumbersGame":
      return (getMostRecentNumbersGameConfigGamemodeSettings() ??
        defaultNumbersGameGamemodeSettings) as NumbersGameConfigProps["gamemodeSettings"];

    case "/ArithmeticReveal":
      return (getMostRecentArithmeticRevealGamemodeSettings() ??
        defaultArithmeticRevealGamemodeSettings) as ArithmeticRevealProps["gamemodeSettings"];

    case "/ArithmeticDrag/Order":
      return (getMostRecentArithmeticDragGamemodeSettings("/ArithmeticDrag/Order") ??
        defaultArithmeticDragOrderGamemodeSettings) as ArithmeticDragProps["gamemodeSettings"];

    case "/ArithmeticDrag/Match":
      return (getMostRecentArithmeticDragGamemodeSettings("/ArithmeticDrag/Match") ??
        defaultArithmeticDragMatchGamemodeSettings) as ArithmeticDragProps["gamemodeSettings"];

    case "/Numble":
      return (getMostRecentNumbleConfigGamemodeSettings() ??
        defaultNumbleGamemodeSettings) as NumbleConfigProps["gamemodeSettings"];

    case "/OnlyConnect":
      return (getMostRecentOnlyConnectGamemodeSettings() ??
        defaultOnlyConnectGamemodeSettings) as OnlyConnectProps["gamemodeSettings"];

    case "/SameLetters":
      return (getMostRecentSameLetterWordsGamemodeSettings() ??
        defaultSameLetterWordsGamemodeSettings) as SameLetterWordsProps["gamemodeSettings"];

    case "/NumberSets":
      return (getMostRecentNumberSetsGamemodeSettings() ??
        defaultNumberSetsGamemodeSettings) as NumberSetsProps["gamemodeSettings"];

    case "/Algebra":
      return (getMostRecentAlgebraGamemodeSettings() ??
        defaultAlgebraGamemodeSettings) as AlgebraProps["gamemodeSettings"];

    case "/WordCodes/Question":
      return (getMostRecentWordCodesGamemodeSettings("/WordCodes/Question") ??
        defaultWordCodesQuestionGamemodeSettings) as WordCodesProps["gamemodeSettings"];

    case "/WordCodes/Match":
      return (getMostRecentWordCodesGamemodeSettings("/WordCodes/Match") ??
        defaultWordCodesMatchGamemodeSettings) as WordCodesProps["gamemodeSettings"];

    default:
      return commonWingoSettings as WingoConfigProps["gamemodeSettings"];
  }
}
