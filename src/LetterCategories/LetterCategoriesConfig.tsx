import React, { useState } from "react";
import { Page } from "../App";
import LetterCategories from "./LetterCategories";
import { SettingsData } from "../SaveData";
import { DEFAULT_ALPHABET } from "../Keyboard";
import { categoryMappings } from "../WordleConfig";
import { Theme } from "../Themes";

interface Props {
  enforceFullLengthGuesses: boolean;
  timerConfig: { isTimed: false } | { isTimed: true; seconds: number };
  defaultWordLength: number;
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
  const [wordLength, setwordLength] = useState(props.defaultWordLength);
  const [correctGuessesCount, setCorrectGuessesCount] = useState(0);
  const [categoryRequiredStartingLetter, setCategoryRequiredStartingLetter] = useState("");
  const [categoryNames, setCategoryNames] = useState<string[]>([]);
  const [categoryWordTargets, setCategoryWordTargets] = useState<string[][]>([[]]);
  const [hasSubmitLetter, sethasSubmitLetter] = useState(false);
  const [seconds, setSeconds] = useState(props.timerConfig.isTimed ? props.timerConfig.seconds : 0);

  // Timer Setup
  React.useEffect(() => {
    if (!props.timerConfig.isTimed) {
      return;
    }

    const timer = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      } else {
        setinProgress(false);
      }
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [setSeconds, seconds, props.timerConfig.isTimed]);

  // targetWord generation
  React.useEffect(() => {
    if (inProgress) {
      // Get a random letter from the Alphabet
      const start_letter = DEFAULT_ALPHABET[Math.round(Math.random() * (DEFAULT_ALPHABET.length - 1))];
      // Set this letter as the letter that all words must begin with
      setCategoryRequiredStartingLetter(start_letter);

      setCurrentWord(start_letter);

      console.log(`%cStart Letter:%c ${start_letter}`, "font-weight: bold", "font-weight: normal");

      let category_names: string[] = [];

      let category_target_words: string[][] = [];
      let failed_search_count = 0;

      do {
        // Get a random index of categoryMappings
        const newIndex = Math.round(Math.random() * (categoryMappings.length - 1));
        // If the category has not already been used
        if (!category_names.includes(categoryMappings[newIndex].name)) {
          // Get all the words in that category starting with start_letter
          const words = categoryMappings[newIndex].array.map((x) => x.word).filter((x) => x.charAt(0) === start_letter);
          if (words && words.length >= 1) {
            // Push these words as an array
            category_target_words.push(words);
            // Keep track this category has been used
            category_names.push(categoryMappings[newIndex].name);
          } else {
            failed_search_count += 1;
          }
        }
      } while (
        // Stop once there are 5 categories or 20 attempts were made at finding categories
        category_names.length < 5 &&
        failed_search_count <= 20
      );

      // Keep reference of which categories have been used
      setCategoryNames(category_names);

      for (let i = 0; i < category_target_words.length; i++) {
        console.log(
          `%cCategory:%c ${category_names[i]}\n%cWords:%c ${category_target_words[i].join(", ")}`,
          "font-weight: bold",
          "font-weight: normal",
          "font-weight: bold",
          "font-weight: normal"
        );
      }

      setCategoryWordTargets(category_target_words);

      // Number of rows needs to be the same as the number of categories
      setNumGuesses(category_target_words.length);

      // Start wordLength at 4
      let longest_valid_length = 4;
      // Find the longest word in the array of valid words for each category
      for (let i = 0; i < category_target_words.length; i++) {
        const longestWordInArray = category_target_words[i].reduce(
          (currentWord, nextWord) => (currentWord.length > nextWord.length ? currentWord : nextWord),
          ""
        );
        // Increase wordLength if a valid word is longer than the current wordLength
        if (longestWordInArray.length > longest_valid_length) {
          longest_valid_length = longestWordInArray.length;
        }
      }

      // Set the wordLength to the length of the largest valid word in any of the categories
      setwordLength(longest_valid_length);
    }
  }, [inProgress]);

  function ResetGame() {
    props.onComplete?.(true);
    setGuesses([]);
    setCurrentWord("");
    setWordIndex(0);
    setinProgress(true);
    sethasSubmitLetter(false);
    if (props.timerConfig.isTimed) {
      // Reset the timer if it is enabled in the game options
      setSeconds(props.timerConfig.seconds);
    }
  }

  function calculateGoldAwarded(
    wordLength: number,
    /*win_streak: number,*/
    numGuesses: number
  ) {
    const gamemode_value = 50;

    // Incremental multiplier with wordLength
    const wordLength_Gold_Mappings = [
      { value: 4, multiplier: 1 },
      { value: 5, multiplier: 1.05 },
      { value: 6, multiplier: 1.25 },
      { value: 7, multiplier: 1.5 },
      { value: 8, multiplier: 2 },
      { value: 9, multiplier: 3 },
      { value: 10, multiplier: 5 },
      { value: 11, multiplier: 7.5 },
    ];

    const wordLength_multiplier = wordLength_Gold_Mappings.find((x) => x.value === wordLength)?.multiplier!;

    // Small bonus for early guesses
    const numGuesses_Gold_Mappings = [
      {
        guesses: 1,
        value: 250,
      }, // TODO: Balancing, puzzle words are always 1 guess
      { guesses: 2, value: 100 },
      { guesses: 3, value: 50 },
      { guesses: 4, value: 25 },
      { guesses: 5, value: 10 },
      { guesses: 6, value: 0 },
    ];

    const numGuesses_bonus = numGuesses_Gold_Mappings.find((x) => x.guesses === numGuesses)?.value!;

    const goldTotal = Math.round(gamemode_value * wordLength_multiplier + numGuesses_bonus);
    return goldTotal;
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

  return (
    <LetterCategories
      timerConfig={
        props.timerConfig.isTimed
          ? {
              isTimed: true,
              elapsedSeconds: seconds,
              totalSeconds: props.timerConfig.seconds,
            }
          : { isTimed: false }
      }
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
