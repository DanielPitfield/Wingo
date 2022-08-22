import { PageName } from "../PageNames";
import { NumbleConfigProps, numbleGridShape, numbleGridSize } from "../Pages/NumbleConfig";
import { WingoConfigProps } from "../Pages/WingoConfig";
import { WingoInterlinkedProps } from "../Pages/WingoInterlinked";
import { LetterCategoriesConfigProps } from "../Pages/LetterCategoriesConfig";
import { LettersGameConfigProps } from "../Pages/LettersGameConfig";
import { NumbersGameConfigProps } from "../Pages/NumbersGameConfig";
import { ArithmeticRevealProps } from "../Pages/ArithmeticReveal";
import { ArithmeticDragProps, arithmeticMode } from "../Pages/ArithmeticDrag";
import { OnlyConnectProps } from "../Pages/OnlyConnect";
import { SameLetterWordsProps } from "../Pages/SameLetterWords";
import { NumberSetsProps } from "../Pages/NumberSets";
import { AlgebraProps } from "../Pages/Algebra";
import { wordCodesMode, WordCodesProps } from "../Pages/WordCodes";
import { MAX_TARGET_WORD_LENGTH, MIN_TARGET_WORD_LENGTH } from "./GamemodeSettingsInputLimits";
import { getGamemodeDefaultWordLength } from "./DefaultWordLengths";
import { getGamemodeDefaultNumGuesses } from "./DefaultNumGuesses";
import { getGamemodeDefaultTimerValue } from "./DefaultTimerValues";

export const DEFAULT_PUZZLE_REVEAL_MS = 2000;
export const DEFAULT_PUZZLE_LEAVE_NUM_BLANKS = 3;

export const DEFAULT_NUMBERS_GAME_NUM_ROWS = 5;

export const DEFAULT_NUMBLE_GUESS_TIMER_VALUE = 20;

export const DEFAULT_WINGO_INCREASING_MAX_NUM_LIVES = 5;

export const DEFAULT_FIT_RESTRICTION = 0;

// TODO: Create a folder for each mode, each mode has its own defaultGamemodeSettings.ts file
export const defaultWingoGamemodeSettings: { page: PageName; settings: WingoConfigProps["gamemodeSettings"] }[] = [
  {
    page: "wingo/daily",
    settings: {
      wordLength: getGamemodeDefaultWordLength("wingo/daily"),
      isFirstLetterProvided: false,
      isHintShown: false,
      timerConfig: { isTimed: false },
    },
  },
  {
    page: "wingo/repeat",
    settings: {
      wordLength: getGamemodeDefaultWordLength("wingo/repeat"),
      isFirstLetterProvided: false,
      isHintShown: false,
      timerConfig: { isTimed: false },
    },
  },
  {
    page: "wingo/category",
    settings: {
      isFirstLetterProvided: false,
      isHintShown: false,
      timerConfig: { isTimed: false },
    },
  },
  {
    page: "wingo/increasing",
    settings: {
      wordLength: MIN_TARGET_WORD_LENGTH,
      wordLengthMaxLimit: MAX_TARGET_WORD_LENGTH,
      isFirstLetterProvided: false,
      isHintShown: false,
      timerConfig: { isTimed: false },
    },
  },
  {
    page: "wingo/limitless",
    settings: {
      wordLength: MIN_TARGET_WORD_LENGTH,
      wordLengthMaxLimit: MAX_TARGET_WORD_LENGTH,
      maxLivesConfig: { isLimited: false },
      isFirstLetterProvided: false,
      isHintShown: false,
      timerConfig: { isTimed: false },
    },
  },
  {
    page: "wingo/puzzle",
    settings: {
      isHintShown: true,
      puzzleRevealMs: DEFAULT_PUZZLE_REVEAL_MS,
      puzzleLeaveNumBlanks: DEFAULT_PUZZLE_LEAVE_NUM_BLANKS,
      wordLength: getGamemodeDefaultWordLength("wingo/puzzle"),
      isFirstLetterProvided: false,
      timerConfig: { isTimed: false },
    },
  },
  // The conundrum mode is actually a mode of WingoConfig
  {
    page: "Conundrum",
    settings: {
      timerConfig: { isTimed: true, seconds: getGamemodeDefaultTimerValue("wingo/puzzle") },
    },
  },
];

export const defaultWingoInterlinkedGamemodeSettings: {
  page: PageName;
  settings: WingoInterlinkedProps["gamemodeSettings"];
}[] = [
  {
    page: "wingo/crossword/daily",
    settings: {
      numWords: 6,
      minWordLength: MIN_TARGET_WORD_LENGTH,
      maxWordLength: MAX_TARGET_WORD_LENGTH,
      numWordGuesses: 10,
      numGridGuesses: 2,
      isFirstLetterProvided: false,
      isHintShown: true,
      timerConfig: { isTimed: false },
      fitRestrictionConfig: { isRestricted: false },
    },
  },
  {
    page: "wingo/crossword/weekly",
    settings: {
      numWords: 10,
      minWordLength: MIN_TARGET_WORD_LENGTH,
      maxWordLength: MAX_TARGET_WORD_LENGTH,
      numWordGuesses: 20,
      numGridGuesses: 4,
      isFirstLetterProvided: false,
      isHintShown: true,
      timerConfig: { isTimed: false },
      fitRestrictionConfig: { isRestricted: false },
    },
  },
  {
    page: "wingo/interlinked",
    settings: {
      numWords: 2,
      minWordLength: getGamemodeDefaultWordLength("wingo/interlinked"),
      maxWordLength: getGamemodeDefaultWordLength("wingo/interlinked"),
      numWordGuesses: 0,
      numGridGuesses: getGamemodeDefaultNumGuesses("wingo/interlinked"),
      isFirstLetterProvided: false,
      isHintShown: false,
      timerConfig: { isTimed: false },
      fitRestrictionConfig: { isRestricted: false },
    },
  },
  {
    page: "wingo/crossword",
    settings: {
      numWords: 6,
      minWordLength: MIN_TARGET_WORD_LENGTH,
      maxWordLength: MAX_TARGET_WORD_LENGTH,
      numWordGuesses: 10,
      numGridGuesses: 2,
      isFirstLetterProvided: false,
      isHintShown: true,
      timerConfig: { isTimed: false },
      fitRestrictionConfig: { isRestricted: false },
    },
  },
  {
    page: "wingo/crossword/fit",
    settings: {
      numWords: 6,
      minWordLength: getGamemodeDefaultWordLength("wingo/crossword/fit"),
      maxWordLength: getGamemodeDefaultWordLength("wingo/crossword/fit"),
      numWordGuesses: 0,
      numGridGuesses: 1,
      isFirstLetterProvided: false,
      isHintShown: true,
      timerConfig: { isTimed: false },
      fitRestrictionConfig: { isRestricted: false },
    },
  },
];

export const defaultLetterCategoriesGamemodeSettings: LetterCategoriesConfigProps["gamemodeSettings"] = {
  defaultNumCategories: 5,
  timerConfig: { isTimed: false },
};

export const defaultLettersGameGamemodeSettings: LettersGameConfigProps["gamemodeSettings"] = {
  defaultNumLetters: getGamemodeDefaultWordLength("LettersGame"),
  timerConfig: { isTimed: true, seconds: getGamemodeDefaultTimerValue("LettersGame") },
};

export const defaultNumbersGameGamemodeSettings: NumbersGameConfigProps["gamemodeSettings"] = {
  hasScaryNumbers: false,
  scoringMethod: "standard",
  defaultNumOperands: 6,
  timerConfig: { isTimed: true, seconds: getGamemodeDefaultTimerValue("NumbersGame") },
};

export const defaultArithmeticRevealGamemodeSettings: ArithmeticRevealProps["gamemodeSettings"] = {
  numCheckpoints: 1,
  numTiles: 5,
  numberSize: "medium",
  revealIntervalSeconds: 3,
  timerConfig: { isTimed: true, seconds: getGamemodeDefaultTimerValue("ArithmeticReveal") },
};

export const defaultArithmeticDragGamemodeSettings: {
  mode: arithmeticMode;
  settings: ArithmeticDragProps["gamemodeSettings"];
}[] = [
  {
    mode: "match",
    settings: {
      numTiles: 6,
      numGuesses: getGamemodeDefaultNumGuesses("ArithmeticDrag/Match"),
      numOperands: 2,
      numberSize: "medium",
      timerConfig: { isTimed: true, seconds: getGamemodeDefaultTimerValue("ArithmeticDrag/Match") },
    },
  },
  {
    mode: "order",
    settings: {
      numTiles: 6,
      numGuesses: getGamemodeDefaultNumGuesses("ArithmeticDrag/Order"),
      numOperands: 2,
      numberSize: "medium",
      timerConfig: { isTimed: true, seconds: getGamemodeDefaultTimerValue("ArithmeticDrag/Order") },
    },
  },
];

export const defaultOnlyConnectGamemodeSettings: OnlyConnectProps["gamemodeSettings"] = {
  numGroups: 4,
  groupSize: 4,
  numGuesses: getGamemodeDefaultNumGuesses("OnlyConnect"),
  timerConfig: { isTimed: false },
};

export const defaultSameLetterWordsGamemodeSettings: SameLetterWordsProps["gamemodeSettings"] = {
  wordLength: getGamemodeDefaultWordLength("SameLetters"),
  numMatchingWords: 4,
  numTotalWords: 16,
  numGuesses: getGamemodeDefaultNumGuesses("SameLetters"),
  timerConfig: { isTimed: false },
};

export const defaultNumberSetsGamemodeSettings: NumberSetsProps["gamemodeSettings"] = {
  difficulty: "easy",
  timerConfig: { isTimed: false },
};

export const defaultAlgebraGamemodeSettings: AlgebraProps["gamemodeSettings"] = {
  difficulty: "easy",
  timerConfig: { isTimed: false },
};

export const defaultWordCodesGamemodeSettings: { mode: wordCodesMode; settings: WordCodesProps["gamemodeSettings"] }[] =
  [
    {
      mode: "question",
      settings: {
        numDisplayWords: 4,
        numDisplayCodes: 3,
        numWordToCodeQuestions: 2,
        numCodeToWordQuestions: 1,
        codeLength: 4,
        numCodesToMatch: 4,
        numAdditionalLetters: 2,
        numGuesses: getGamemodeDefaultNumGuesses("WordCodes/Question"),
        timerConfig: { isTimed: false },
      },
    },
    {
      mode: "match",
      settings: {
        numCodesToMatch: 4,
        codeLength: 4,
        numAdditionalLetters: 2,
        numGuesses: getGamemodeDefaultNumGuesses("WordCodes/Match"),
        timerConfig: { isTimed: false },
      },
    },
  ];

export const defaultNumbleGamemodeSettings: NumbleConfigProps["gamemodeSettings"] = {
  numDice: 4,
  // The lowest value which can be the number shown on a dice
  diceMin: 1,
  diceMax: 6,
  gridShape: "hexagon" as numbleGridShape,
  gridSize: 100 as numbleGridSize,
  numTeams: 1,
  // When a number which can't be made with the dice numbers is picked, does the game end?
  isGameOverOnIncorrectPick: false,
  // How long to make a guess after the dice have been rolled?
  guessTimerConfig: { isTimed: false },
  // How long overall until the game ends?
  timerConfig: { isTimed: true, seconds: getGamemodeDefaultTimerValue("numble") },
};
