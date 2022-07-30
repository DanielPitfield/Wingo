import React from "react";
import { PageName } from "./PageNames";

// This is needed for runtime; make sure it matches the Page type

export const pageDescriptions: {
  page: PageName;
  title: string;
  description?: string;
  shortTitle?: string;
  isPlayable: boolean;
  helpInfo?: JSX.Element;
}[] = [
  { page: "splash-screen", title: "Wingo", isPlayable: false },
  { page: "TitlePage", title: "Home", isPlayable: false },
  //{ page: "home", title: "", isPlayable: false },
  {
    page: "wingo/daily",
    title: "Daily Wingo",
    description: "Guess today's word",
    shortTitle: "Daily",
    isPlayable: false,
    helpInfo: (
      <>
        <p>Only one attempt (a set of up to 6 guesses) allowed</p>
        <p>The target word changes every day (the timer shows when a new word is available)</p>
        <p>Your attempt will be saved and can be viewed at any time</p>
      </>
    ),
  },
  {
    page: "wingo/repeat",
    title: "Standard/Normal Wingo",
    description: "Guess a word",
    shortTitle: "Standard",
    isPlayable: true,
    helpInfo: (
      <>
        <p>Press the 'Restart' button after an attempt for a new target word</p>
      </>
    ),
  },
  {
    page: "wingo/category",
    title: "Wingo Categories",
    description: "Guess a word related to a category",
    shortTitle: "Categories",
    isPlayable: true,
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
    page: "wingo/increasing",
    title: "Wingo Increasing Length",
    description: "Increase the word length to guess with every correct answer",
    shortTitle: "Increasing",
    isPlayable: true,
    helpInfo: (
      <>
        <p>The target word will increase in length (one letter longer) after each successful guess</p>
      </>
    ),
  },
  {
    page: "wingo/limitless",
    title: "Wingo Limitless/Survival",
    description: "Gain lives with correct, early answers; how long can you survive?",
    shortTitle: "Limitless",
    isPlayable: true,
    helpInfo: (
      <>
        <p>Gain extra guesses (up to a maximum of 5) by guessing a word with guesses to spare</p>
        <p>A guess will be lost each time the target word is not guessed</p>
        <p>The target word will increase in length (one letter longer) after each successful guess</p>
      </>
    ),
  },
  {
    page: "wingo/puzzle",
    title: "Wingo Puzzle",
    description: "Use a cryptic clue to guess the word as fast as possible!",
    shortTitle: "Puzzle",
    isPlayable: true,
    helpInfo: (
      <>
        <p>Guess the target word from the hint provided</p>
        <p>A random letter of the target word will become revealed every few seconds</p>
        <p>Press 'Enter' once you know the answer and make your guess (this will stop the letters revealing!)</p>
      </>
    ),
  },
  {
    page: "wingo/interlinked",
    title: "Wingo Interlinked",
    description: "Guess two words interlinked by a shared letter",
    shortTitle: "Interlinked",
    isPlayable: true,
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
    description: "Guess a crossword of words",
    shortTitle: "Crossword",
    isPlayable: true,
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
    page: "wingo/crossword/fit",
    title: "Wingo Crossword Fit",
    description: "Fill the crossword with the provided words",
    shortTitle: "Crossword Fit",
    isPlayable: true,
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
    page: "wingo/crossword/weekly",
    title: "Wingo Crossword (Weekly)",
    description: "Guess a crossword for this week",
    shortTitle: "Weekly Crossword",
    isPlayable: false,
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
    page: "wingo/crossword/daily",
    title: "Wingo Crossword (Daily)",
    description: "Guess a crossword for today",
    shortTitle: "Daily Crossword",
    isPlayable: false,
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
    page: "LettersCategories",
    title: "Letters Categories",
    description: "Guess the word for each category",
    shortTitle: "Categories (5)",
    isPlayable: true,
    helpInfo: (
      <>
        <p>Select a category</p>
        <p>Guess the word from the hint for the category within the number of guesses</p>
        <p>Press the 'Restart' button after an attempt or change the Category for a new target word</p>
      </>
    ),
  },
  {
    page: "LettersGame",
    title: "Letters Game",
    description: "Find the highest scoring word from the list of random letters",
    shortTitle: "Letters Game",
    isPlayable: true,
  },
  {
    page: "NumbersGame",
    title: "Numbers Game",
    description: "Get the target number using a list of random numbers",
    shortTitle: "Numbers Game",
    isPlayable: true,
  },
  {
    page: "Conundrum",
    title: "Conundrum",
    description: "Find the single word which uses all the letters",
    shortTitle: "Conundrum",
    isPlayable: true,
  },
  {
    page: "ArithmeticReveal",
    title: "Quick Maths",
    description: "Test your arithmetic with quickfire calculations",
    shortTitle: "Quick Maths",
    isPlayable: true,
  },
  {
    page: "ArithmeticDrag/Order",
    title: "Arithmetic (Order)",
    description: "Put the arithmetic expressions in order from smallest to largest",
    shortTitle: "Arithmetic (Order)",
    isPlayable: true,
  },
  {
    page: "ArithmeticDrag/Match",
    title: "Arithmetic (Match)",
    description: "Match the arithmetic expressions with the results they evaluate to",
    shortTitle: "Arithmetic (Match)",
    isPlayable: true,
  },
  {
    page: "numble",
    title: "Numble",
    description: "Find the highest scoring number from a list of random numbers",
    shortTitle: "Numble",
    isPlayable: true,
  },
  {
    page: "OnlyConnect",
    title: "Only Connect",
    description: "Find groups of words from a scrambled word grid",
    shortTitle: "Only Connect",
    isPlayable: true,
  },
  {
    page: "SameLetters",
    title: "Same Letter Words",
    description: "Find the words which are made from the same letters",
    shortTitle: "Same Letter Words",
    isPlayable: true,
  },
  {
    page: "NumberSets",
    title: "Number Sets",
    description: "Find the answer to a unique number set",
    shortTitle: "Number Sets",
    isPlayable: true,
  },
  {
    page: "Algebra",
    title: "Algebra",
    description: "Find the answer to a unique number set",
    shortTitle: "Algebra",
    isPlayable: true,
  },
  {
    page: "WordCodes/Question",
    title: "Word Codes",
    description: "Decipher codes to find words (and vice versa)",
    shortTitle: "Word Codes",
    isPlayable: true,
  },
  {
    page: "WordCodes/Match",
    title: "Word Codes (Match)",
    description: "Match the words to their codes",
    shortTitle: "Word Codes (Match)",
    isPlayable: true,
  },
  {
    page: "PuzzleSequence",
    title: "Sequence Puzzle",
    description: "Find what comes next in the sequence",
    shortTitle: "Sequence",
    isPlayable: true,
  },
  { page: "campaign", title: "Campaign", shortTitle: "Campaign", isPlayable: false },
  { page: "campaign/area", title: "Campaign Areas", shortTitle: "Areas", isPlayable: false },
  { page: "campaign/area/level", title: "Campaign Level", shortTitle: "Level", isPlayable: false },
  { page: "challenges", title: "Challenges", shortTitle: "Challenges", isPlayable: false },
  { page: "settings", title: "Settings", shortTitle: "Settings", isPlayable: false },
  { page: "random", title: "Random", shortTitle: "Random", isPlayable: false },
  {
    page: "LettersNumbersGameshow",
    title: "Letters Numbers Gameshow",
    shortTitle: "Letters Numbers Gameshow",
    isPlayable: false,
  },
  { page: "Wingo/Gameshow", title: "Wingo Gameshow", shortTitle: "Wingo Gameshow", isPlayable: false },
];
