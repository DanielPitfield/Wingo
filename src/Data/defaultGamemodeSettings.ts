import { PageName } from "../Data/PageNames";
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
import { getGamemodeDefaultWordLength } from "./DefaultWordLengths";
import { getGamemodeDefaultNumGuesses } from "./DefaultNumGuesses";
import { getGamemodeDefaultTimerValue } from "./DefaultTimerValues";

export const difficultyOptions = ["novice", "easy", "medium", "hard", "expert"] as const;
export type Difficulty = typeof difficultyOptions[number];

export const DEFAULT_PUZZLE_REVEAL_MS = 2000;
export const DEFAULT_PUZZLE_LEAVE_NUM_BLANKS = 3;

export const DEFAULT_NUMBERS_GAME_NUM_ROWS = 5;

export const DEFAULT_NUMBLE_GUESS_TIMER_VALUE = 20;

export const DEFAULT_WINGO_INCREASING_MAX_NUM_LIVES = 5;

export const DEFAULT_FIT_RESTRICTION = 0;

const commonWingoSettings = {
  isFirstLetterProvided: false,
  isHintShown: false,
  puzzleRevealMs: DEFAULT_PUZZLE_REVEAL_MS,
  puzzleLeaveNumBlanks: DEFAULT_PUZZLE_LEAVE_NUM_BLANKS,
  maxLivesConfig: { isLimited: true, maxLives: DEFAULT_WINGO_INCREASING_MAX_NUM_LIVES },
  wordLengthMaxLimit: MAX_TARGET_WORD_LENGTH,
  timerConfig: { isTimed: false as false },
};

export const fallbackWingoSettings = {
  wordLength: 5,
  ...commonWingoSettings,
};

export const defaultWingoGamemodeSettings: { page: PageName; settings: WingoConfigProps["gamemodeSettings"] }[] = [
  {
    page: "wingo/daily",
    settings: { ...commonWingoSettings, wordLength: getGamemodeDefaultWordLength("wingo/daily") },
  },
  {
    page: "wingo/repeat",
    settings: { ...commonWingoSettings, wordLength: getGamemodeDefaultWordLength("wingo/repeat") },
  },
  {
    page: "wingo/category",
    settings: { ...commonWingoSettings, wordLength: getGamemodeDefaultWordLength("wingo/category") },
  },
  {
    page: "wingo/increasing",
    settings: { ...commonWingoSettings, wordLength: getGamemodeDefaultWordLength("wingo/increasing") },
  },
  {
    page: "wingo/limitless",
    settings: { ...commonWingoSettings, wordLength: getGamemodeDefaultWordLength("wingo/limitless") },
  },
  {
    page: "wingo/puzzle",
    settings: {
      ...commonWingoSettings,
      wordLength: getGamemodeDefaultWordLength("wingo/puzzle"),

      isHintShown: true,
    },
  },
  // The conundrum mode is actually a mode of WingoConfig
  {
    page: "Conundrum",
    settings: {
      ...commonWingoSettings,
      wordLength: getGamemodeDefaultWordLength("Conundrum"),
      timerConfig: { isTimed: true, seconds: getGamemodeDefaultTimerValue("wingo/puzzle") },
    },
  },
];

export const defaultWingoInterlinkedGamemodeSettings: WingoInterlinkedProps["gamemodeSettings"] = {
  numWords: 2,
  minWordLength: getGamemodeDefaultWordLength("wingo/interlinked"),
  maxWordLength: getGamemodeDefaultWordLength("wingo/interlinked"),
  numWordGuesses: 0,
  numGridGuesses: getGamemodeDefaultNumGuesses("wingo/interlinked"),
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
  minWordLength: getGamemodeDefaultWordLength("wingo/crossword/fit"),
  maxWordLength: getGamemodeDefaultWordLength("wingo/crossword/fit"),
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
  numLetters: getGamemodeDefaultWordLength("LettersGame"),
  timerConfig: { isTimed: true, seconds: getGamemodeDefaultTimerValue("LettersGame") },
};

export const defaultNumbersGameGamemodeSettings: NumbersGameConfigProps["gamemodeSettings"] = {
  hasScaryNumbers: false,
  scoringMethod: "standard",
  numOperands: 6,
  timerConfig: { isTimed: true, seconds: getGamemodeDefaultTimerValue("NumbersGame") },
};

export const defaultArithmeticRevealGamemodeSettings: ArithmeticRevealProps["gamemodeSettings"] = {
  numCheckpoints: 1,
  numTiles: 5,
  numberSize: "medium",
  revealIntervalSeconds: 3,
  timerConfig: { isTimed: true, seconds: getGamemodeDefaultTimerValue("ArithmeticReveal") },
};

export const defaultArithmeticDragOrderGamemodeSettings: ArithmeticDragProps["gamemodeSettings"] = {
  numTiles: 6,
  numGuesses: getGamemodeDefaultNumGuesses("ArithmeticDrag/Order"),
  numOperands: 2,
  numberSize: "medium",
  timerConfig: { isTimed: true, seconds: getGamemodeDefaultTimerValue("ArithmeticDrag/Order") },
};

export const defaultArithmeticDragMatchGamemodeSettings: ArithmeticDragProps["gamemodeSettings"] = {
  numTiles: 6,
  numGuesses: getGamemodeDefaultNumGuesses("ArithmeticDrag/Match"),
  numOperands: 2,
  numberSize: "medium",
  timerConfig: { isTimed: true, seconds: getGamemodeDefaultTimerValue("ArithmeticDrag/Match") },
};

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
  numGuesses: getGamemodeDefaultNumGuesses("WordCodes/Question"),
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
  numGuesses: getGamemodeDefaultNumGuesses("WordCodes/Match"),
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
  timerConfig: { isTimed: true, seconds: getGamemodeDefaultTimerValue("Numble") },
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
