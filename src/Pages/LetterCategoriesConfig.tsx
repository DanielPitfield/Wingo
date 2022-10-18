import React, { useState } from "react";
import { PagePath } from "../Data/PageNames";
import LetterCategories from "./LetterCategories";
import { DEFAULT_ALPHABET } from "./WingoConfig";
import { Theme } from "../Data/Themes";
import { categoryMappings } from "../Data/WordArrayMappings";
import { MAX_NUM_CATEGORIES } from "../Data/GamemodeSettingsInputLimits";
import { shuffleArray } from "../Helpers/shuffleArray";
import { getGamemodeDefaultTimerValue } from "../Helpers/getGamemodeDefaultTimerValue";
import { getGamemodeDefaultWordLength } from "../Helpers/getGamemodeDefaultWordLength";
import { getRandomElementFrom } from "../Helpers/getRandomElementFrom";
import { useLocation } from "react-router-dom";
import { isCampaignLevelPath } from "../Helpers/CampaignPathChecks";
import { SettingsData } from "../Data/SaveData/Settings";
import { setMostRecentLetterCategoriesConfigGamemodeSettings } from "../Data/SaveData/MostRecentGamemodeSettings";
import { useCountdown } from "usehooks-ts";
import { useCorrectChime, useFailureChime, useLightPingChime, useClickChime } from "../Data/Sounds";

export interface LetterCategoriesConfigProps {
  campaignConfig:
    | {
        isCampaignLevel: true;
        // How many categories must be successfully answered to pass the campaign level?
        targetScore: number;
      }
    | { isCampaignLevel: false };

  gamemodeSettings: {
    numCategories: number;
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  };

  enforceFullLengthGuesses: boolean;
}

interface Props extends LetterCategoriesConfigProps {
  theme: Theme;
  settings: SettingsData;
  setTheme: (theme: Theme) => void;
  addGold: (gold: number) => void;
  onComplete: (wasCorrect: boolean) => void;
}

const LetterCategoriesConfig = (props: Props) => {
  const location = useLocation().pathname as PagePath;

  const [gamemodeSettings, setGamemodeSettings] = useState<LetterCategoriesConfigProps["gamemodeSettings"]>(
    props.gamemodeSettings
  );

  const [inProgress, setInProgress] = useState(true);

  const [wordLength, setWordLength] = useState(getGamemodeDefaultWordLength(location));

  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [hasSubmitLetter, sethasSubmitLetter] = useState(false);

  const [correctGuessesCount, setCorrectGuessesCount] = useState(0);

  const [requiredStartingLetter, setRequiredStartingLetter] = useState("");
  const [chosenCategoryMappings, setChosenCategoryMappings] = useState<{ name: string; targetWordArray: string[] }[]>(
    []
  );

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

  // Start timer (any time the toggle is enabled or the totalSeconds is changed)
  React.useEffect(() => {
    if (!inProgress) {
      return;
    }

    if (!gamemodeSettings.timerConfig.isTimed) {
      return;
    }

    startCountdown();
  }, [inProgress, gamemodeSettings.timerConfig.isTimed, totalSeconds]);

  // Check remaining seconds on timer
  React.useEffect(() => {
    if (!inProgress) {
      return;
    }

    if (!gamemodeSettings.timerConfig.isTimed) {
      return;
    }

    if (remainingSeconds <= 0) {
      stopCountdown();
      playFailureChimeSoundEffect();
      setInProgress(false);
    }
  }, [inProgress, gamemodeSettings.timerConfig.isTimed, remainingSeconds]);

  // targetWord generation
  React.useEffect(() => {
    if (categoryMappings.length > 0) {
      return;
    }

    generateTargetWords();
  }, [inProgress]);

  React.useEffect(() => {
    if (!chosenCategoryMappings || chosenCategoryMappings.length === 0) {
      return;
    }

    // Get the lengths of the longest word in each category's word array
    const longestWordLengths = chosenCategoryMappings
      // Just the targetWordArray for the category
      .map((x) => x.targetWordArray)
      // The length of the longest word in the array
      .map(
        (array: string[]) =>
          array.reduce((currentWord, nextWord) => (currentWord.length > nextWord.length ? currentWord : nextWord), "")
            .length
      );

    // Set the word length to the longest word in any/all of the arrays of the chosen categories
    setWordLength(Math.max(...longestWordLengths));
  }, [chosenCategoryMappings]);

  // Reset game after change of settings (stops cheating by changing settings partway through a game)
  React.useEffect(() => {
    if (isCampaignLevelPath(location)) {
      return;
    }

    ResetGame();

    // Save the latest gamemode settings for this mode
    setMostRecentLetterCategoriesConfigGamemodeSettings(gamemodeSettings);
  }, [gamemodeSettings]);

  // Picks a required starting letter and then target words from categories starting with this letter
  function generateTargetWords() {
    if (inProgress) {
      // Get a random letter from the Alphabet
      const requiredStartingLetter = getRandomElementFrom(DEFAULT_ALPHABET);
      // Set this letter as the letter that all words must begin with
      setRequiredStartingLetter(requiredStartingLetter);
      // Provide this letter as the start of guesses/words
      setCurrentWord(requiredStartingLetter);

      console.log(`%cStart Letter:%c ${requiredStartingLetter}`, "font-weight: bold", "font-weight: normal");

      // Randomly select the requiered number of categories
      const chosenCategories = shuffleArray(categoryMappings).slice(
        0,
        Math.min(gamemodeSettings.numCategories, MAX_NUM_CATEGORIES)
      );

      const newChosenCategoryMappings = chosenCategories.map((category) => {
        return {
          name: category.name,
          // Just the words that start with the required starting letter
          targetWordArray: category.array
            .map((x) => x.word)
            .filter((word) => word.charAt(0) === requiredStartingLetter),
        };
      });

      setChosenCategoryMappings(newChosenCategoryMappings);
    }
  }

  function ResetGame() {
    if (!inProgress) {
      // Achieved target score if a campaign level, otherwise just all categories guessed correctly
      const wasCorrect = props.campaignConfig.isCampaignLevel
        ? correctGuessesCount >= Math.min(props.campaignConfig.targetScore, gamemodeSettings.numCategories)
        : correctGuessesCount === gamemodeSettings.numCategories;
      props.onComplete(wasCorrect);
    }

    setInProgress(true);

    generateTargetWords();

    setGuesses([]);
    setWordIndex(0);
    sethasSubmitLetter(false);

    if (gamemodeSettings.timerConfig.isTimed) {
      // Reset the timer if it is enabled in the game options
      resetCountdown();
    }
  }

  function onEnter() {
    // Pressing Enter to Restart
    if (!inProgress) {
      ResetGame();
      return;
    }

    if (wordIndex >= chosenCategoryMappings.length) {
      // Made a guess in each row
      return;
    }

    // Array of valid words (for the row's category)
    const wordArray = chosenCategoryMappings[wordIndex].targetWordArray;

    if (!wordArray || wordArray.length === 0) {
      return;
    }

    if (wordArray.includes(currentWord.toLowerCase())) {
      // Correct word
      setCorrectGuessesCount(correctGuessesCount + 1);
    }

    setGuesses(guesses.concat(currentWord)); // Always show guess

    if (wordIndex + 1 === chosenCategoryMappings.length) {
      // Out of guesses
      setInProgress(false);

      // TODO: Calculate and add gold (only after all guesses have been made)
      //props.addGold(goldBanked);
    } else {
      setCurrentWord(requiredStartingLetter);
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
      // Never remove first letter
      if (currentWord.length === 1) {
        return; // Don't allow backspace
      }
      // If there is a letter to remove
      setCurrentWord(currentWord.substring(0, currentWord.length - 1));
    }
  }

  function updateGamemodeSettings(newGamemodeSettings: LetterCategoriesConfigProps["gamemodeSettings"]) {
    setGamemodeSettings(newGamemodeSettings);
  }

  return (
    <LetterCategories
      campaignConfig={props.campaignConfig}
      gamemodeSettings={gamemodeSettings}
      remainingSeconds={remainingSeconds}
      totalSeconds={totalSeconds}
      wordLength={wordLength}
      guesses={guesses}
      currentWord={currentWord}
      wordIndex={wordIndex}
      inProgress={inProgress}
      hasSubmitLetter={hasSubmitLetter}
      correctGuessesCount={correctGuessesCount}
      categoryRequiredStartingLetter={requiredStartingLetter}
      chosenCategoryMappings={chosenCategoryMappings}
      theme={props.theme}
      settings={props.settings}
      onEnter={onEnter}
      onSubmitLetter={onSubmitLetter}
      onBackspace={onBackspace}
      updateGamemodeSettings={updateGamemodeSettings}
      resetCountdown={resetCountdown}
      setTotalSeconds={setTotalSeconds}
      ResetGame={ResetGame}
    />
  );
};

export default LetterCategoriesConfig;
