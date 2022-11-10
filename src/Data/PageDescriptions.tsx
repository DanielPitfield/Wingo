import { MAX_TARGET_WORD_LENGTH } from "./GamemodeSettingsInputLimits";
import { PagePath } from "./PageNames";

export const gamemodeCategories = [
  "Daily / Weekly",
  "Wingo",
  "Letters",
  "Numbers",
  "Puzzle",
  "Presets",
  null,
] as const;

export type gamemodeCategory = typeof gamemodeCategories[number];

export type pageDescription = {
  path: PagePath;
  title: string;
  shortTitle?: string;
  // What category best describes this gamemode (the tile to select the gamemode will be under a title with this name)?
  categoryType: gamemodeCategory;
  // Is the gamemode shown on the gamemode selection screen (is it available to play/enabled?)
  isDisplayed: boolean;
  // Can the gamemode be selected during a random session?
  isRandomlyPlayable: boolean;
  description?: string;
  helpInfo?: JSX.Element;
};

/* 
TODO: Gamemode display order
Is there some way of specifying which order the tiles which are derived from these pageDescriptions appear?
Other than ensuring they are in the correct order here (within pageDescriptions)
*/

// TODO: helpInfo for every gamemode

export const pageDescriptions: pageDescription[] = [
  { path: "/Splashscreen", title: "Wingo", categoryType: null, isDisplayed: false, isRandomlyPlayable: false },
  { path: "/TitlePage", title: "Home", categoryType: null, isDisplayed: false, isRandomlyPlayable: false },
  //{ page: "/Home", title: "", isDisplayed: false, isRandomlyPlayable: false },
  {
    path: "/Wingo/Daily",
    title: "Daily Wingo",
    shortTitle: "Daily",
    categoryType: "Daily / Weekly",
    isDisplayed: true,
    isRandomlyPlayable: false,
    description: "Guess today's word",
    helpInfo: (
      <>
        <p>Only one attempt (a set of up to 6 guesses) allowed</p>
        <p>The target word changes every day (after completion, the timer shows when a new word is available)</p>
        <p>Your attempt will be saved (and can be viewed at any time during the day)</p>
      </>
    ),
  },
  {
    path: "/Wingo/Crossword/Daily",
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
    path: "/Wingo/Crossword/Weekly",
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
    path: "/Wingo/Repeat",
    title: "Standard/Normal Wingo",
    shortTitle: "Standard",
    categoryType: "Wingo",
    isDisplayed: true,
    isRandomlyPlayable: true,
    description: "Guess a word",
    helpInfo: (
      // TODO: Include images to show examples of the different letter statuses
      // TODO: Change the colour of the text within the <p> element
      // https://www.nytimes.com/games/wordle/index.html
      <>
        <p>Each guess must be a valid word</p>
        <p>
          When a guess is submited, the colour of the tiles will change to show how close your guess is to the correct
          word
        </p>
        <p>A green tile means the letter is in the word and in the correct spot</p>
        <p>A yellow tile means the letter is in the word but in the wrong spot</p>
        <p>A grey tile means the letter is not in the word</p>
        <p>Press the 'Restart' button after an attempt for a new target word</p>
      </>
    ),
  },
  {
    path: "/Wingo/Puzzle",
    title: "Wingo Puzzle",
    shortTitle: "Puzzle",
    categoryType: "Wingo",
    isDisplayed: true,
    isRandomlyPlayable: true,
    description: "Use a cryptic clue to guess the word as fast as possible!",
    helpInfo: (
      <>
        <p>Guess the target word from the hint provided</p>
        <p>A random letter of the target word will be periodically revealed</p>
        <p>
          Press 'Enter' once you know the answer and make your guess (this will however stop any more letters
          revealing!)
        </p>
      </>
    ),
  },
  {
    path: "/Wingo/Increasing",
    title: "Wingo Increasing Length",
    shortTitle: "Increasing",
    categoryType: "Wingo",
    isDisplayed: true,
    isRandomlyPlayable: true,
    description: "Increase the word length to guess with every correct answer",
    helpInfo: (
      // TODO: Somehow link to help information for the base repeat mode?
      <>
        <p>Normal Wingo rules apply</p>
        <p>The target word will increase in length (one letter longer) after each successful guess</p>
        <p>{`The game will end when a ${MAX_TARGET_WORD_LENGTH} letter word is correctly guessed`}</p>
      </>
    ),
  },
  {
    path: "/Wingo/Limitless",
    title: "Wingo Limitless/Survival",
    shortTitle: "Limitless",
    categoryType: "Wingo",
    isDisplayed: true,
    isRandomlyPlayable: true,
    description: "Gain lives with correct, early answers; how long can you survive?",
    helpInfo: (
      <>
        <p>Gain extra guesses (by default, up to a maximum of 5) by guessing a word with guesses to spare</p>
        <p>A guess will be lost each time the target word is not guessed</p>
        <p>The target word will increase in length after each successful guess</p>
        <p>The game ends after an incorrect guess with only one guess (row) remaining</p>
      </>
    ),
  },
  {
    path: "/Wingo/Category",
    title: "Wingo Categories",
    shortTitle: "Categories",
    categoryType: "Wingo",
    isDisplayed: true,
    isRandomlyPlayable: true,
    description: "Guess a word related to a category",
    helpInfo: (
      <>
        <p>The target word is a word from the currently selected category</p>
        <p>The category can be changed from the dropdown list</p>
        <p>
          The guesses you make must also be words from this category (but they do not have to be the length of the
          target word)
        </p>
      </>
    ),
  },
  {
    path: "/Wingo/Interlinked",
    title: "Wingo Interlinked",
    shortTitle: "Interlinked",
    categoryType: "Wingo",
    isDisplayed: true,
    isRandomlyPlayable: true,
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
    path: "/Wingo/Crossword",
    title: "Wingo Crossword",
    shortTitle: "Crossword",
    categoryType: "Wingo",
    isDisplayed: true,
    isRandomlyPlayable: true,
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
    path: "/OnlyConnect",
    title: "Only Connect",
    shortTitle: "Only Connect",
    categoryType: "Letters",
    isDisplayed: true,
    isRandomlyPlayable: true,
    description: "Find groups of words from a scrambled word grid",
    helpInfo: (
      // https://en.wikipedia.org/wiki/Only_Connect#Round_3:_Connecting_Wall
      <>
        <p>Select a group of words that share a common connection (category)</p>
        <p>The size of the selection must be equal to the width of the provided grid</p>
        <p>A correct selection will automatically be moved to its own row (the grid will be sorted)</p>
        <p>Before finding two complete groups, the number of guesses is unlimited</p>
        <p>After finding two complete groups, only three guesses are allowed</p>
      </>
    ),
  },
  {
    path: "/LettersGame",
    title: "Letters Game",
    shortTitle: "Letters Game",
    categoryType: "Letters",
    isDisplayed: true,
    isRandomlyPlayable: true,
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
    path: "/Conundrum",
    title: "Conundrum",
    shortTitle: "Conundrum",
    categoryType: "Letters",
    isDisplayed: true,
    isRandomlyPlayable: true,
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
    path: "/LettersCategories",
    title: "Letters Categories",
    shortTitle: "Categories (5)",
    categoryType: "Letters",
    isDisplayed: true,
    isRandomlyPlayable: true,
    description: "Guess the word for each category",
    helpInfo: (
      <>
        <p>Enter a word (of any length) for each category that starts with the provided letter</p>
      </>
    ),
  },
  {
    path: "/SameLetters",
    title: "Same Letter Words",
    shortTitle: "Same Letter Words",
    categoryType: "Letters",
    isDisplayed: true,
    isRandomlyPlayable: true,
    description: "Find the words which are made from the same letters",
    helpInfo: (
      <>
        <p>Select the words which contain the same letters (the words that are anagrams)</p>
      </>
    ),
  },
  {
    path: "/WordCodes/Question",
    title: "Word Codes",
    shortTitle: "Word Codes",
    categoryType: "Letters",
    isDisplayed: true,
    isRandomlyPlayable: true,
    description: "Decipher codes to find words (and vice versa)",
  },
  {
    path: "/WordCodes/Match",
    title: "Word Codes (Match)",
    shortTitle: "Word Codes (Match)",
    categoryType: "Letters",
    isDisplayed: true,
    isRandomlyPlayable: true,
    description: "Match the words to their codes",
  },
  {
    path: "/Wingo/Crossword/Fit",
    title: "Wingo Crossword Fit",
    shortTitle: "Crossword Fit",
    categoryType: "Letters",
    isDisplayed: true,
    isRandomlyPlayable: true,
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
    path: "/ArithmeticReveal",
    title: "Quick Maths",
    shortTitle: "Quick Maths",
    categoryType: "Numbers",
    isDisplayed: true,
    isRandomlyPlayable: true,
    description: "Test your arithmetic with quickfire calculations",
    helpInfo: (
      <>
        <p>A starting number will be shown</p>
        <p>Tiles with mathematical operations will periodically appear</p>
        <p>Calculate and keep track of the running total</p>
        <p>After a certain number of tiles, a checkpoint may be reached where the running total needs to be entered</p>
        <p>There may be several checkpoints but the number of tiles between checkponts will not change</p>
      </>
    ),
  },
  {
    path: "/Numble",
    title: "Numble",
    shortTitle: "Numble",
    categoryType: "Numbers",
    isDisplayed: true,
    isRandomlyPlayable: true,
    description: "Find the highest scoring number from a list of random numbers",
  },
  {
    path: "/NumbersGame",
    title: "Numbers Game",
    shortTitle: "Numbers Game",
    categoryType: "Numbers",
    isDisplayed: true,
    isRandomlyPlayable: true,
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
    path: "/ArithmeticDrag/Order",
    title: "Arithmetic (Order)",
    shortTitle: "Arithmetic (Order)",
    categoryType: "Numbers",
    isDisplayed: true,
    isRandomlyPlayable: true,
    description: "Put the arithmetic expressions in order from smallest to largest",
  },
  {
    path: "/ArithmeticDrag/Match",
    title: "Arithmetic (Match)",
    shortTitle: "Arithmetic (Match)",
    categoryType: "Numbers",
    isDisplayed: true,
    isRandomlyPlayable: true,
    description: "Match the arithmetic expressions with the results they evaluate to",
  },
  {
    path: "/NumberSets",
    title: "Number Sets",
    shortTitle: "Number Sets",
    categoryType: "Numbers",
    isDisplayed: true,
    isRandomlyPlayable: true,
    description: "Find the answer to a unique number set",
  },
  {
    path: "/Algebra",
    title: "Algebra",
    shortTitle: "Algebra",
    categoryType: "Numbers",
    isDisplayed: true,
    isRandomlyPlayable: true,
    description: "Find the answer to a unique number set",
  },
  {
    path: "/PuzzleSequence",
    title: "Sequence Puzzle",
    shortTitle: "Sequence",
    categoryType: "Puzzle",
    isDisplayed: false,
    isRandomlyPlayable: true,
    description: "Find what comes next in the sequence",
  },
  {
    path: "/Random",
    title: "Random",
    shortTitle: "Random",
    categoryType: "Presets",
    isDisplayed: true,
    isRandomlyPlayable: false,
  },
  {
    path: "/Campaign",
    title: "Campaign",
    shortTitle: "Campaign",
    categoryType: null,
    isDisplayed: false,
    isRandomlyPlayable: false,
  },
  {
    path: "/Campaign/Areas/:areaName",
    title: "Campaign Areas",
    shortTitle: "Areas",
    categoryType: null,
    isDisplayed: false,
    isRandomlyPlayable: false,
  },
  {
    path: "/Campaign/Areas/:areaName/Levels/:levelNumber",
    title: "Campaign Level",
    shortTitle: "Level",
    categoryType: null,
    isDisplayed: false,
    isRandomlyPlayable: false,
  },
  {
    path: "/Challenges",
    title: "Challenges",
    shortTitle: "Challenges",
    categoryType: null,
    isDisplayed: false,
    isRandomlyPlayable: false,
  },
  {
    path: "/Settings",
    title: "Settings",
    shortTitle: "Settings",
    categoryType: null,
    isDisplayed: false,
    isRandomlyPlayable: false,
  },
];
