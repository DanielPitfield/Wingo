import React, { useState } from "react";
import { Page } from "../App";
import CountdownLetters from "./CountdownLetters";
import { Theme } from "../Themes";
import { SaveData, SettingsData } from "../SaveData";
import { wordLengthMappingsGuessable } from "../defaultGamemodeSettings";

export interface CountdownLettersConfigProps {
  guesses?: string[];
  countdownWord?: string;
  gamemodeSettings?: {
    // The number of letters (that make up the selection used to make a word)
    defaultNumLetters?: number;
    timerConfig?: { isTimed: true; seconds: number } | { isTimed: false };
  };
  gameshowScore?: number;
}

interface Props extends CountdownLettersConfigProps {
  page: Page;
  theme: Theme;
  settings: SettingsData;
  setTheme: (theme: Theme) => void;
  setPage: (page: Page) => void;
  addGold: (gold: number) => void;
  onComplete?: (wasCorrect: boolean, answer: string, targetAnswer: string, score: number | null) => void;
}

export function isWordValid(countdownWord: string, guessedWord: string) {
  if (!countdownWord || !guessedWord) {
    return false;
  }

  const validLetters = countdownWord.split("");
  const guessedWordLetters = guessedWord.split("");

  // For every letter in the guess
  return guessedWordLetters.every((attemptedLetter) => {
    // The letter must be one of the letters allowed (within validLetters)
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
  const DEFAULT_NUM_LETTERS = 9;
  const DEFAULT_TIMER_VALUE = 30;

  const [guesses, setGuesses] = useState<string[]>([]);
  const [countdownWord, setCountdownWord] = useState("");
  const [currentWord, setCurrentWord] = useState("");
  const [inProgress, setinProgress] = useState(true);
  const [inDictionary, setinDictionary] = useState(true);
  const [targetWord, settargetWord] = useState<string>();
  const [hasSubmitLetter, sethasSubmitLetter] = useState(false);

  const defaultGamemodeSettings = {
    numLetters: props.gamemodeSettings?.defaultNumLetters ?? DEFAULT_NUM_LETTERS,
    timerConfig: props.gamemodeSettings?.timerConfig ?? { isTimed: true, seconds: DEFAULT_TIMER_VALUE },
  };

  const [gamemodeSettings, setGamemodeSettings] = useState<{
    numLetters: number;
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  }>(defaultGamemodeSettings);

  const [remainingSeconds, setRemainingSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig.seconds
      : DEFAULT_TIMER_VALUE
  );

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
    if (!gamemodeSettings.timerConfig.isTimed) {
      return;
    }

    if (countdownWord.length !== gamemodeSettings.numLetters) {
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
  }, [setRemainingSeconds, remainingSeconds, gamemodeSettings.timerConfig.isTimed, countdownWord]);

  // Reset game after change of settings (stops cheating by changing settings partway through a game)
  React.useEffect(() => {
    if (props.page === "campaign/area/level" || props.gameshowScore !== undefined) {
      return;
    }

    // TODO: Function returns above if part of gameshow, so none of these parameters are needed
    ResetGame(false, "", "", 0);

    // Save the latest gamemode settings for this mode
    SaveData.setCountdownLettersConfigGamemodeSettings(gamemodeSettings);
  }, [gamemodeSettings]);

  // TODO: Better way to callback the outcome/status of a completed letters round for CountdownGameshow?
  function ResetGame(wasCorrect: boolean, answer: string, targetAnswer: string, score: number | null) {
    // Callback of the score achieved (used for Countdown Gameshow)
    props.onComplete?.(wasCorrect, answer, targetAnswer, score);
    setGuesses([]);
    setCountdownWord("");
    setCurrentWord("");
    settargetWord("");
    setinProgress(true);
    setinDictionary(true);
    sethasSubmitLetter(false);
    setletterStatuses(defaultLetterStatuses);
    if (gamemodeSettings.timerConfig.isTimed) {
      // Reset the timer if it is enabled in the game options
      setRemainingSeconds(gamemodeSettings.timerConfig.seconds);
    }
  }

  function ContinueGame() {
    setCurrentWord("");
    setinProgress(true);
    setinDictionary(true);
    sethasSubmitLetter(false);
    setletterStatuses(defaultLetterStatuses);
  }

  function onEnter() {
    if (!inProgress) {
      return;
    }

    // The vowels and consonants available have not all been picked
    if (countdownWord.length !== gamemodeSettings.numLetters) {
      return;
    }

    // Nothing entered yet
    if (!hasSubmitLetter) {
      return;
    }

    // Stop progress so the status of tiles shows briefly
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
    if (countdownWord.length < gamemodeSettings.numLetters && inProgress) {
      setCountdownWord(countdownWord + letter); // Append chosen letter to countdownWord
    }
  }

  function onSubmitCountdownWord(word: string) {
    if (countdownWord.length === 0 && inProgress) {
      setCountdownWord(word);
    }
  }

  function onSubmitLetter(letter: string) {
    // Additional condition of all letters having been selected
    if (
      currentWord.length < gamemodeSettings.numLetters &&
      countdownWord.length === gamemodeSettings.numLetters &&
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

  function updateGamemodeSettings(newGamemodeSettings: {
    numLetters: number;
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  }) {
    setGamemodeSettings(newGamemodeSettings);
  }

  function updateRemainingSeconds(newSeconds: number) {
    setRemainingSeconds(newSeconds);
  }

  return (
    <CountdownLetters
      isCampaignLevel={props.page === "campaign/area/level"}
      gamemodeSettings={gamemodeSettings}
      remainingSeconds={remainingSeconds}
      guesses={guesses}
      currentWord={currentWord}
      countdownWord={countdownWord}
      inProgress={inProgress}
      inDictionary={inDictionary}
      hasSubmitLetter={hasSubmitLetter}
      targetWord={targetWord || ""}
      letterStatuses={letterStatuses}
      page={props.page}
      theme={props.theme}
      settings={props.settings}
      setTheme={props.setTheme}
      onEnter={onEnter}
      onSubmitCountdownLetter={onSubmitCountdownLetter}
      onSubmitCountdownWord={onSubmitCountdownWord}
      onSubmitLetter={onSubmitLetter}
      onBackspace={onBackspace}
      updateGamemodeSettings={updateGamemodeSettings}
      updateRemainingSeconds={updateRemainingSeconds}
      ResetGame={ResetGame}
      ContinueGame={ContinueGame}
      setPage={props.setPage}
      addGold={props.addGold}
      gameshowScore={props.gameshowScore}
    ></CountdownLetters>
  );
};

export default CountdownLettersConfig;
