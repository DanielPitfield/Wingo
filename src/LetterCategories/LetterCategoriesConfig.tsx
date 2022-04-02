import React, { useState } from "react";
import "../App.scss";
import { Page } from "../App";
import LetterCategories from "./LetterCategories";
import { SaveData } from "../SaveData";
import { words_dogs } from "../WordArrays/Categories/dogs";
import { words_countries } from "../WordArrays/Categories/countries";
import { Alphabet } from "../Keyboard";
import { words_chemical_elements } from "../WordArrays/Categories/chemical_elements";
import { words_colours } from "../WordArrays/Categories/colours";
import { words_fruits_and_vegetables } from "../WordArrays/Categories/fruits_and_vegetables";
import { words_sports } from "../WordArrays/Categories/sports";
import { categoryMappings } from "../WordleConfig";

interface Props {
  enforceFullLengthGuesses: boolean;
  timerConfig: { isTimed: false } | { isTimed: true; seconds: number };
  keyboard: boolean;
  defaultWordLength: number;
  defaultnumGuesses: number;
  finishingButtonText?: string;
  onComplete?: () => void;
  page: Page;
  setPage: (page: Page) => void;
  addGold: (gold: number) => void;
}

const LetterCategoriesConfig: React.FC<Props> = (props) => {
  const [guesses, setGuesses] = useState<string[]>([]);
  const [numGuesses, setNumGuesses] = useState(props.defaultnumGuesses);
  const [gameId, setGameId] = useState<string | null>(null);
  const [currentWord, setCurrentWord] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [inProgress, setinProgress] = useState(true);
  const [isIncompleteWord, setisIncompleteWord] = useState(false);
  const [wordLength, setwordLength] = useState(props.defaultWordLength);
  const [targetWord, settargetWord] = useState("");
  const [categoryRequiredStartingLetter, setCategoryRequiredStartingLetter] = useState("");
  const [categoryIndexes, setCategoryIndexes] = useState<number[]>([]);
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
      const start_letter = Alphabet[Math.round(Math.random() * (Alphabet.length - 1))];
      // Set this letter as the letter that all words must begin with
      setCategoryRequiredStartingLetter(start_letter);
      console.log("Start Letter: " + start_letter);

      let category_indexes = new Set<number>();

      let category_target_words: string[][] = [];
      let failed_search_count = 0;

      do {
        // Get a random index of categoryMappings
        const newIndex = Math.round(Math.random() * (categoryMappings.length - 1));
        // If the category has not already been used
        if (!category_indexes.has(newIndex)) {
          // Get all the words in that category starting with start_letter
          const words = categoryMappings[newIndex].array.filter((x) => x.charAt(0) === start_letter);
          if (words && words.length >= 1) {
            // Push these words as an array
            category_target_words.push(words);
            // Keep track this category has been used
            category_indexes.add(newIndex);
          } else {
            failed_search_count += 1;
          }
        }
      } while (
        category_indexes.size < 5 &&
        category_indexes.size + failed_search_count !== categoryMappings.length &&
        failed_search_count <= 20
      );

      // Keep reference of which categories have been used
      setCategoryIndexes(Array.from(category_indexes));

      // Remove/filter out malformed category target arrays

      // NOTE: Make sure to use wordArrays with more words, otherwise this won't find any words to use
      console.log(category_target_words);

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
    props.onComplete?.();
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
      console.log("Reset");
      return;
    }

    // Don't allow incomplete words (if specified in props)
    if (props.enforceFullLengthGuesses) {
      if (currentWord.length !== wordLength) {
        // Incomplete (length of) word
        setisIncompleteWord(true);
        return;
      }
    }

    // Reached here, the word is complete or enforce full length guesses is off
    setisIncompleteWord(false);

    if (wordIndex >= props.defaultnumGuesses) {
      // Used all the available rows (out of guesses)
      return;
    }

    // TODO: Optimisation: Not determining all the words which are valid guesses EVERY and every time enter is pressed?

    // wordArray generation
    let wordArray = categoryWordTargets[wordIndex];

    if (!wordArray || wordArray.length === 0) {
      return;
    }

    if (wordArray.includes(currentWord.toLowerCase())) {
      // Correct word

      // Easiest way to show all green letter statuses
      settargetWord(currentWord);
    } else {
      // Incorrect word
    }

    setGuesses(guesses.concat(currentWord)); // ALways show guess

    if (wordIndex + 1 === numGuesses) {
      // Out of guesses
      setinProgress(false);
    } else {
      setCurrentWord(""); // Start new word as empty string
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
      keyboard={props.keyboard}
      wordLength={wordLength}
      numGuesses={numGuesses}
      guesses={guesses}
      currentWord={currentWord}
      wordIndex={wordIndex}
      inProgress={inProgress}
      isIncompleteWord={isIncompleteWord}
      hasSubmitLetter={hasSubmitLetter}
      targetWord={targetWord || ""}
      categoryRequiredStartingLetter={categoryRequiredStartingLetter || ""}
      categoryIndexes={categoryIndexes || []}
      categoryWordTargets={categoryWordTargets || [[]]}
      finishingButtonText={props.finishingButtonText}
      onEnter={onEnter}
      onSubmitLetter={onSubmitLetter}
      onBackspace={onBackspace}
      ResetGame={ResetGame}
      setPage={props.setPage}
    ></LetterCategories>
  );
};

export default LetterCategoriesConfig;
