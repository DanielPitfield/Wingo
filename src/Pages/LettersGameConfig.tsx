import React, { useState } from "react";
import { PageName } from "../PageNames";
import LettersGame from "./LettersGame";
import { Theme } from "../Data/Themes";
import { SaveData, SettingsData } from "../Data/SaveData";
import { wordLengthMappingsGuessable, wordLengthMappingsTargets } from "../Data/DefaultGamemodeSettings";

export interface LettersGameConfigProps {
  campaignConfig:
    | {
        isCampaignLevel: true;
        // What score must be achieved to pass the campaign level?
        targetScore: number;
      }
    | { isCampaignLevel: false };

  guesses?: string[];
  // Define the letters to choose from (player won't randomly select letters)
  lettersGameSelectionWord?: string;

  gamemodeSettings?: {
    // The number of letters (that make up the selection used to make a word)
    defaultNumLetters?: number;
    timerConfig?: { isTimed: true; seconds: number } | { isTimed: false };
  };

  gameshowScore?: number;
}

interface Props extends LettersGameConfigProps {
  page: PageName;
  theme: Theme;
  settings: SettingsData;
  setPage: (page: PageName) => void;
  setTheme: (theme: Theme) => void;
  addGold: (gold: number) => void;
  onComplete: (wasCorrect: boolean) => void;
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
  const [currentWord, setCurrentWord] = useState("");
  const [inProgress, setInProgress] = useState(true);
  const [inDictionary, setInDictionary] = useState(true);
  const [targetWord, setTargetWord] = useState<string>();
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

  const defaultLetterTileStatuses: {
    letter: string | null;
    picked: boolean;
  }[] = Array.from({ length: gamemodeSettings.numLetters }).map((_) => ({
    letter: null,
    picked: false,
  }));

  const [letterTileStatuses, setLetterTileStatuses] = useState<
    {
      letter: string | null;
      picked: boolean;
    }[]
  >(defaultLetterTileStatuses);

  // Timer Setup
  React.useEffect(() => {
    if (!gamemodeSettings.timerConfig.isTimed) {
      return;
    }

    if (
      letterTileStatuses.filter((letterStatus) => letterStatus.letter !== null).length !== gamemodeSettings.numLetters
    ) {
      return;
    }

    const timer = setInterval(() => {
      if (remainingSeconds > 0) {
        setRemainingSeconds(remainingSeconds - 1);
      } else {
        setInProgress(false);
      }
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [setRemainingSeconds, remainingSeconds, gamemodeSettings.timerConfig.isTimed]);

  // Reset game after change of settings (stops cheating by changing settings partway through a game)
  React.useEffect(() => {
    if (props.page === "campaign/area/level" || props.gameshowScore !== undefined) {
      return;
    }

    ResetGame();

    // Save the latest gamemode settings for this mode
    SaveData.setLettersGameConfigGamemodeSettings(gamemodeSettings);
  }, [gamemodeSettings]);

  function ResetGame() {
    if (!inProgress) {
      const longestWord = guesses.reduce(
        (currentWord, nextWord) => (currentWord.length > nextWord.length ? currentWord : nextWord),
        ""
      );
      // The score is just the length (number of letters) in the longest word
      const score = longestWord.length ?? 0;

      // Achieved target score if a campaign level, otherwise just any length word was guessed
      const wasCorrect = props.campaignConfig.isCampaignLevel
        ? score >= Math.min(props.campaignConfig.targetScore, gamemodeSettings.numLetters)
        : score > 0;

      if (props.gameshowScore === undefined) {
        props.onComplete(wasCorrect);
      } else {
        props.onCompleteGameshowRound?.(wasCorrect, longestWord, "", score);
      }
    }

    setGuesses([]);
    setLetterTileStatuses(defaultLetterTileStatuses);
    setCurrentWord("");
    setTargetWord("");
    setInProgress(true);
    setInDictionary(true);
    sethasSubmitLetter(false);

    if (gamemodeSettings.timerConfig.isTimed) {
      // Reset the timer if it is enabled in the game options
      setRemainingSeconds(gamemodeSettings.timerConfig.seconds);
    }
  }

  function ContinueGame() {
    setInProgress(true);
    setInDictionary(false);
    setCurrentWord("");
    setInProgress(true);
    setInDictionary(true);
    sethasSubmitLetter(false);
  }

  function onEnter() {
    if (!inProgress) {
      return;
    }

    // The vowels and consonants available have not all been picked
    if (
      letterTileStatuses.filter((letterStatus) => letterStatus.letter !== null).length !== gamemodeSettings.numLetters
    ) {
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

    // Is the word an accepted word (known word in dictionary)?
    const isWordInDictionary = wordArray?.includes(currentWord.toLowerCase());

    // Can the word be made with the available letters?
    const letterSelectionWord = letterTileStatuses
      .filter((letterStatus) => letterStatus.letter !== null)
      .map((letterStatus) => letterStatus.letter)
      .join("");
    const isValidWord = isLettersGameGuessValid(currentWord, letterSelectionWord);

    // Check the validity of the word for the player
    if (isWordInDictionary && isValidWord) {
      setInDictionary(true);
      // Set the target word to the guessed word so all letters show as green
      setTargetWord(currentWord);
      // Only add word to guesses if valid
      setGuesses(guesses.concat(currentWord)); // Add word to guesses
    } else {
      setInDictionary(false);
    }

    // Stop progress so the status of tiles shows briefly
    setInProgress(false);

    // Wait half a second to show validity of word, then continue
    setTimeout(() => {
      ContinueGame();
    }, 500);
  }

  function onSubmitLettersGameLetter(letter: string) {
    if (
      letterTileStatuses.filter((letterStatus) => letterStatus.letter !== null).length < gamemodeSettings.numLetters &&
      inProgress
    ) {
      // Find the index of the first status without a letter
      const freeSlotIndex = letterTileStatuses.findIndex((letterStatus) => letterStatus.letter === null);
      if (freeSlotIndex === -1) {
        return;
      }

      let newLetterTileStatuses = letterTileStatuses.slice();
      // Put in the letter in this free slot
      newLetterTileStatuses[freeSlotIndex] = {
        letter: letter,
        picked: false,
      };
      setLetterTileStatuses(newLetterTileStatuses);
    }
  }

  function onSubmitLettersGameSelectionWord(word: string) {
    if (!inProgress) {
      return;
    }

    if (word.length !== gamemodeSettings.numLetters) {
      return;
    }

    // A vowel or consonant has already been picked
    if (letterTileStatuses.filter((letterStatus) => letterStatus.letter !== null).length !== 0) {
      return;
    }

    // Create a letterStatus with each letter of word with the picked flag as false
    const newLetterTileStatuses = word.split("").map((letter) => {
      return { letter: letter, picked: false };
    });

    setLetterTileStatuses(newLetterTileStatuses);
  }

  function onSubmitLetter(letter: string | null) {
    if (!inProgress) {
      return;
    }

    if (letter === null) {
      return;
    }

    // Still more letters need to be chosen for selection
    if (
      letterTileStatuses.filter((letterStatus) => letterStatus.letter !== null).length !== gamemodeSettings.numLetters
    ) {
      return;
    }

    // The current word is already as long as the number of letters in the selection
    if (currentWord.length >= gamemodeSettings.numLetters) {
      return;
    }

    // Find the first index in letterTileStatuses (where the letter is the letter clicked and the picked flag is false)
    const currentLetterIndex = letterTileStatuses.findIndex(
      (letterStatus) => !letterStatus.picked && letterStatus.letter === letter
    );

    // The letter that was clicked is not present in the tileStatuses
    if (currentLetterIndex === -1) {
      return;
    }

    // Append chosen letter to currentWord
    setCurrentWord(currentWord + letter);
    sethasSubmitLetter(true);
    
    // Keep track this letter has now been picked
    // TODO: Use indexes, two of same letter, the first occurence can be clicked twice
    let newLetterTileStatuses = letterTileStatuses.slice();
    newLetterTileStatuses[currentLetterIndex] = {
      letter: letter,
      picked: true,
    }

    setLetterTileStatuses(newLetterTileStatuses);
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
      campaignConfig={props.campaignConfig}
      gamemodeSettings={gamemodeSettings}
      remainingSeconds={remainingSeconds}
      guesses={guesses}
      currentWord={currentWord}
      letterTileStatuses={letterTileStatuses}
      inProgress={inProgress}
      inDictionary={inDictionary}
      hasSubmitLetter={hasSubmitLetter}
      targetWord={targetWord || ""}
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
