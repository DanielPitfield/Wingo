import { PagePath } from "./PageNames";
import { NumbleConfigProps, numbleGridShape, numbleGridSize } from "../Pages/NumbleConfig";
import { WingoConfigProps } from "../Pages/WingoConfig";
import { WingoInterlinkedProps } from "../Pages/WingoInterlinked";
import { LetterCategoriesConfigProps } from "../Pages/LetterCategoriesConfig";
import { LettersGameConfigProps } from "../Pages/LettersGameConfig";
import { NumbersGameConfigProps } from "../Pages/NumbersGameConfig";
import { ArithmeticRevealProps } from "../Pages/ArithmeticReveal";
import { ArithmeticDragProps } from "../Pages/ArithmeticDrag";
import { OnlyConnectProps } from "../Pages/OnlyConnect";
import { SameLetterWordsProps } from "../Pages/SameLetterWords";
import { NumberSetsProps } from "../Pages/NumberSets";
import { AlgebraProps } from "../Pages/Algebra";
import { WordCodesProps } from "../Pages/WordCodes";
import { MAX_TARGET_WORD_LENGTH, MIN_TARGET_WORD_LENGTH } from "./GamemodeSettingsInputLimits";
import { getGamemodeDefaultNumGuesses } from "../Helpers/getGamemodeDefaultNumGuesses";
import { getGamemodeDefaultTimerValue } from "../Helpers/getGamemodeDefaultTimerValue";
import { getGamemodeDefaultWordLength } from "../Helpers/getGamemodeDefaultWordLength";

export const difficultyOptions = ["novice", "easy", "medium", "hard", "expert"] as const;
export type Difficulty = typeof difficultyOptions[number];

export const DEFAULT_PUZZLE_REVEAL_SECONDS = 2;
export const DEFAULT_PUZZLE_LEAVE_NUM_BLANKS = 3;

export const DEFAULT_NUMBERS_GAME_NUM_ROWS = 5;

export const DEFAULT_NUMBLE_GUESS_TIMER_VALUE = 20;

export const DEFAULT_WINGO_INCREASING_MAX_NUM_LIVES = 5;

export const DEFAULT_FIT_RESTRICTION = 0;

export const commonWingoSettings = {
  // Use the defaults of the repeat mode and overwrite where needed
  wordLength: getGamemodeDefaultWordLength("/Wingo/Repeat"),
  startingNumGuesses: getGamemodeDefaultNumGuesses("/Wingo/Repeat"),

  enforceFullLengthGuesses: true,
  isFirstLetterProvided: false,
  isHintShown: false,

  puzzleRevealSeconds: DEFAULT_PUZZLE_REVEAL_SECONDS,
  puzzleLeaveNumBlanks: DEFAULT_PUZZLE_LEAVE_NUM_BLANKS,

  maxLivesConfig: { isLimited: true, maxLives: DEFAULT_WINGO_INCREASING_MAX_NUM_LIVES },

  wordLengthMaxLimit: MAX_TARGET_WORD_LENGTH,
  timerConfig: { isTimed: false as false },
};

export const defaultWingoGamemodeSettings: { page: PagePath; settings: WingoConfigProps["gamemodeSettings"] }[] = [
  {
    page: "/Wingo/Daily",
    settings: {
      ...commonWingoSettings,
      wordLength: getGamemodeDefaultWordLength("/Wingo/Daily"),
      startingNumGuesses: getGamemodeDefaultNumGuesses("/Wingo/Daily"),
    },
  },
  {
    page: "/Wingo/Repeat",
    settings: {
      ...commonWingoSettings,
      wordLength: getGamemodeDefaultWordLength("/Wingo/Repeat"),
      startingNumGuesses: getGamemodeDefaultNumGuesses("/Wingo/Repeat"),
    },
  },
  {
    page: "/Wingo/Category",
    settings: {
      ...commonWingoSettings,
      wordLength: getGamemodeDefaultWordLength("/Wingo/Category"),
      startingNumGuesses: getGamemodeDefaultNumGuesses("/Wingo/Category"),
      enforceFullLengthGuesses: false,
    },
  },
  {
    page: "/Wingo/Increasing",
    settings: {
      ...commonWingoSettings,
      wordLength: getGamemodeDefaultWordLength("/Wingo/Increasing"),
      startingNumGuesses: getGamemodeDefaultNumGuesses("/Wingo/Increasing"),
    },
  },
  {
    page: "/Wingo/Limitless",
    settings: {
      ...commonWingoSettings,
      wordLength: getGamemodeDefaultWordLength("/Wingo/Limitless"),
      startingNumGuesses: getGamemodeDefaultNumGuesses("/Wingo/Limitless"),
    },
  },
  {
    page: "/Wingo/Puzzle",
    settings: {
      ...commonWingoSettings,
      wordLength: getGamemodeDefaultWordLength("/Wingo/Puzzle"),
      startingNumGuesses: getGamemodeDefaultNumGuesses("/Wingo/Puzzle"),
      isHintShown: true,
    },
  },
  // The conundrum mode is actually a mode of WingoConfig
  {
    page: "/Conundrum",
    settings: {
      ...commonWingoSettings,
      wordLength: getGamemodeDefaultWordLength("/Conundrum"),
      startingNumGuesses: getGamemodeDefaultNumGuesses("/Conundrum"),
      timerConfig: { isTimed: true, seconds: getGamemodeDefaultTimerValue("/Wingo/Puzzle") },
    },
  },
];

export const defaultWingoInterlinkedGamemodeSettings: WingoInterlinkedProps["gamemodeSettings"] = {
  numWords: 2,
  minWordLength: getGamemodeDefaultWordLength("/Wingo/Interlinked"),
  maxWordLength: getGamemodeDefaultWordLength("/Wingo/Interlinked"),
  numWordGuesses: 0,
  numGridGuesses: getGamemodeDefaultNumGuesses("/Wingo/Interlinked"),
  isFirstLetterProvided: false,
  isHintShown: false,
  timerConfig: { isTimed: false },
  fitRestrictionConfig: { isRestricted: false },
};

export const defaultWingoCrosswordGamemodeSettings: WingoInterlinkedProps["gamemodeSettings"] = {
  numWords: 6,
  minWordLength: MIN_TARGET_WORD_LENGTH,
  maxWordLength: MAX_TARGET_WORD_LENGTH,
  numWordGuesses: 10,
  numGridGuesses: 2,
  isFirstLetterProvided: false,
  isHintShown: true,
  timerConfig: { isTimed: false },
  fitRestrictionConfig: { isRestricted: false },
};

export const defaultWingoCrosswordFitGamemodeSettings: WingoInterlinkedProps["gamemodeSettings"] = {
  numWords: 6,
  minWordLength: getGamemodeDefaultWordLength("/Wingo/Crossword/Fit"),
  maxWordLength: getGamemodeDefaultWordLength("/Wingo/Crossword/Fit"),
  numWordGuesses: 0,
  numGridGuesses: 1,
  isFirstLetterProvided: false,
  isHintShown: true,
  timerConfig: { isTimed: false },
  fitRestrictionConfig: { isRestricted: false },
};

export const defaultDailyCrosswordGamemodeSettings: WingoInterlinkedProps["gamemodeSettings"] = {
  numWords: 6,
  minWordLength: MIN_TARGET_WORD_LENGTH,
  maxWordLength: MAX_TARGET_WORD_LENGTH,
  numWordGuesses: 10,
  numGridGuesses: 2,
  isFirstLetterProvided: false,
  isHintShown: true,
  timerConfig: { isTimed: false },
  fitRestrictionConfig: { isRestricted: false },
};

export const defaultWeeklyCrosswordGamemodeSettings: WingoInterlinkedProps["gamemodeSettings"] = {
  numWords: 10,
  minWordLength: MIN_TARGET_WORD_LENGTH,
  maxWordLength: MAX_TARGET_WORD_LENGTH,
  numWordGuesses: 20,
  numGridGuesses: 4,
  isFirstLetterProvided: false,
  isHintShown: true,
  timerConfig: { isTimed: false },
  fitRestrictionConfig: { isRestricted: false },
};

export const defaultLetterCategoriesGamemodeSettings: LetterCategoriesConfigProps["gamemodeSettings"] = {
  numCategories: 5,
  timerConfig: { isTimed: false },
};

export const defaultLettersGameGamemodeSettings: LettersGameConfigProps["gamemodeSettings"] = {
  numLetters: getGamemodeDefaultWordLength("/LettersGame"),
  timerConfig: { isTimed: true, seconds: getGamemodeDefaultTimerValue("/LettersGame") },
};

export const defaultNumbersGameGamemodeSettings: NumbersGameConfigProps["gamemodeSettings"] = {
  hasScaryNumbers: false,
  scoringMethod: "standard",
  numOperands: 6,
  timerConfig: { isTimed: true, seconds: getGamemodeDefaultTimerValue("/NumbersGame") },
};

export const defaultArithmeticRevealGamemodeSettings: ArithmeticRevealProps["gamemodeSettings"] = {
  numCheckpoints: 1,
  numTiles: 5,
  numberSize: "medium",
  revealIntervalSeconds: 3,
  timerConfig: { isTimed: true, seconds: getGamemodeDefaultTimerValue("/ArithmeticReveal") },
};

export const defaultArithmeticDragOrderGamemodeSettings: ArithmeticDragProps["gamemodeSettings"] = {
  numTiles: 6,
  startingNumGuesses: getGamemodeDefaultNumGuesses("/ArithmeticDrag/Order"),
  numOperands: 2,
  numberSize: "medium",
  timerConfig: { isTimed: true, seconds: getGamemodeDefaultTimerValue("/ArithmeticDrag/Order") },
};

export const defaultArithmeticDragMatchGamemodeSettings: ArithmeticDragProps["gamemodeSettings"] = {
  numTiles: 6,
  startingNumGuesses: getGamemodeDefaultNumGuesses("/ArithmeticDrag/Match"),
  numOperands: 2,
  numberSize: "medium",
  timerConfig: { isTimed: true, seconds: getGamemodeDefaultTimerValue("/ArithmeticDrag/Match") },
};

export const defaultOnlyConnectGamemodeSettings: OnlyConnectProps["gamemodeSettings"] = {
  numGroups: 4,
  groupSize: 4,
  startingNumGuesses: getGamemodeDefaultNumGuesses("/OnlyConnect"),
  timerConfig: { isTimed: false },
};

export const defaultSameLetterWordsGamemodeSettings: SameLetterWordsProps["gamemodeSettings"] = {
  wordLength: getGamemodeDefaultWordLength("/SameLetters"),
  numMatchingWords: 4,
  numTotalWords: 16,
  startingNumGuesses: getGamemodeDefaultNumGuesses("/SameLetters"),
  timerConfig: { isTimed: false },
};

export const defaultNumberSetsGamemodeSettings: NumberSetsProps["gamemodeSettings"] = {
  numSets: 3,
  difficulty: "easy",
  timerConfig: { isTimed: false },
};

export const defaultAlgebraGamemodeSettings: AlgebraProps["gamemodeSettings"] = {
  numTemplates: 1,
  difficulty: "easy",
  timerConfig: { isTimed: false },
};

export const defaultWordCodesQuestionGamemodeSettings: WordCodesProps["gamemodeSettings"] = {
  numDisplayWords: 4,
  numDisplayCodes: 3,
  numWordToCodeQuestions: 2,
  numCodeToWordQuestions: 1,
  codeLength: 4,
  numCodesToMatch: 4,
  numAdditionalLetters: 2,
  startingNumGuesses: getGamemodeDefaultNumGuesses("/WordCodes/Question"),
  timerConfig: { isTimed: false },
};

export const defaultWordCodesMatchGamemodeSettings: WordCodesProps["gamemodeSettings"] = {
  numDisplayWords: 4,
  numDisplayCodes: 3,
  numWordToCodeQuestions: 2,
  numCodeToWordQuestions: 1,
  codeLength: 4,
  numCodesToMatch: 4,
  numAdditionalLetters: 2,
  startingNumGuesses: getGamemodeDefaultNumGuesses("/WordCodes/Match"),
  timerConfig: { isTimed: false },
};

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
  timerConfig: { isTimed: true, seconds: getGamemodeDefaultTimerValue("/Numble") },
};

export const defaultWingoGameshowRoundOrder = {
  firstRoundConfig: { numWingos: 4, numPuzzles: 1 },
  secondRoundConfig: { numWingos: 3, numPuzzles: 1 },
  thirdRoundConfig: { numFourLengthWingos: 2, numPuzzles: 1, numFiveLengthWingos: 2, numberPuzzles: 1 },
  hasFinalRound: true,
};

// TODO: Default gamemode settings (remaining unimplemented modes)
/*
  "PuzzleSequence"
  "LettersNumbersGameshow"
*/
