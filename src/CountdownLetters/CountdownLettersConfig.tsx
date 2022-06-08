import React, { useState } from "react";
import { Page } from "../App";
import CountdownLetters from "./CountdownLetters";
import { wordLengthMappingsGuessable } from "../WordleConfig";
import { Theme } from "../Themes";
import { SettingsData } from "../SaveData";

export interface CountdownLettersConfigProps {
  mode: "countdown_letters_casual" | "countdown_letters_realistic";
  gamemodeSettings?: {
    wordLength?: boolean;
    firstLetter?: boolean;
    showHint?: boolean;
    timer?: { isTimed: true; seconds: number } | { isTimed: false };
  };
  defaultWordLength: number;
  guesses?: string[];
  countdownWord?: string;
}

interface Props extends CountdownLettersConfigProps {
  page: Page;
  defaultWordLength: number;
  theme: Theme;
  settings: SettingsData;
  setTheme: (theme: Theme) => void;
  setPage: (page: Page) => void;
  addGold: (gold: number) => void;
  onComplete?: (wasCorrect: boolean, answer: string, targetAnswer: string, score: number | null) => void;
  gameshowScore?: number;
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

  // Gamemode settings
  const [isTimerEnabled, setIsTimerEnabled] = useState(props.gamemodeSettings?.timer?.isTimed === true ?? false);
  const DEFAULT_TIMER_VALUE = 30;
  const [remainingSeconds, setRemainingSeconds] = useState(
    props.gamemodeSettings?.timer?.isTimed === true ? props.gamemodeSettings?.timer.seconds : DEFAULT_TIMER_VALUE
  );
  const [totalSeconds, setTotalSeconds] = useState(
    props.gamemodeSettings?.timer?.isTimed === true ? props.gamemodeSettings?.timer.seconds : DEFAULT_TIMER_VALUE
  );
  
  // Generate the elements to configure the gamemode settings
  const gamemodeSettings = generateSettings();

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

  // Timer Setup
  React.useEffect(() => {
    if (!isTimerEnabled) {
      return;
    }

    if (countdownWord.length !== 9) {
      return;
    }

    const timer = setInterval(() => {
      if (remainingSeconds > 0) {
        setRemainingSeconds(remainingSeconds - 1);
      } else {
        sethasTimerEnded(true);
        setinProgress(false);
      }
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [setRemainingSeconds, remainingSeconds, isTimerEnabled, countdownWord]);

  function ResetGame(wasCorrect: boolean, answer: string, targetAnswer: string, score: number | null) {
    // Callback of the score achieved (used for Countdown Gameshow)
    props.onComplete?.(wasCorrect, answer, targetAnswer, score);
    setGuesses([]);
    setCountdownWord("");
    setCurrentWord("");
    settargetWord("");
    setinProgress(true);
    sethasTimerEnded(false);
    setinDictionary(true);
    setwordLength(props.defaultWordLength);
    sethasSubmitLetter(false);
    setletterStatuses(defaultLetterStatuses);
    if (isTimerEnabled) {
      // Reset the timer if it is enabled in the game options
      setRemainingSeconds(totalSeconds);
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

    if (props.mode === "countdown_letters_realistic") {
      // Don't need to do any evaluation of the guess and just add to guesses regardless
      setGuesses(guesses.concat(currentWord));
      ContinueGame();
      return;
    }

    // Stop progress for evalution for Casual game mode type
    setinProgress(false);

    const wordArray = wordLengthMappingsGuessable.find((x) => x.value === currentWord.length)?.array;

    // Accepted word (known word in dictionary)
    const wordInDictionary = wordArray?.includes(currentWord.toLowerCase());
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

  function generateSettings(): React.ReactNode {
    let settings;

    settings = (
      <>
        {/* TODO: QOL: Configure number of letters (wordLength) */
        /*props.gamemodeSettings?.wordLength !== undefined && (
          <label>
            <input
              type="number"
              value={wordLength}
              min={props.mode === "puzzle" ? 9 : 4}
              max={11}
              onChange={(e) => setWordLength(e.target.valueAsNumber)}
            ></input>
            Word Length
          </label>
        )*/}
        {props.gamemodeSettings?.timer !== undefined && (
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
        )}
      </>
    );

    return settings;
  }

  return (
    <CountdownLetters
      mode={props.mode}
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
      guesses={guesses}
      currentWord={currentWord}
      countdownWord={countdownWord}
      inProgress={inProgress}
      hasTimerEnded={hasTimerEnded}
      inDictionary={inDictionary}
      hasSubmitLetter={hasSubmitLetter}
      targetWord={targetWord || ""}
      letterStatuses={letterStatuses}
      theme={props.theme}
      settings={props.settings}
      setTheme={props.setTheme}
      onEnter={onEnter}
      onSubmitCountdownLetter={onSubmitCountdownLetter}
      onSubmitCountdownWord={onSubmitCountdownWord}
      onSubmitLetter={onSubmitLetter}
      onBackspace={onBackspace}
      ResetGame={ResetGame}
      ContinueGame={ContinueGame}
      setPage={props.setPage}
      addGold={props.addGold}
      gameshowScore={props.gameshowScore}
    ></CountdownLetters>
  );
};

export default CountdownLettersConfig;
