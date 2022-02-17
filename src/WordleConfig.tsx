import React, { useState } from "react";
import "./App.css";
import { Page } from "./App";
import Wordle from "./Wordle";
import {
  words_four,
  words_five /*, words_six, words_seven, words_eight, words_nine, words_ten*/,
} from "./words";

interface Props {
  mode: "daily" | "repeat" | "limitless";
  defaultWordLength: number;
  numGuesses: number;
  setPage: (page: Page) => void;
}

const wordLengthMappings = [
  { value: 4, array: words_four },
  { value: 5, array: words_five },
  /*
  { value: 6, array: words_six },
  { value: 7, array: words_seven },
  { value: 8, array: words_eight },
  { value: 9, array: words_nine },
  { value: 10, array: words_ten }
  */
];

const WordleConfig: React.FC<Props> = (props) => {
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [inProgress, setinProgress] = useState(true);
  const [inDictionary, setinDictionary] = useState(true);
  const [wordLength, setwordLength] = useState(props.defaultWordLength);
  const [targetWord, settargetWord] = useState<string>();

  React.useEffect(() => {
    if (inProgress && props.mode !== "daily") {
      const wordArray = wordLengthMappings.find((x) => x.value == wordLength)
        ?.array!;
      const newtargetword =
        wordArray[Math.round(Math.random() * wordArray.length)];
      settargetWord(newtargetword);
      console.log("Not daily word: " + newtargetword);
    } else {
      const wordArray = wordLengthMappings.find((x) => x.value == wordLength)
        ?.array!;
        
      const timestamp = +new Date(); // Unix timestamp (in milliseconds)
      const ms_per_day = 24 * 60 * 60 * 1000;
      const days_since_epoch = Math.floor(timestamp / ms_per_day);
      const daily_word_index = Math.round(days_since_epoch % wordArray.length); // Number in the range [0, wordArray.length)
      const new_daily_word = wordArray[daily_word_index];
      console.log("Daily word: " + new_daily_word);
      settargetWord(new_daily_word);
    }
  }, [wordLength, inProgress]);

  function ResetGame() {
    setGuesses([]);
    setCurrentWord("");
    setWordIndex(0);
    setinProgress(true);
    setinDictionary(true);
    setwordLength(props.defaultWordLength);
  }

  function ContinueGame() {
    setGuesses([]);
    setCurrentWord("");
    setWordIndex(0);
    setinProgress(true);
    setinDictionary(true);
    setwordLength(wordLength + 1);
  }

  function onEnter() {
    if (!inProgress) {
      return;
    }

    setinDictionary(true);

    if (currentWord.length !== wordLength) {
      /* Incomplete word */
      return;
    }

    if (wordIndex >= props.numGuesses) {
      /* Used all the available rows (out of guesses) */
      return;
    }

    const wordArray = wordLengthMappings.find((x) => x.value == wordLength)
      ?.array!;

    if (wordArray.includes(currentWord.toLowerCase())) {
      /* Completed and accepeted word */
      setGuesses(guesses.concat(currentWord)); /* Add word to guesses */

      if (currentWord.toUpperCase() === targetWord?.toUpperCase()) {
        /* Exact match */
        setinProgress(false);
      } else if (wordIndex + 1 === props.numGuesses) {
        setinProgress(false);
      } else {
        setCurrentWord(""); /* Start new word as empty string */
        setWordIndex(
          wordIndex + 1
        ); /* Increment index to indicate new word has been started */
      }
    } else {
      setinDictionary(false);
      setinProgress(false);
    }
  }

  function onSubmitLetter(letter: string) {
    if (currentWord.length < wordLength && inProgress) {
      setCurrentWord(
        currentWord + letter
      ); /* Append chosen letter to currentWord */
    }
  }

  function onBackspace() {
    if (currentWord.length > 0 && inProgress) {
      /* If there is a letter to remove */
      setCurrentWord(currentWord.substring(0, currentWord.length - 1));
    }
  }

  return (
    <Wordle
      mode={props.mode}
      wordLength={wordLength}
      numGuesses={props.numGuesses}
      guesses={guesses}
      currentWord={currentWord}
      wordIndex={wordIndex}
      inProgress={inProgress}
      inDictionary={inDictionary}
      targetWord={targetWord || ""}
      setPage={props.setPage}
      onEnter={onEnter}
      onSubmitLetter={onSubmitLetter}
      onBackspace={onBackspace}
      ResetGame={ResetGame}
      ContinueGame={ContinueGame}
    ></Wordle>
  );
};

export default WordleConfig;
