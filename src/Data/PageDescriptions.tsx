import { PageName } from "./PageNames";
import { gameshowType } from "../Pages/CustomGameshow";

export const GamemodeCategories = [
  "Daily / Weekly",
  "Wingo",
  "Letters",
  "Numbers",
  "Puzzle",
  "Gameshow Presets",
  null,
] as const;

export type GamemodeCategory = typeof GamemodeCategories[number];

export type pageDescription = {
  page: PageName;
  title: string;
  shortTitle?: string;
  // What category best describes this gamemode (the tile to select the gamemode will be under a title with this name)?
  categoryType: GamemodeCategory;
  // Is the gamemode shown on the gamemode selection screen (is it available to play/enabled?)
  isDisplayed: boolean;
  // Can the gamemode be selected during a random session?
  isRandomlyPlayable: boolean;

  /* TODO: Remove gameshowType?
  This is only used to determine which gamemodes appear when you use the filter within the Custom Gameshow configuration
  But pretty sure it's not needed as Custom preset should allow any gamemode?
  */
  gameshowType?: gameshowType;
  description?: string;
  helpInfo?: JSX.Element;
};

/* TODO: Gamemode display order
Is there some way of specifying which order the tiles which are derived from these pageDescriptions appear?
Other than ensuring they are in the correct order here (within pageDescriptions)
*/

export const pageDescriptions: pageDescription[] = [
  { page: "splash-screen", title: "Wingo", categoryType: null, isDisplayed: false, isRandomlyPlayable: false },
  { page: "TitlePage", title: "Home", categoryType: null, isDisplayed: false, isRandomlyPlayable: false },
  //{ page: "home", title: "", isDisplayed: false, isRandomlyPlayable: false },
  {
    page: "wingo/daily",
    title: "Daily Wingo",
    shortTitle: "Daily",
    categoryType: "Daily / Weekly",
    isDisplayed: true,
    isRandomlyPlayable: false,
    description: "Guess today's word",
    helpInfo: (
      <>
        <p>Only one attempt (a set of up to 6 guesses) allowed</p>
        <p>The target word changes every day (the timer shows when a new word is available)</p>
        <p>Your attempt will be saved and can be viewed at any time</p>
      </>
    ),
  },
  {
    page: "wingo/crossword/daily",
    title: "Wingo Crossword (Daily)",
    shortTitle: "Daily Crossword",
    categoryType: "Daily / Weekly",
    isDisplayed: true,
    isRandomlyPlayable: false,
    description: "Guess a crossword for today",
    helpInfo: (
      <>
        <p>Complete a crossword specifically for today only!</p>
        <p>Guess the many target words, using the shared letters as hints</p>
        <p>Click on the word to highlight it, and make a guess</p>
        <p>Click 'Check Current Word' once you have guessed one word to see which letters are correct</p>
        <p>Click 'Check Crossword' once you have guessed all words to see if your guesses are correct</p>
        <p>Do all this without running out of guesses!</p>
      </>
    ),
  },
  {
    page: "wingo/crossword/weekly",
    title: "Wingo Crossword (Weekly)",
    shortTitle: "Weekly Crossword",
    categoryType: "Daily / Weekly",
    isDisplayed: true,
    isRandomlyPlayable: false,
    description: "Guess a crossword for this week",
    helpInfo: (
      <>
        <p>Complete a crossword specifically for this week</p>
        <p>Guess the many target words, using the shared letters as hints</p>
        <p>Click on the word to highlight it, and make a guess</p>
        <p>Click 'Check Current Word' once you have guessed one word to see which letters are correct</p>
        <p>Click 'Check Crossword' once you have guessed all words to see if your guesses are correct</p>
        <p>Do all this without running out of guesses!</p>
      </>
    ),
  },
  {
    page: "wingo/repeat",
    title: "Standard/Normal Wingo",
    shortTitle: "Standard",
    categoryType: "Wingo",
    isDisplayed: true,
    isRandomlyPlayable: true,
    gameshowType: "Wingo",
    description: "Guess a word",
    helpInfo: (
      <>
        <p>Press the 'Restart' button after an attempt for a new target word</p>
      </>
    ),
  },
  {
    page: "wingo/puzzle",
    title: "Wingo Puzzle",
    shortTitle: "Puzzle",
    categoryType: "Wingo",
    isDisplayed: true,
    isRandomlyPlayable: true,
    gameshowType: "Wingo",
    description: "Use a cryptic clue to guess the word as fast as possible!",
    helpInfo: (
      <>
        <p>Guess the target word from the hint provided</p>
        <p>A random letter of the target word will become revealed every few seconds</p>
        <p>Press 'Enter' once you know the answer and make your guess (this will stop the letters revealing!)</p>
      </>
    ),
  },
  {
    page: "wingo/increasing",
    title: "Wingo Increasing Length",
    shortTitle: "Increasing",
    categoryType: "Wingo",
    isDisplayed: true,
    isRandomlyPlayable: true,
    gameshowType: "Wingo",
    description: "Increase the word length to guess with every correct answer",
    helpInfo: (
      <>
        <p>The target word will increase in length (one letter longer) after each successful guess</p>
      </>
    ),
  },
  {
    page: "wingo/limitless",
    title: "Wingo Limitless/Survival",
    shortTitle: "Limitless",
    categoryType: "Wingo",
    isDisplayed: true,
    isRandomlyPlayable: true,
    gameshowType: "Wingo",
    description: "Gain lives with correct, early answers; how long can you survive?",
    helpInfo: (
      <>
        <p>Gain extra guesses (up to a maximum of 5) by guessing a word with guesses to spare</p>
        <p>A guess will be lost each time the target word is not guessed</p>
        <p>The target word will increase in length (one letter longer) after each successful guess</p>
      </>
    ),
  },
  {
    page: "wingo/category",
    title: "Wingo Categories",
    shortTitle: "Categories",
    categoryType: "Wingo",
    isDisplayed: true,
    isRandomlyPlayable: true,
    gameshowType: "Wingo",
    description: "Guess a word related to a category",
    helpInfo: (
      <>
        <p>The target word is a word from the currently selected category</p>
        <p>
          The guesses you make must also be words from this category (but they do not have to be the length of the
          target word)
        </p>
        <p>The category can be changed from the dropdown list (this will delete any guesses made)</p>
      </>
    ),
  },
  {
    page: "wingo/interlinked",
    title: "Wingo Interlinked",
    shortTitle: "Interlinked",
    categoryType: "Wingo",
    isDisplayed: true,
    isRandomlyPlayable: true,
    gameshowType: "Wingo",
    description: "Guess two words interlinked by a shared letter",
    helpInfo: (
      <>
        <p>Guess the two target words, using the shared letter as a hint</p>
        <p>Click on the word to highlight it, and make a guess</p>
        <p>Click 'Check Crossword' once you have guessed both words to see if your guesses are correct</p>
        <p>Do all this without running out of guesses!</p>
      </>
    ),
  },
  {
    page: "wingo/crossword",
    title: "Wingo Crossword",
    shortTitle: "Crossword",
    categoryType: "Wingo",
    isDisplayed: true,
    isRandomlyPlayable: true,
    gameshowType: "Wingo",
    description: "Guess a crossword of words",
    helpInfo: (
      <>
        <p>Guess the many target words, using the shared letters as hints</p>
        <p>Click on the word to highlight it, and make a guess</p>
        <p>Click 'Check Current Word' once you have guessed one word to see which letters are correct</p>
        <p>Click 'Check Crossword' once you have guessed all words to see if your guesses are correct</p>
        <p>Do all this without running out of guesses!</p>
      </>
    ),
  },
  {
    page: "OnlyConnect",
    title: "Only Connect",
    shortTitle: "Only Connect",
    categoryType: "Letters",
    isDisplayed: true,
    isRandomlyPlayable: true,
    description: "Find groups of words from a scrambled word grid",
  },
  {
    page: "LettersGame",
    title: "Letters Game",
    shortTitle: "Letters Game",
    categoryType: "Letters",
    isDisplayed: true,
    isRandomlyPlayable: true,
    gameshowType: "LettersNumbers",
    description: "Find the highest scoring word from the list of random letters",
    helpInfo: (
      // https://en.wikipedia.org/wiki/Countdown_(game_show)#Letters_round
      <>
        <p>Add letters to the selection row using the 'Vowel' or Consonant' buttons</p>
        <p>The 'Quick Pick' will randomly complete the letter selection for you</p>
        <p>Enter the longest word which can be made with the letters</p>
        <p>No letter may be used more often than it appears in the selection</p>
        <p>
          If an entered word is valid, it will be briefly highlighted in green, but if invalid, will be highlighted in
          red
        </p>
        <p>The longest word entered will be automically chosen when the timer runs out</p>
      </>
    ),
  },
  {
    page: "Conundrum",
    title: "Conundrum",
    shortTitle: "Conundrum",
    categoryType: "Letters",
    isDisplayed: true,
    isRandomlyPlayable: true,
    gameshowType: "LettersNumbers",
    description: "Find a single word which uses all the letters",
    helpInfo: (
      // https://en.wikipedia.org/wiki/Countdown_(game_show)#Conundrum
      <>
        <p>Enter a single word which uses all the letters</p>
        <p>Only one guess is allowed</p>
      </>
    ),
  },
  {
    page: "LettersCategories",
    title: "Letters Categories",
    shortTitle: "Categories (5)",
    categoryType: "Letters",
    isDisplayed: true,
    isRandomlyPlayable: true,
    description: "Guess the word for each category",
    helpInfo: (
      <>
        <p>Select a category</p>
        <p>Guess the word from the hint for the category within the number of guesses</p>
        <p>Press the 'Restart' button after an attempt or change the Category for a new target word</p>
      </>
    ),
  },
  {
    page: "SameLetters",
    title: "Same Letter Words",
    shortTitle: "Same Letter Words",
    categoryType: "Letters",
    isDisplayed: true,
    isRandomlyPlayable: true,
    description: "Find the words which are made from the same letters",
  },
  {
    page: "WordCodes/Question",
    title: "Word Codes",
    shortTitle: "Word Codes",
    categoryType: "Letters",
    isDisplayed: true,
    isRandomlyPlayable: true,
    description: "Decipher codes to find words (and vice versa)",
  },
  {
    page: "WordCodes/Match",
    title: "Word Codes (Match)",
    shortTitle: "Word Codes (Match)",
    categoryType: "Letters",
    isDisplayed: true,
    isRandomlyPlayable: true,
    description: "Match the words to their codes",
  },
  {
    page: "wingo/crossword/fit",
    title: "Wingo Crossword Fit",
    shortTitle: "Crossword Fit",
    categoryType: "Letters",
    isDisplayed: true,
    isRandomlyPlayable: true,
    gameshowType: "Wingo",
    description: "Fill the crossword with the provided words",
    helpInfo: (
      <>
        <p>Fill each word with one of the provided words, using the revealed letters as hints</p>
        <p>Click on the word to highlight it, and make a guess</p>
        <p>Click 'Check Crossword' once you have guessed all words to see if your guesses are correct</p>
        <p>Do all this without running out of guesses!</p>
      </>
    ),
  },
  {
    page: "ArithmeticReveal",
    title: "Quick Maths",
    shortTitle: "Quick Maths",
    categoryType: "Numbers",
    isDisplayed: true,
    isRandomlyPlayable: true,
    description: "Test your arithmetic with quickfire calculations",
  },
  {
    page: "Numble",
    title: "Numble",
    shortTitle: "Numble",
    categoryType: "Numbers",
    isDisplayed: true,
    isRandomlyPlayable: true,
    description: "Find the highest scoring number from a list of random numbers",
  },
  {
    page: "NumbersGame",
    title: "Numbers Game",
    shortTitle: "Numbers Game",
    categoryType: "Numbers",
    isDisplayed: true,
    isRandomlyPlayable: true,
    gameshowType: "LettersNumbers",
    description: "Get the target number using a list of random numbers",
    helpInfo: (
      // https://en.wikipedia.org/wiki/Countdown_(game_show)#Numbers_round
      <>
        <p>Add numbers to the selection row using the 'Small' or Big' buttons</p>
        <p>The 'Quick Pick' will randomly complete the number selection for you</p>
        <p>
          Work out a sequence of calculations with the numbers where the final result is as close to the target number
          as possible
        </p>
        <p>No number may be used more often than it appears in the selection</p>
        <p>Not all of the numbers in the selection need to be used </p>

        <p>Only the four basic operations of addition, subtraction, multiplication and division may be used</p>
        <p>Division can only be performed if the result has no remainder and fractions are not allowed</p>
        <p>Only positive integers may be obtained as a result at any stage of the calculation</p>
        <p>The 'Best Guess' button will end the game and take the closest answer so far</p>
      </>
    ),
  },

  {
    page: "ArithmeticDrag/Order",
    title: "Arithmetic (Order)",
    shortTitle: "Arithmetic (Order)",
    categoryType: "Numbers",
    isDisplayed: true,
    isRandomlyPlayable: true,
    description: "Put the arithmetic expressions in order from smallest to largest",
  },
  {
    page: "ArithmeticDrag/Match",
    title: "Arithmetic (Match)",
    shortTitle: "Arithmetic (Match)",
    categoryType: "Numbers",
    isDisplayed: true,
    isRandomlyPlayable: true,
    description: "Match the arithmetic expressions with the results they evaluate to",
  },
  {
    page: "NumberSets",
    title: "Number Sets",
    shortTitle: "Number Sets",
    categoryType: "Numbers",
    isDisplayed: true,
    isRandomlyPlayable: true,
    description: "Find the answer to a unique number set",
  },
  {
    page: "Algebra",
    title: "Algebra",
    shortTitle: "Algebra",
    categoryType: "Numbers",
    isDisplayed: true,
    isRandomlyPlayable: true,
    description: "Find the answer to a unique number set",
  },
  {
    page: "PuzzleSequence",
    title: "Sequence Puzzle",
    shortTitle: "Sequence",
    categoryType: "Puzzle",
    isDisplayed: true,
    isRandomlyPlayable: true,
    description: "Find what comes next in the sequence",
  },
  {
    page: "Wingo/Gameshow",
    title: "Wingo Gameshow",
    shortTitle: "Wingo Gameshow",
    categoryType: "Gameshow Presets",
    isDisplayed: true,
    isRandomlyPlayable: false,
  },
  {
    page: "LettersNumbersGameshow",
    title: "Letters Numbers Gameshow",
    shortTitle: "Letters Numbers Gameshow",
    categoryType: "Gameshow Presets",
    isDisplayed: true,
    isRandomlyPlayable: false,
  },
  {
    page: "Custom/Gameshow",
    title: "Custom Gameshow",
    shortTitle: "Custom Gameshow",
    categoryType: "Gameshow Presets",
    isDisplayed: true,
    isRandomlyPlayable: false,
  },
  {
    page: "random",
    title: "Random",
    shortTitle: "Random",
    categoryType: "Gameshow Presets",
    isDisplayed: true,
    isRandomlyPlayable: false,
  },

  {
    page: "campaign",
    title: "Campaign",
    shortTitle: "Campaign",
    categoryType: null,
    isDisplayed: false,
    isRandomlyPlayable: false,
  },
  {
    page: "campaign/area",
    title: "Campaign Areas",
    shortTitle: "Areas",
    categoryType: null,
    isDisplayed: false,
    isRandomlyPlayable: false,
  },
  {
    page: "campaign/area/level",
    title: "Campaign Level",
    shortTitle: "Level",
    categoryType: null,
    isDisplayed: false,
    isRandomlyPlayable: false,
  },
  {
    page: "challenges",
    title: "Challenges",
    shortTitle: "Challenges",
    categoryType: null,
    isDisplayed: false,
    isRandomlyPlayable: false,
  },
  {
    page: "settings",
    title: "Settings",
    shortTitle: "Settings",
    categoryType: null,
    isDisplayed: false,
    isRandomlyPlayable: false,
  },
];
