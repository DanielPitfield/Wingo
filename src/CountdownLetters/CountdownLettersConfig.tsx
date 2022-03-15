import React, { useState } from "react";
import "../App.scss";
import { Page } from "../App";
import CountdownLetters from "./CountdownLetters";
import { words_four } from "../WordArrays/words_4";
import { words_five } from "../WordArrays/words_5";
import { words_six } from "../WordArrays/words_6";
import { words_seven } from "../WordArrays/words_7";
import { words_eight } from "../WordArrays/words_8";
import { words_nine } from "../WordArrays/words_9";
import { words_ten } from "../WordArrays/words_10";
import { words_eleven } from "../WordArrays/words_11";
import { SaveData } from "../SaveData";

interface Props {
  page: Page;
  timerConfig: { isTimed: false } | { isTimed: true; seconds: number };
  keyboard: boolean;
  defaultWordLength: number;
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
  { value: 11, array: words_eleven },
];

export function getWordSummary(
  word: string,
  targetWord: string,
  inDictionary: boolean
) {
  // Character and status array
  let defaultCharacterStatuses = word.split("").map((character, index) => ({
    character: character,
    status: getLetterStatus(character, index, targetWord, inDictionary),
  }));
  // Changing status because of repeated letters
  let finalCharacterStatuses = defaultCharacterStatuses.map((x, index) => {
    // If there is a green tile of a letter, don't show any orange tiles
    if (
      x.status === "contains" &&
      defaultCharacterStatuses.some(
        (y) => y.character === x.character && y.status === "correct"
      )
    ) {
      x.status = "not in word";
    }
    // Only ever show 1 orange tile of each letter
    if (
      x.status === "contains" &&
      defaultCharacterStatuses.findIndex(
        (y) => y.character === x.character && y.status === "contains"
      ) !== index
    ) {
      x.status = "not in word";
    }
    return x;
  });
  return finalCharacterStatuses;
}

export function getLetterStatus(
  letter: string,
  index: number,
  targetWord: string,
  inDictionary: boolean
): "incorrect" | "contains" | "correct" | "not set" | "not in word" {
  var status: "incorrect" | "contains" | "correct" | "not set" | "not in word";

  if (!inDictionary) {
    // Red
    status = "incorrect";
  } else if (targetWord?.[index]?.toUpperCase() === letter?.toUpperCase()) {
    // Green
    status = "correct";
  } else if (targetWord?.toUpperCase().includes(letter?.toUpperCase())) {
    // Yellow
    status = "contains";
  } else {
    // Grey
    status = "not in word";
  }

  return status;
}

const CountdownLettersConfig: React.FC<Props> = (props) => {
  const [guesses, setGuesses] = useState<string[]>([]);
  const [gameId, setGameId] = useState<string | null>(null);
  const [countdownWord, setCountdownWord] = useState("");
  const [currentWord, setCurrentWord] = useState("");
  const [inProgress, setinProgress] = useState(true);
  const [inDictionary, setinDictionary] = useState(true);
  const [wordLength, setwordLength] = useState(props.defaultWordLength);
  const [targetWord, settargetWord] = useState<string>();
  const [hasSubmitLetter, sethasSubmitLetter] = useState(false);

  const defaultLetterStatuses: {
    letter: string;
    status: "" | "contains" | "correct" | "not set" | "not in word";
  }[] = [
    { letter: "a", status: "" },
    { letter: "b", status: "" },
    { letter: "c", status: "" },
    { letter: "d", status: "" },
    { letter: "e", status: "" },
    { letter: "f", status: "" },
    { letter: "g", status: "" },
    { letter: "h", status: "" },
    { letter: "i", status: "" },
    { letter: "j", status: "" },
    { letter: "k", status: "" },
    { letter: "l", status: "" },
    { letter: "m", status: "" },
    { letter: "n", status: "" },
    { letter: "o", status: "" },
    { letter: "p", status: "" },
    { letter: "q", status: "" },
    { letter: "r", status: "" },
    { letter: "s", status: "" },
    { letter: "t", status: "" },
    { letter: "u", status: "" },
    { letter: "v", status: "" },
    { letter: "w", status: "" },
    { letter: "x", status: "" },
    { letter: "y", status: "" },
    { letter: "z", status: "" },
  ];

  const [letterStatuses, setletterStatuses] = useState<
    {
      letter: string;
      status: "" | "contains" | "correct" | "not set" | "not in word";
    }[]
  >(defaultLetterStatuses);

  const [seconds, setSeconds] = useState(
    props.timerConfig.isTimed ? props.timerConfig.seconds : 0
  );

  // Timer Setup
  React.useEffect(() => {
    if (!props.timerConfig.isTimed) {
      return;
    }

    /*
    // TODO: Make timer start as soon as countdownWord is complete
    if (countdownWord.length !== 9) {
      return;
    }
    */

    const timer = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      } else {
        setinDictionary(false);
        setinProgress(false);
      }
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [setSeconds, seconds, props.timerConfig.isTimed]);

  // Updates letter status (which is passed through to Keyboard to update button colours)
  React.useEffect(() => {
    const letterStatusesCopy = letterStatuses.slice();

    for (const guess of guesses) {
      for (let i = 0; i < guess.length; i++) {
        const letter = guess[i];

        const currentLetterStatus = letterStatusesCopy.find(
          (x) => x.letter.toLowerCase() === letter.toLowerCase()
        );
        const newStatus = getLetterStatus(letter, i, targetWord!, inDictionary);

        if (newStatus !== "incorrect") {
          currentLetterStatus!.status = newStatus;
        }
      }
    }

    setletterStatuses(letterStatusesCopy);
  }, [guesses]);

  function ResetGame() {
    setGuesses([]);
    setCurrentWord("");
    setinProgress(true);
    setinDictionary(true);
    setwordLength(wordLength);
    sethasSubmitLetter(false);
    setletterStatuses(defaultLetterStatuses);
    if (props.timerConfig.isTimed) {
      // Reset the timer if it is enabled in the game options
      setSeconds(props.timerConfig.seconds);
    }
  }

  function ContinueGame() {
    setCurrentWord("");
    setinProgress(true);
    setinDictionary(true);
    setwordLength(wordLength);
    sethasSubmitLetter(false);
    setletterStatuses(defaultLetterStatuses);
  }

  // TODO: Add game to SaveData history
  // TODO: Calculate gold reward

  function isWordValid(countdownWord: string, guessedWord: string) {
    if (!countdownWord || !guessedWord) {
      return false;
    }

    const validLetters = countdownWord.split("");
    const guessedWordLetters = guessedWord.split("");

    // For every letter in the guess
    return guessedWordLetters.every((attemptedLetter) => {
      // The letter must be one of the 9 letters allowed (within validLetters)
      const letterIndex = validLetters.indexOf(attemptedLetter);
      if (letterIndex > -1) {
        // Delete the letter from validLetters (so that the same letter can't be used more than once)
        validLetters.splice(letterIndex, 1);
        return true;
      } else {
        return false;
      }
    });
  }

  function getBestWords(countdownWord: string) {
    // Array to store best words that are found
    var best_words = [];

    // Start with bigger words first
    for (let i = props.defaultWordLength; i >= 4; i--) {
      // Get word array containng words of i size
      const wordArray = wordLengthMappings.find((x) => x.value === i)?.array!;
      // Safety check for wordArray
      if (wordArray) {
        // Check the entire array for any valid words
        for (let j = 0; j < wordArray.length; j++) {
          const word = wordArray[j];
          // Safety check for word
          if (word) {
            if (isWordValid(countdownWord, word)) {
              // Push to array if word is valid
              best_words.push(word);
            }
          }
        }
      }
    }

    return best_words;
  }

  function onEnter() {
    // Pressing Enter to Continue or Restart
    if (!inProgress) {
      if (targetWord?.toUpperCase() === currentWord.toUpperCase()) {
        ContinueGame();
      } else {
        ResetGame();
      }
      return;
    }

    setinDictionary(true);

    let outcome: "success" | "failure" | "in-progress" = "in-progress";

    /*
    Guesses don't have to be full length in Countdown Letters
    Also, a time limit is used not a limit on the number of guesses
    */

    // The 9 vowels and consonants available have not all been picked
    if (countdownWord.length !== props.defaultWordLength) {
      return;
    }

    // Guessed word is not 2 characters or longer
    if (currentWord.length < 2) {
      setinDictionary(false);
      setinProgress(false);
      outcome = "failure";
      return;
    }

    const wordArray = wordLengthMappings.find(
      (x) => x.value === currentWord.length
    )?.array!;

    // Accepted word (known word in dictionary)
    const wordInDictionary = wordArray.includes(currentWord.toLowerCase());
    // Word can be made with available letters
    const isValidWord = isWordValid(countdownWord, currentWord);

    console.log(getBestWords(countdownWord));

    if (wordInDictionary && isValidWord) {
      // Set the target word to the guessed word so all letters show as green
      settargetWord(currentWord);
      setinProgress(false);
      outcome = "success";
    } else {
      setinDictionary(false);
      setinProgress(false);
      outcome = "failure";
    }

    setGuesses(guesses.concat(currentWord)); // Add word to guesses

    // TODO: Continue immediately if 'hard' mode where player is NOT told whether word is valid when as it is entered
    ContinueGame();

    // TODO: Add completed round to game history
  }

  function onSubmitCountdownLetter(letter: string) {
    if (countdownWord.length < wordLength && inProgress) {
      setCountdownWord(countdownWord + letter); // Append chosen letter to countdownWord
      sethasSubmitLetter(true);
    }
  }

  function onSubmitLetter(letter: string) {
    // Additional condition of all 9 letters having been selected
    if (
      currentWord.length < wordLength &&
      countdownWord.length === 9 &&
      inProgress
    ) {
      setCurrentWord(currentWord + letter); // Append chosen letter to currentWord
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
    <CountdownLetters
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
      guesses={guesses}
      currentWord={currentWord}
      countdownWord={countdownWord}
      inProgress={inProgress}
      inDictionary={inDictionary}
      hasSubmitLetter={hasSubmitLetter}
      targetWord={targetWord || ""}
      letterStatuses={letterStatuses}
      onEnter={onEnter}
      onSubmitCountdownLetter={onSubmitCountdownLetter}
      onSubmitLetter={onSubmitLetter}
      onBackspace={onBackspace}
      ResetGame={ResetGame}
      ContinueGame={ContinueGame}
      setPage={props.setPage}
    ></CountdownLetters>
  );
};

export default CountdownLettersConfig;
