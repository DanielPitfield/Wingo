import React, { useState } from "react";
import { PagePath } from "../Data/PageNames";
import LetterCategories from "./LetterCategories";
import { SaveData, SettingsData } from "../Data/SaveData/SaveData";
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

  const [inProgress, setInProgress] = useState(true);
  const [wordLength, setWordLength] = useState(getGamemodeDefaultWordLength(location));
  const [guesses, setGuesses] = useState<string[]>([]);
  const [wordIndex, setWordIndex] = useState(0);
  const [hasSubmitLetter, sethasSubmitLetter] = useState(false);
  const [correctGuessesCount, setCorrectGuessesCount] = useState(0);
  const [currentWord, setCurrentWord] = useState("");
  const [requiredStartingLetter, setRequiredStartingLetter] = useState("");
  const [chosenCategoryMappings, setChosenCategoryMappings] = useState<{ name: string; targetWordArray: string[] }[]>(
    []
  );

  const [gamemodeSettings, setGamemodeSettings] = useState<LetterCategoriesConfigProps["gamemodeSettings"]>(
    props.gamemodeSettings
  );

  const [remainingSeconds, setRemainingSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig?.seconds
      : getGamemodeDefaultTimerValue(location)
  );

  // Timer Setup
  React.useEffect(() => {
    if (!gamemodeSettings.timerConfig.isTimed) {
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
    SaveData.setLetterCategoriesConfigGamemodeSettings(gamemodeSettings);
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

    generateTargetWords();
    setGuesses([]);
    setWordIndex(0);
    setInProgress(true);
    sethasSubmitLetter(false);
    if (gamemodeSettings.timerConfig.isTimed) {
      // Reset the timer if it is enabled in the game options
      setRemainingSeconds(gamemodeSettings.timerConfig.seconds);
    }
  }

  function calculateGoldAwarded(numCorrectAnswers: number) {
    const baseValue = 50;

    // Incremental multiplier with wordLength
    const numCorrectAnswerMultipliers = [
      { value: 1, multiplier: 1 },
      { value: 2, multiplier: 1.05 },
      { value: 3, multiplier: 1.25 },
      { value: 4, multiplier: 1.5 },
      { value: 5, multiplier: 2 },
      { value: 6, multiplier: 3 },
      { value: 7, multiplier: 4 },
      { value: 8, multiplier: 5 },
      { value: 9, multiplier: 7.5 },
      { value: 10, multiplier: 10 },
    ];

    // Bonus multiplier for several correct answers
    let currentNumCorrectAnswerMultiplier;

    // More correct answers (then the highest specified above)
    if (numCorrectAnswers > numCorrectAnswerMultipliers.length) {
      // Use the biggest specified multiplier
      currentNumCorrectAnswerMultiplier = numCorrectAnswerMultipliers.find(
        (x) => x.value === numCorrectAnswerMultipliers.length
      )?.multiplier;
    } else {
      // Use the multiplier for the number of correct answers
      currentNumCorrectAnswerMultiplier = numCorrectAnswerMultipliers.find(
        (x) => x.value === numCorrectAnswers
      )?.multiplier;
    }

    if (currentNumCorrectAnswerMultiplier) {
      const goldTotal = Math.round(baseValue * numCorrectAnswers * currentNumCorrectAnswerMultiplier);
      return goldTotal;
    } else {
      return 0;
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

      // Calculate and add gold (only after all guesses have been made)
      const goldBanked = calculateGoldAwarded(correctGuessesCount);
      props.addGold(goldBanked);
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

  function updateRemainingSeconds(newSeconds: number) {
    setRemainingSeconds(newSeconds);
  }

  return (
    <LetterCategories
      campaignConfig={props.campaignConfig}
      gamemodeSettings={gamemodeSettings}
      remainingSeconds={remainingSeconds}
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
      updateRemainingSeconds={updateRemainingSeconds}
      ResetGame={ResetGame}
    />
  );
};

export default LetterCategoriesConfig;
