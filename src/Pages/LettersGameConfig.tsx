import React, { useState } from "react";
import { PageName } from "../PageNames";
import LettersGame from "./LettersGame";
import { Theme } from "../Data/Themes";
import { SaveData, SettingsData } from "../Data/SaveData";
import { wordLengthMappingsGuessable, wordLengthMappingsTargets } from "../Data/DefaultGamemodeSettings";

export interface LettersGameConfigProps {
  guesses?: string[];
  lettersGameSelectionWord?: string;

  gamemodeSettings?: {
    // The number of letters (that make up the selection used to make a word)
    defaultNumLetters?: number;
    timerConfig?: { isTimed: true; seconds: number } | { isTimed: false };
  };
  
  gameshowScore?: number;
}

interface Props extends LettersGameConfigProps {
  isCampaignLevel: boolean;
  page: PageName;
  theme: Theme;
  settings: SettingsData;
  setPage: (page: PageName) => void;
  setTheme: (theme: Theme) => void;
  addGold: (gold: number) => void;
  onComplete: (wasCorrect: boolean, guess: string, correctAnswer: string, score: number | null) => void;
  onCompleteGameshowRound?: (wasCorrect: boolean, guess: string, correctAnswer: string, score: number | null) => void;
}

export function isLettersGameGuessValid(guessedWord: string, lettersGameSelectionWord: string) {
  if (!lettersGameSelectionWord || !guessedWord) {
    return false;
  }

  const validLetters = lettersGameSelectionWord.split("");
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

const LettersGameConfig: React.FC<Props> = (props) => {
  const DEFAULT_NUM_LETTERS = 9;
  const DEFAULT_TIMER_VALUE = 30;

  const [guesses, setGuesses] = useState<string[]>([]);
  const [lettersGameSelectionWord, setLettersGameSelectionWord] = useState("");
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

    if (lettersGameSelectionWord.length !== gamemodeSettings.numLetters) {
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
  }, [setRemainingSeconds, remainingSeconds, gamemodeSettings.timerConfig.isTimed, lettersGameSelectionWord]);

  // Reset game after change of settings (stops cheating by changing settings partway through a game)
  React.useEffect(() => {
    if (props.page === "campaign/area/level" || props.gameshowScore !== undefined) {
      return;
    }

    // TODO: Function returns before reaching here if part of gameshow, so none of these parameters are needed
    ResetGame(false, "", "", 0);

    // Save the latest gamemode settings for this mode
    SaveData.setLettersGameConfigGamemodeSettings(gamemodeSettings);
  }, [gamemodeSettings]);

  // TODO: Better way to callback the outcome/status of a completed letters round for Letters Numbers Gameshow?
  function ResetGame(wasCorrect: boolean, guess: string, correctAnswer: string, score: number | null) {
    // Callback of the score achieved (used for Letters Numbers Gameshow)
    props.onCompleteGameshowRound?.(wasCorrect, guess, correctAnswer, score);

    setGuesses([]);
    setLettersGameSelectionWord("");
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
    setinProgress(true);
    setinDictionary(false);
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
    if (lettersGameSelectionWord.length !== gamemodeSettings.numLetters) {
      return;
    }

    // Nothing entered yet
    if (!hasSubmitLetter) {
      return;
    }

    const firstWordArray: string[] =
      wordLengthMappingsGuessable.find((x) => x.value === currentWord.length)?.array ?? [];
    const secondTargetArray: string[] =
      wordLengthMappingsTargets.find((x) => x.value === currentWord.length)?.array ?? [];

    // A guess can be from etiher guessable or target word arrays (just checking it is an actual word)
    const wordArray: string[] = firstWordArray.concat(secondTargetArray);

    // Accepted word (known word in dictionary)
    const wordInDictionary = wordArray?.includes(currentWord.toLowerCase());
    // Word can be made with available letters
    const isValidWord = isLettersGameGuessValid(currentWord, lettersGameSelectionWord);

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

    // Stop progress so the status of tiles shows briefly
    setinProgress(false);

    // Wait half a second to show validity of word, then continue
    setTimeout(() => {
      ContinueGame();
    }, 500);
  }

  function onSubmitLettersGameLetter(letter: string) {
    if (lettersGameSelectionWord.length < gamemodeSettings.numLetters && inProgress) {
      setLettersGameSelectionWord(lettersGameSelectionWord + letter); // Append chosen letter to lettersGameSelectionWord
    }
  }

  function onSubmitLettersGameSelectionWord(word: string) {
    if (lettersGameSelectionWord.length === 0 && inProgress) {
      setLettersGameSelectionWord(word);
    }
  }

  function onSubmitLetter(letter: string) {
    // Additional condition of all letters having been selected
    if (
      currentWord.length < gamemodeSettings.numLetters &&
      lettersGameSelectionWord.length === gamemodeSettings.numLetters &&
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
    <LettersGame
      isCampaignLevel={props.page === "campaign/area/level"}
      gamemodeSettings={gamemodeSettings}
      remainingSeconds={remainingSeconds}
      guesses={guesses}
      currentWord={currentWord}
      lettersGameSelectionWord={lettersGameSelectionWord}
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
      onSubmitLettersGameLetter={onSubmitLettersGameLetter}
      onSubmitLettersGameSelectionWord={onSubmitLettersGameSelectionWord}
      onSubmitLetter={onSubmitLetter}
      onBackspace={onBackspace}
      updateGamemodeSettings={updateGamemodeSettings}
      updateRemainingSeconds={updateRemainingSeconds}
      ResetGame={ResetGame}
      ContinueGame={ContinueGame}
      setPage={props.setPage}
      addGold={props.addGold}
      gameshowScore={props.gameshowScore}
    ></LettersGame>
  );
};

export default LettersGameConfig;
