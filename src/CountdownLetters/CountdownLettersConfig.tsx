import React, { useState } from "react";
import "../App.scss";
import { Page } from "../App";
import CountdownLetters from "./CountdownLetters";
import { wordLengthMappingsGuessable } from "../WordleConfig";

interface Props {
  page: Page;
  mode: "casual" | "realistic";
  timerConfig: { isTimed: false } | { isTimed: true; seconds: number };
  keyboard: boolean;
  defaultWordLength: number;
  setPage: (page: Page) => void;
}

export function getWordSummary(word: string, targetWord: string, inDictionary: boolean) {
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
      defaultCharacterStatuses.some((y) => y.character === x.character && y.status === "correct")
    ) {
      x.status = "not in word";
    }
    // Only ever show 1 orange tile of each letter
    if (
      x.status === "contains" &&
      defaultCharacterStatuses.findIndex((y) => y.character === x.character && y.status === "contains") !== index
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

export function isWordValid(countdownWord: string, guessedWord: string) {
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

const CountdownLettersConfig: React.FC<Props> = (props) => {
  const [guesses, setGuesses] = useState<string[]>([]);
  const [countdownWord, setCountdownWord] = useState("");
  const [currentWord, setCurrentWord] = useState("");
  const [inProgress, setinProgress] = useState(true);
  const [hasTimerEnded, sethasTimerEnded] = useState(false);
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

  const [seconds, setSeconds] = useState(props.timerConfig.isTimed ? props.timerConfig.seconds : 0);

  // Timer Setup
  React.useEffect(() => {
    if (!props.timerConfig.isTimed) {
      return;
    }

    if (countdownWord.length !== 9) {
      return;
    }

    const timer = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      } else {
        sethasTimerEnded(true);
        setinProgress(false);
      }
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [setSeconds, seconds, props.timerConfig.isTimed, countdownWord]);

  // Updates letter status (which is passed through to Keyboard to update button colours)
  React.useEffect(() => {
    const letterStatusesCopy = letterStatuses.slice();

    for (const guess of guesses) {
      for (let i = 0; i < guess.length; i++) {
        const letter = guess[i];

        const currentLetterStatus = letterStatusesCopy.find((x) => x.letter.toLowerCase() === letter.toLowerCase());
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
    setCountdownWord("");
    setCurrentWord("");
    settargetWord("");
    setinProgress(true);
    sethasTimerEnded(false)
    setinDictionary(true);
    setwordLength(props.defaultWordLength);
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

  function onEnter() {
    if (!inProgress) {
      return;
    }

    // The 9 vowels and consonants available have not all been picked
    if (countdownWord.length !== props.defaultWordLength) {
      return;
    }

    // Nothing entered yet
    if (!hasSubmitLetter) {
      return;
    }

    if (props.mode === "realistic") {
      // Don't need to do any evaluation of the guess and just add to guesses regardless
      setGuesses(guesses.concat(currentWord));
      ContinueGame();
      return;
    }

    // Stop progress for evalution for Casual game mode type
    setinProgress(false);

    const wordArray = wordLengthMappingsGuessable.find((x) => x.value === currentWord.length)?.array!;

    // Accepted word (known word in dictionary)
    const wordInDictionary = wordArray.includes(currentWord.toLowerCase());
    // Word can be made with available letters
    const isValidWord = isWordValid(countdownWord, currentWord);

    // Check the validity of the word for the player
    if (wordInDictionary && isValidWord) {
      setinDictionary(true);
      // Set the target word to the guessed word so all letters show as green
      settargetWord(currentWord);
      // Only add word to guesses if valid
      setGuesses(guesses.concat(currentWord)); // Add word to guesses
    } else {
      setinDictionary(false);
    }

    // Wait half a second to show validity of word, then continue
    setTimeout(() => {
      ContinueGame();
    }, 500);

    // TODO: Add completed round to game history
  }

  function onSubmitCountdownLetter(letter: string) {
    if (countdownWord.length < wordLength && inProgress) {
      setCountdownWord(countdownWord + letter); // Append chosen letter to countdownWord
    }
  }

  function onSubmitCountdownWord(word: string) {
    if (countdownWord.length === 0 && inProgress) {
      setCountdownWord(word);
    }
  }

  function onSubmitLetter(letter: string) {
    // Additional condition of all 9 letters having been selected
    if (currentWord.length < wordLength && countdownWord.length === 9 && inProgress) {
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
      mode={props.mode}
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
      hasTimerEnded={hasTimerEnded}
      inDictionary={inDictionary}
      hasSubmitLetter={hasSubmitLetter}
      targetWord={targetWord || ""}
      letterStatuses={letterStatuses}
      onEnter={onEnter}
      onSubmitCountdownLetter={onSubmitCountdownLetter}
      onSubmitCountdownWord={onSubmitCountdownWord}
      onSubmitLetter={onSubmitLetter}
      onBackspace={onBackspace}
      ResetGame={ResetGame}
      ContinueGame={ContinueGame}
      setPage={props.setPage}
    ></CountdownLetters>
  );
};

export default CountdownLettersConfig;
