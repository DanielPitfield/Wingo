import React, { useState } from "react";
import { PagePath } from "../Data/PageNames";
import LettersGame from "./LettersGame";
import { Theme } from "../Data/Themes";

import { getAllWordsOfLength } from "../Helpers/getWordsOfLength";
import { getGamemodeDefaultTimerValue } from "../Helpers/getGamemodeDefaultTimerValue";
import { isLettersGameGuessValid } from "../Helpers/isLettersGameGuessValid";
import { useLocation } from "react-router";
import { isCampaignLevelPath } from "../Helpers/CampaignPathChecks";
import { SettingsData } from "../Data/SaveData/Settings";
import { setMostRecentLettersGameConfigGamemodeSettings } from "../Data/SaveData/MostRecentGamemodeSettings";
import { useCountdown } from "usehooks-ts";
import { useCorrectChime, useFailureChime, useLightPingChime, useClickChime } from "../Data/Sounds";

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

  gamemodeSettings: {
    // The number of letters (that make up the selection used to make a word)
    numLetters: number;
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  };
}

interface Props extends LettersGameConfigProps {
  theme: Theme;
  settings: SettingsData;
  setTheme: (theme: Theme) => void;
  addGold: (gold: number) => void;
  onComplete: (wasCorrect: boolean) => void;
}

export type LettersGameTileStatus = {
  letter: string | null;
  picked: boolean;
};

const LettersGameConfig = (props: Props) => {
  const location = useLocation().pathname as PagePath;

  const [gamemodeSettings, setGamemodeSettings] = useState<LettersGameConfigProps["gamemodeSettings"]>(
    props.gamemodeSettings
  );

  const [inProgress, setInProgress] = useState(true);

  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState("");
  const [targetWord, setTargetWord] = useState<string>();

  const [inDictionary, setInDictionary] = useState(true);
  const [hasLetterSelectionFinished, setHasLetterSelectionFinished] = useState(false);

  const DEFAULT_LETTER_TILE_STATUSES: LettersGameTileStatus[] = Array(gamemodeSettings.numLetters)
    .fill("")
    .map((_) => ({
      letter: null,
      picked: false,
    }));

  const [letterTileStatuses, setLetterTileStatuses] = useState<LettersGameTileStatus[]>(DEFAULT_LETTER_TILE_STATUSES);

  // The starting/total time of the timer
  const [totalSeconds, setTotalSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig?.seconds
      : getGamemodeDefaultTimerValue(location)
  );

  // How many seconds left on the timer?
  const [remainingSeconds, { startCountdown, stopCountdown, resetCountdown }] = useCountdown({
    countStart: totalSeconds,
    intervalMs: 1000,
  });

  // Sounds
  const [playCorrectChimeSoundEffect] = useCorrectChime(props.settings);
  const [playFailureChimeSoundEffect] = useFailureChime(props.settings);
  const [playLightPingSoundEffect] = useLightPingChime(props.settings);
  const [playClickSoundEffect] = useClickChime(props.settings);

  // How many letters have been selected so far?
  const getNumSelectedLetters = (): number => {
    return letterTileStatuses.filter((letterStatus) => letterStatus.letter !== null).length;
  };

  // Start timer (any time the toggle is enabled or the totalSeconds is changed)
  React.useEffect(() => {
    if (!inProgress) {
      return;
    }

    if (!gamemodeSettings.timerConfig.isTimed) {
      return;
    }

    if (!hasLetterSelectionFinished) {
      return;
    }

    startCountdown();
  }, [inProgress, gamemodeSettings.timerConfig.isTimed, hasLetterSelectionFinished, totalSeconds]);

  // Check remaining seconds on timer
  React.useEffect(() => {
    if (!inProgress) {
      return;
    }

    if (!gamemodeSettings.timerConfig.isTimed) {
      return;
    }

    if (!hasLetterSelectionFinished) {
      return;
    }

    if (remainingSeconds <= 0) {
      stopCountdown();
      playFailureChimeSoundEffect();
      setInProgress(false);
      setCurrentWord("");
    }
  }, [inProgress, gamemodeSettings.timerConfig.isTimed, hasLetterSelectionFinished, remainingSeconds]);

  // Reset game after change of settings (stops cheating by changing settings partway through a game)
  React.useEffect(() => {
    if (isCampaignLevelPath(location)) {
      return;
    }

    ResetGame();

    // Save the latest gamemode settings for this mode
    setMostRecentLettersGameConfigGamemodeSettings(gamemodeSettings);
  }, [gamemodeSettings]);

  React.useEffect(() => {
    // Selection already finished, don't need to check whether to flag it as true
    if (hasLetterSelectionFinished) {
      return;
    }

    // Full, complete letter selection
    if (getNumSelectedLetters() === gamemodeSettings.numLetters) {
      setHasLetterSelectionFinished(true);
    }
  }, [letterTileStatuses]);

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

      props.onComplete(wasCorrect);
    }

    setInProgress(true);

    setGuesses([]);
    setLetterTileStatuses(DEFAULT_LETTER_TILE_STATUSES);
    setCurrentWord("");
    setTargetWord("");
    setInDictionary(true);
    setHasLetterSelectionFinished(false);

    if (gamemodeSettings.timerConfig.isTimed) {
      // Reset the timer if it is enabled in the game options
      resetCountdown();
    }
  }

  function ContinueGame() {
    // Re-enable all letters in the selection
    setLetterTileStatuses(
      letterTileStatuses.map((letterTileStatus) => {
        letterTileStatus.picked = false;
        return letterTileStatus;
      })
    );

    setInProgress(true);

    setInDictionary(false);
    setCurrentWord("");
    setInProgress(true);
    setInDictionary(true);
  }

  function onEnter() {
    if (!inProgress) {
      return;
    }

    if (!hasLetterSelectionFinished) {
      return;
    }

    // Nothing entered yet
    if (currentWord.length <= 0) {
      return;
    }

    // Is the word an accepted word (known word in dictionary)?
    const isWordInDictionary = getAllWordsOfLength(currentWord.length).includes(currentWord.toLowerCase());

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

  function onSubmitSelectionLetter(letter: string) {
    if (!hasLetterSelectionFinished && inProgress) {
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

  function onSubmitSelectionWord(word: string) {
    if (!inProgress) {
      return;
    }

    if (word.length !== gamemodeSettings.numLetters) {
      return;
    }

    // A vowel or consonant has already been picked
    if (getNumSelectedLetters() !== 0) {
      return;
    }

    // Create a letterStatus with each letter of word with the picked flag as false
    const newLetterTileStatuses = word.split("").map((letter) => {
      return { letter: letter, picked: false };
    });

    setLetterTileStatuses(newLetterTileStatuses);
  }

  // Passed through as onClick function for the LetterTile(s) within the LetterSelectionRow
  function onClickSelectionLetter(letter: string | null, index: number) {
    if (!inProgress) {
      return;
    }

    if (letter === null) {
      return;
    }

    if (letterTileStatuses[index].picked) {
      return;
    }

    // Still more letters need to be chosen for selection
    if (!hasLetterSelectionFinished) {
      return;
    }

    // The current word is already as long as the number of letters in the selection
    if (currentWord.length >= gamemodeSettings.numLetters) {
      return;
    }

    // Keep track this letter has now been picked
    let newLetterTileStatuses = letterTileStatuses.slice();
    newLetterTileStatuses[index] = {
      letter: letter,
      picked: true,
    };

    setLetterTileStatuses(newLetterTileStatuses);

    // Append chosen letter to currentWord
    setCurrentWord(currentWord + letter);
  }

  // Used the keyboard to add a new letter
  function onSubmitKeyboardLetter(letter: string) {
    // Find the first index in letterTileStatuses (where the letter is the letter clicked and the picked flag is false)
    const currentLetterIndex = letterTileStatuses.findIndex(
      (letterStatus) => !letterStatus.picked && letterStatus.letter === letter.toLowerCase()
    );

    // The letter that was clicked is not a letter in the selection (not present in the tileStatuses)
    if (currentLetterIndex === -1) {
      return;
    }

    // Keep track this letter has now been picked
    let newLetterTileStatuses = letterTileStatuses.slice();
    newLetterTileStatuses[currentLetterIndex] = {
      letter: letter,
      picked: true,
    };

    setLetterTileStatuses(newLetterTileStatuses);

    // Append chosen letter to currentWord
    setCurrentWord(currentWord + letter);
  }

  function onBackspace() {
    // If there is a letter to remove
    if (currentWord.length > 0 && inProgress) {
      const letterToRemove = currentWord.slice(-1);

      // Find the first index in letterTileStatuses (where the letter is the letter being removed and the picked flag is true)
      const currentLetterIndex = letterTileStatuses.findIndex(
        (letterStatus) => letterStatus.picked && letterStatus.letter === letterToRemove.toLowerCase()
      );

      if (currentLetterIndex === -1) {
        return;
      }

      // Keep track this letter is now available to select again
      let newLetterTileStatuses = letterTileStatuses.slice();
      newLetterTileStatuses[currentLetterIndex] = {
        letter: letterToRemove,
        picked: false,
      };

      setLetterTileStatuses(newLetterTileStatuses);

      setCurrentWord(currentWord.substring(0, currentWord.length - 1));
    }
  }

  function updateGamemodeSettings(newGamemodeSettings: LettersGameConfigProps["gamemodeSettings"]) {
    setGamemodeSettings(newGamemodeSettings);
  }

  return (
    <LettersGame
      campaignConfig={props.campaignConfig}
      gamemodeSettings={gamemodeSettings}
      remainingSeconds={remainingSeconds}
      totalSeconds={totalSeconds}
      guesses={guesses}
      currentWord={currentWord}
      letterTileStatuses={letterTileStatuses}
      inProgress={inProgress}
      inDictionary={inDictionary}
      hasLetterSelectionFinished={hasLetterSelectionFinished}
      targetWord={targetWord || ""}
      theme={props.theme}
      settings={props.settings}
      setTheme={props.setTheme}
      onEnter={onEnter}
      onSubmitSelectionLetter={onSubmitSelectionLetter}
      onSubmitSelectionWord={onSubmitSelectionWord}
      onClickSelectionLetter={onClickSelectionLetter}
      onSubmitKeyboardLetter={onSubmitKeyboardLetter}
      onBackspace={onBackspace}
      updateGamemodeSettings={updateGamemodeSettings}
      resetCountdown={resetCountdown}
      setTotalSeconds={setTotalSeconds}
      ResetGame={ResetGame}
      ContinueGame={ContinueGame}
      addGold={props.addGold}
    />
  );
};

export default LettersGameConfig;
