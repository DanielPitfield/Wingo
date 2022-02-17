import React, { useState } from "react";
import "./App.css";
import { Page } from "./App";
import Wordle from "./Wordle";
import { words_four } from "./WordArrays/words_4";
import { words_five } from "./WordArrays/words_5";
import { words_six } from "./WordArrays/words_6";
import { words_seven } from "./WordArrays/words_7";
import { words_eight } from "./WordArrays/words_8";
import { words_nine } from "./WordArrays/words_9";
import { words_ten } from "./WordArrays/words_10";
import { words_eleven } from "./WordArrays/words_11";
import { wordHintMappings } from "./WordArrays/words_puzzles";

interface Props {
  mode: "daily" | "repeat" | "limitless" | "puzzle";
  defaultWordLength: number;
  numGuesses: number;
  setPage: (page: Page) => void;
}

const wordLengthMappings = [
  { value: 4, array: words_four },
  { value: 5, array: words_five },
  { value: 6, array: words_six },
  { value: 7, array: words_seven },
  { value: 8, array: words_eight },
  { value: 9, array: words_nine },
  { value: 10, array: words_ten },
  { value: 11, array: words_eleven }
];

const WordleConfig: React.FC<Props> = (props) => {
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [inProgress, setinProgress] = useState(true);
  const [inDictionary, setinDictionary] = useState(true);
  const [wordLength, setwordLength] = useState(props.defaultWordLength);
  const [targetWord, settargetWord] = useState<string>();
  const [targetHint, settargetHint] = useState("");

  React.useEffect(() => {
    if (inProgress) {
      if (props.mode === "daily") {
        const wordArray = wordLengthMappings.find((x) => x.value === wordLength)
          ?.array!;

        const timestamp = +new Date(); // Unix timestamp (in milliseconds)
        const ms_per_day = 24 * 60 * 60 * 1000;
        const days_since_epoch = Math.floor(timestamp / ms_per_day);
        const daily_word_index = Math.round(
          days_since_epoch % wordArray.length
        ); // Number in the range (0, wordArray.length)
        const new_daily_word = wordArray[daily_word_index];

        console.log("Daily word: " + new_daily_word);
        settargetWord(new_daily_word);

      }
      else if (props.mode === "puzzle") {
        const puzzle = wordHintMappings[Math.round(Math.random() * wordHintMappings.length)]
        console.log("Puzzle word: " + puzzle.word);
        settargetWord(puzzle.word);
        settargetHint(puzzle.hint);
      } else { 
        const wordArray = wordLengthMappings.find((x) => x.value === wordLength)
          ?.array!;

        const new_target_word =
          wordArray[Math.round(Math.random() * wordArray.length)];

        console.log("Not daily word: " + new_target_word);
        settargetWord(new_target_word);
      }
    }
  }, [wordLength, inProgress, props.mode]);

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

    const wordArray = wordLengthMappings.find((x) => x.value === wordLength)
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
      targetHint={targetHint || ""}
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
