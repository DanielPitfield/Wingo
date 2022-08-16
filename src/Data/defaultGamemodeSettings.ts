import { PageName } from "../PageNames";
import { NumbleConfigProps, numbleGridShape, numbleGridSize } from "../Pages/NumbleConfig";
import { words_ten_guessable, words_ten_targets } from "./WordArrays/Lengths/Words10";
import { words_eleven_guessable, words_eleven_targets } from "./WordArrays/Lengths/Words11";
import { words_three_guessable, words_three_targets } from "./WordArrays/Lengths/Words3";
import { words_four_guessable, words_four_targets } from "./WordArrays/Lengths/Words4";
import { words_five_guessable, words_five_targets } from "./WordArrays/Lengths/Words5";
import { words_six_guessable, words_six_targets } from "./WordArrays/Lengths/Words6";
import { words_seven_guessable, words_seven_targets } from "./WordArrays/Lengths/Words7";
import { words_eight_guessable, words_eight_targets } from "./WordArrays/Lengths/Words8";
import { words_nine_guessable, words_nine_targets } from "./WordArrays/Lengths/Words9";
import { words_dogs } from "./WordArrays/Categories/Dogs";
import { words_countries } from "./WordArrays/Categories/Countries";
import { words_chemical_elements } from "./WordArrays/Categories/ChemicalElements";
import { words_colours } from "./WordArrays/Categories/Colours";
import { words_fruits } from "./WordArrays/Categories/Fruits";
import { words_sports } from "./WordArrays/Categories/Sports";
import { words_vegetables } from "./WordArrays/Categories/Vegetables";
import { words_pizza_toppings } from "./WordArrays/Categories/PizzaToppings";
import { words_capital_cities } from "./WordArrays/Categories/CapitalCities";
import { words_animals } from "./WordArrays/Categories/Animals";
import { words_herbs_and_spices } from "./WordArrays/Categories/HerbsAndSpices";
import { words_meats_and_fish } from "./WordArrays/Categories/MeatsAndFish";
import { words_gemstones } from "./WordArrays/Categories/Gemstones";
import { WingoConfigProps } from "../Pages/WingoConfig";
import { WingoInterlinkedProps } from "../Pages/WingoInterlinked";
import { words_puzzles } from "./WordArrays/WordsPuzzles";
import { LetterCategoriesConfigProps } from "../Pages/LetterCategoriesConfig";
import { LettersGameConfigProps } from "../Pages/LettersGameConfig";
import { NumbersGameConfigProps } from "../Pages/NumbersGameConfig";
import { ArithmeticRevealProps } from "../Pages/ArithmeticReveal";
import { ArithmeticDragProps, arithmeticMode } from "../Pages/ArithmeticDrag";
import { GroupWallProps } from "../Pages/OnlyConnect";
import { SameLetterWordsProps } from "../Pages/SameLetterWords";
import { NumberSetsProps } from "../Pages/NumberSets";
import { AlgebraProps } from "../Pages/Algebra";
import { wordCodesMode, WordCodesProps } from "../Pages/WordCodes";

// --- Default values/variables --- //
export const wordLengthMappingsTargets = [
  { value: 3, array: words_three_targets },
  { value: 4, array: words_four_targets },
  { value: 5, array: words_five_targets },
  { value: 6, array: words_six_targets },
  { value: 7, array: words_seven_targets },
  { value: 8, array: words_eight_targets },
  { value: 9, array: words_nine_targets },
  { value: 10, array: words_ten_targets },
  { value: 11, array: words_eleven_targets },
];

export const wordLengthMappingsGuessable = [
  { value: 3, array: words_three_guessable },
  { value: 4, array: words_four_guessable },
  { value: 5, array: words_five_guessable },
  { value: 6, array: words_six_guessable },
  { value: 7, array: words_seven_guessable },
  { value: 8, array: words_eight_guessable },
  { value: 9, array: words_nine_guessable },
  { value: 10, array: words_ten_guessable },
  { value: 11, array: words_eleven_guessable },
];

export const categoryMappings = [
  { name: "Animals", array: words_animals },
  { name: "Capital Cities", array: words_capital_cities },
  { name: "Chemical Elements", array: words_chemical_elements },
  { name: "Colours", array: words_colours },
  { name: "Countries", array: words_countries },
  { name: "Dog Breeds", array: words_dogs },
  { name: "Fruits", array: words_fruits },
  { name: "Gemstones", array: words_gemstones },
  { name: "Herbs and Spices", array: words_herbs_and_spices },
  { name: "Meats and Fish", array: words_meats_and_fish },
  { name: "Pizza Toppings", array: words_pizza_toppings },
  // TODO: Should puzzles be here? The puzzles are mostly unrelated to each other and aren't really a category
  { name: "Puzzles", array: words_puzzles },
  { name: "Sports", array: words_sports },
  { name: "Vegetables", array: words_vegetables },
];

// The wordLengths of target word arrays that have at least one word
const targetWordLengths = wordLengthMappingsTargets
  .filter((mapping) => mapping.array.length > 0)
  .map((mapping) => mapping.value);

// WordLength values (for different modes)
export const MIN_TARGET_WORD_LENGTH = Math.min(...targetWordLengths);
export const MAX_TARGET_WORD_LENGTH = Math.max(...targetWordLengths);
export const DEFAULT_WORD_LENGTH = 5;

// TODO: Better readability for this to be an array of objects {mode: PageName, wordLength: number}[]
export const DEFAULT_WORD_LENGTH_INCREASING = 4;
export const DEFAULT_WORD_LENGTH_CONUNDRUM = 9;
export const DEFAULT_WORD_LENGTH_PUZZLE = 10;

// numGuesses values (for different modes)
export const DEFAULT_NUM_GUESSES = 6;
export const DEFAULT_NUM_GUESSES_PUZZLE = 1;
export const DEFAULT_NUM_GUESSES_NUMBERS_GAME = 5;

export const DEFAULT_PUZZLE_REVEAL_MS = 2000;
export const DEFAULT_PUZZLE_LEAVE_NUM_BLANKS = 3;

// The number of categories with at least one word
export const MAX_NUM_CATEGORIES = categoryMappings.filter((mapping) => mapping.array.length > 0).length;

// --- Default Gamemode settings --- //
export const defaultWingoGamemodeSettings: { page: PageName; settings: WingoConfigProps["gamemodeSettings"] }[] = [
  {
    page: "wingo/daily",
    settings: {
      wordLength: DEFAULT_WORD_LENGTH,
      isFirstLetterProvided: false,
      isHintShown: false,
      timerConfig: { isTimed: false },
    },
  },
  {
    page: "wingo/repeat",
    settings: {
      wordLength: DEFAULT_WORD_LENGTH,
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
      puzzleRevealMs: DEFAULT_PUZZLE_REVEAL_MS,
      puzzleLeaveNumBlanks: DEFAULT_PUZZLE_LEAVE_NUM_BLANKS,
      wordLength: DEFAULT_WORD_LENGTH_PUZZLE,
    },
  },
  // The conundrum mode is actually a mode of WingoConfig
  {
    page: "Conundrum",
    settings: {
      timerConfig: { isTimed: true, seconds: 30 },
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
    },
  },
  {
    page: "wingo/interlinked",
    settings: {
      numWords: 2,
      minWordLength: DEFAULT_WORD_LENGTH,
      maxWordLength: DEFAULT_WORD_LENGTH,
      numWordGuesses: 0,
      numGridGuesses: DEFAULT_NUM_GUESSES,
      isFirstLetterProvided: false,
      isHintShown: false,
      timerConfig: { isTimed: false },
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
    },
  },
  {
    page: "wingo/crossword/fit",
    settings: {
      numWords: 6,
      minWordLength: DEFAULT_WORD_LENGTH,
      maxWordLength: DEFAULT_WORD_LENGTH,
      numWordGuesses: 0,
      numGridGuesses: 1,
      isFirstLetterProvided: false,
      isHintShown: true,
      timerConfig: { isTimed: false },
    },
  },
];

export const defaultLetterCategoriesGamemodeSettings: LetterCategoriesConfigProps["gamemodeSettings"] = {
  defaultNumCategories: 5,
  timerConfig: { isTimed: false },
};

export const defaultLettersGameGamemodeSettings: LettersGameConfigProps["gamemodeSettings"] = {
  defaultNumLetters: 9,
  timerConfig: { isTimed: true, seconds: 30 },
};

export const defaultNumbersGameGamemodeSettings: NumbersGameConfigProps["gamemodeSettings"] = {
  hasScaryNumbers: false,
  scoringMethod: "standard",
  defaultNumOperands: 6,
  timerConfig: { isTimed: true, seconds: 30 },
};

export const defaultArithmeticRevealGamemodeSettings: ArithmeticRevealProps["gamemodeSettings"] = {
  numCheckpoints: 1,
  numTiles: 5,
  numberSize: "medium",
  revealIntervalSeconds: 3,
  timerConfig: { isTimed: true, seconds: 10 },
};

export const defaultArithmeticDragGamemodeSettings: {
  mode: arithmeticMode;
  settings: ArithmeticDragProps["gamemodeSettings"];
}[] = [
  {
    mode: "match",
    settings: {
      numTiles: 6,
      numGuesses: 3,
      numOperands: 2,
      numberSize: "medium",
      timerConfig: { isTimed: true, seconds: 100 },
    },
  },
  {
    mode: "order",
    settings: {
      numTiles: 6,
      numGuesses: 3,
      numOperands: 2,
      numberSize: "medium",
      timerConfig: { isTimed: true, seconds: 100 },
    },
  },
];

export const defaultGroupWallGamemodeSettings: GroupWallProps["gamemodeSettings"] = {
  numGroups: 4,
  groupSize: 4,
  numGuesses: 3,
  timerConfig: { isTimed: false },
};

export const defaultSameLetterWordsGamemodeSettings: SameLetterWordsProps["gamemodeSettings"] = {
  wordLength: DEFAULT_WORD_LENGTH,
  numMatchingWords: 4,
  numTotalWords: 16,
  numGuesses: 20,
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
        numAdditionalLetters: 2,
        numGuesses: 3,
        timerConfig: { isTimed: false },
      },
    },
    {
      mode: "match",
      settings: {
        numCodesToMatch: 4,
        codeLength: 4,
        numAdditionalLetters: 2,
        numGuesses: 3,
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
  timerConfig: { isTimed: true, seconds: 600 },
};
