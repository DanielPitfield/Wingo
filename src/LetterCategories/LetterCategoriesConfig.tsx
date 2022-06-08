import React, { useState } from "react";
import { Page } from "../App";
import LetterCategories from "./LetterCategories";
import { SettingsData } from "../SaveData";
import { DEFAULT_ALPHABET } from "../Keyboard";
import { categoryMappings } from "../WordleConfig";
import { Theme } from "../Themes";

interface Props {
  enforceFullLengthGuesses: boolean;
  numCategories: number;
  defaultnumGuesses: number;
  finishingButtonText?: string;
  theme: Theme;
  settings: SettingsData;
  page: Page;
  setPage: (page: Page) => void;
  addGold: (gold: number) => void;
  onComplete?: (wasCorrect: boolean) => void;
}

const LetterCategoriesConfig: React.FC<Props> = (props) => {
  const [guesses, setGuesses] = useState<string[]>([]);
  const [numGuesses, setNumGuesses] = useState(props.defaultnumGuesses);
  const [gameId, setGameId] = useState<string | null>(null);
  const [currentWord, setCurrentWord] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [inProgress, setinProgress] = useState(true);
  const [wordLength, setwordLength] = useState(4);
  const [correctGuessesCount, setCorrectGuessesCount] = useState(0);
  const [categoryRequiredStartingLetter, setCategoryRequiredStartingLetter] = useState("");
  const [categoryNames, setCategoryNames] = useState<string[]>([]);
  const [categoryWordTargets, setCategoryWordTargets] = useState<string[][]>([[]]);
  const [hasSubmitLetter, sethasSubmitLetter] = useState(false);

  // Gamemode settings
  const [isTimerEnabled, setIsTimerEnabled] = useState(true);
  const DEFAULT_TIMER_VALUE = 30;
  const [remainingSeconds, setRemainingSeconds] = useState(DEFAULT_TIMER_VALUE);
  const [totalSeconds, setTotalSeconds] = useState(DEFAULT_TIMER_VALUE);

  // Generate the elements to configure the gamemode settings
  const gamemodeSettings = generateSettings();

  // Timer Setup
  React.useEffect(() => {
    if (!isTimerEnabled) {
      return;
    }

    const timer = setInterval(() => {
      if (remainingSeconds > 0) {
        setRemainingSeconds(remainingSeconds - 1);
      } else {
        setinProgress(false);
      }
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [setRemainingSeconds, remainingSeconds, isTimerEnabled]);

  // targetWord generation
  React.useEffect(() => {
    if (inProgress) {
      // Get a random letter from the Alphabet
      const firstLetter = DEFAULT_ALPHABET[Math.round(Math.random() * (DEFAULT_ALPHABET.length - 1))];
      // Set this letter as the letter that all words must begin with
      setCategoryRequiredStartingLetter(firstLetter);
      // Provide this letter as the start of guesses/words
      setCurrentWord(firstLetter);

      console.log(`%cStart Letter:%c ${firstLetter}`, "font-weight: bold", "font-weight: normal");

      // The names of the categories in play
      let categoryNames: string[] = [];

      // The valid words for each of the categories
      let categoryTargetWords: string[][] = [];

      let failedSearchCount = 0;
      const MAX_NUM_FAILED_SEARCHES = 50;

      do {
        // Get a random index of categoryMappings
        const newIndex = Math.round(Math.random() * (categoryMappings.length - 1));
        // Is the category (randomly selected with the index) a category which has not been used yet?
        const isNewCategory = !categoryNames.includes(categoryMappings[newIndex].name);

        // Already used this category, so loop around again
        if (!isNewCategory) {
          failedSearchCount += 1;
          continue;
        }

        // Get all the words in the category starting with firstLetter
        const words = categoryMappings[newIndex].array.map((x) => x.word).filter((x) => x.charAt(0) === firstLetter);

        // No words starting with firstLetter
        if (!words) {
          failedSearchCount += 1;
          continue;
        }

        // Push these words as an array
        categoryTargetWords.push(words);
        // Keep track this category has been used
        categoryNames.push(categoryMappings[newIndex].name);
      } while (
        // Until there are the specified number of categories (or MAX_NUM_FAILED_SEARCHES attempts were made at finding categories)
        categoryNames.length < props.numCategories &&
        failedSearchCount <= MAX_NUM_FAILED_SEARCHES
      );

      // Keep reference of which categories have been used
      setCategoryNames(categoryNames);

      for (let i = 0; i < categoryTargetWords.length; i++) {
        console.log(
          `%cCategory:%c ${categoryNames[i]}\n%cWords:%c ${categoryTargetWords[i].join(", ")}`,
          "font-weight: bold",
          "font-weight: normal",
          "font-weight: bold",
          "font-weight: normal"
        );
      }

      setCategoryWordTargets(categoryTargetWords);

      // Number of rows needs to be the same as the number of categories
      setNumGuesses(categoryTargetWords.length);

      // Start longestValidLength (at 4)
      let longestValidLength = wordLength;

      // Find the longest word in the array of valid words for each category
      for (let i = 0; i < categoryTargetWords.length; i++) {
        const longestWordInArray = categoryTargetWords[i].reduce(
          (currentWord, nextWord) => (currentWord.length > nextWord.length ? currentWord : nextWord),
          ""
        );
        // Update longestValidLength (if there is a longer valid word)
        if (longestWordInArray.length > longestValidLength) {
          longestValidLength = longestWordInArray.length;
        }
      }

      // Set the wordLength to the length of the largest valid word in any of the categories
      setwordLength(longestValidLength);
    }
  }, [inProgress]);

  function ResetGame() {
    props.onComplete?.(true);
    setGuesses([]);
    setCurrentWord("");
    setWordIndex(0);
    setinProgress(true);
    sethasSubmitLetter(false);
    if (isTimerEnabled) {
      // Reset the timer if it is enabled in the game options
      setRemainingSeconds(totalSeconds);
    }
  }

  function calculateGoldAwarded(numCorrectAnswers: number) {
    const baseValue = 50;

    // Incremental multiplier with wordLength
    const numCorrectAnswerMultipliers = [
      { value: 1, multiplier: 1 },
      { value: 2, multiplier: 1.05 },
      { value: 3, multiplier: 1.25 },
      { value: 4, multiplier: 1.5 },
      { value: 5, multiplier: 2 },
      { value: 6, multiplier: 3 },
      { value: 7, multiplier: 4 },
      { value: 8, multiplier: 5 },
      { value: 9, multiplier: 7.5 },
      { value: 10, multiplier: 10 },
    ];

    // Bonus multiplier for several correct answers
    let currentNumCorrectAnswerMultiplier;

    // More correct answers (then the highest specified above)
    if (numCorrectAnswers > numCorrectAnswerMultipliers.length) {
      // Use the biggest specified multiplier
      currentNumCorrectAnswerMultiplier = numCorrectAnswerMultipliers.find(
        (x) => x.value === numCorrectAnswerMultipliers.length
      )?.multiplier;
    } else {
      // Use the multiplier for the number of correct answers
      currentNumCorrectAnswerMultiplier = numCorrectAnswerMultipliers.find(
        (x) => x.value === numCorrectAnswers
      )?.multiplier;
    }

    if (currentNumCorrectAnswerMultiplier) {
      const goldTotal = Math.round(baseValue * numCorrectAnswers * currentNumCorrectAnswerMultiplier);
      return goldTotal;
    } else {
      return 0;
    }
  }

  function onEnter() {
    // Pressing Enter to Restart
    if (!inProgress) {
      ResetGame();
      return;
    }

    if (wordIndex >= props.defaultnumGuesses) {
      // Used all the available rows (out of guesses)
      return;
    }

    // Array of valid words (for the row's category)
    const wordArray = categoryWordTargets[wordIndex];

    if (!wordArray || wordArray.length === 0) {
      return;
    }

    if (wordArray.includes(currentWord.toLowerCase())) {
      // Correct word
      setCorrectGuessesCount(correctGuessesCount + 1);
    }

    setGuesses(guesses.concat(currentWord)); // Always show guess

    if (wordIndex + 1 === numGuesses) {
      // Out of guesses
      setinProgress(false);

      // Calculate and add gold (only after all guesses have been made)
      const goldBanked = calculateGoldAwarded(correctGuessesCount);
      props.addGold(goldBanked);
    } else {
      setCurrentWord(categoryRequiredStartingLetter);
      setWordIndex(wordIndex + 1); // Increment index to indicate new word has been started
    }
  }

  function onSubmitLetter(letter: string) {
    if (currentWord.length < wordLength && inProgress) {
      setCurrentWord(currentWord + letter);
      sethasSubmitLetter(true);
    }
  }

  function onBackspace() {
    if (currentWord.length > 0 && inProgress) {
      // Never remove first letter
      if (currentWord.length === 1) {
        return; // Don't allow backspace
      }
      // If there is a letter to remove
      setCurrentWord(currentWord.substring(0, currentWord.length - 1));
    }
  }

  function generateSettings(): React.ReactNode {
    let settings;

    settings = (
      <>
        <label>
          <input
            checked={isTimerEnabled}
            type="checkbox"
            onChange={(e) => {
              setIsTimerEnabled(!isTimerEnabled);
            }}
          ></input>
          Timer
        </label>
        {isTimerEnabled && (
          <label>
            <input
              type="number"
              value={totalSeconds}
              min={10}
              max={120}
              step={5}
              onChange={(e) => {
                setRemainingSeconds(e.target.valueAsNumber);
                setTotalSeconds(e.target.valueAsNumber);
              }}
            ></input>
            Seconds
          </label>
        )}
      </>
    );

    return settings;
  }

  return (
    <LetterCategories
      timerConfig={
        isTimerEnabled
          ? {
              isTimed: true,
              remainingSeconds: remainingSeconds,
              totalSeconds: totalSeconds,
            }
          : { isTimed: false }
      }
      gamemodeSettings={gamemodeSettings}
      wordLength={wordLength}
      numGuesses={numGuesses}
      guesses={guesses}
      currentWord={currentWord}
      wordIndex={wordIndex}
      inProgress={inProgress}
      hasSubmitLetter={hasSubmitLetter}
      correctGuessesCount={correctGuessesCount}
      categoryRequiredStartingLetter={categoryRequiredStartingLetter || ""}
      categoryNames={categoryNames || []}
      categoryWordTargets={categoryWordTargets || [[]]}
      finishingButtonText={props.finishingButtonText}
      theme={props.theme}
      settings={props.settings}
      onEnter={onEnter}
      onSubmitLetter={onSubmitLetter}
      onBackspace={onBackspace}
      ResetGame={ResetGame}
      setPage={props.setPage}
    />
  );
};

export default LetterCategoriesConfig;
