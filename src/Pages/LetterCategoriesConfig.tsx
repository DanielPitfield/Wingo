import React, { useState } from "react";
import { PageName } from "../PageNames";
import LetterCategories from "./LetterCategories";
import { SaveData, SettingsData } from "../Data/SaveData";
import { DEFAULT_ALPHABET } from "../Components/Keyboard";
import { pickRandomElementFrom } from "./WingoConfig";
import { Theme } from "../Data/Themes";
import { categoryMappings } from "../Data/DefaultGamemodeSettings";

export interface LetterCategoriesConfigProps {
  enforceFullLengthGuesses: boolean;
  gamemodeSettings?: {
    defaultNumCategories?: number;
    timerConfig?: { isTimed: true; seconds: number } | { isTimed: false };
  };
  finishingButtonText?: string;
}

interface Props extends LetterCategoriesConfigProps {
  page: PageName;
  theme: Theme;
  settings: SettingsData;
  setPage: (page: PageName) => void;
  setTheme: (theme: Theme) => void;
  addGold: (gold: number) => void;
  onComplete?: (wasCorrect: boolean) => void;
}

const LetterCategoriesConfig: React.FC<Props> = (props) => {
  const DEFAULT_NUM_CATEGORIES = 5;

  const [guesses, setGuesses] = useState<string[]>([]);
  const [gameId, setGameId] = useState<string | null>(null);
  const [currentWord, setCurrentWord] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [inProgress, setinProgress] = useState(true);
  const [wordLength, setwordLength] = useState(4);
  const [correctGuessesCount, setCorrectGuessesCount] = useState(0);
  const [categoryRequiredStartingLetter, setCategoryRequiredStartingLetter] = useState("");
  const [categoryNames, setCategoryNames] = useState<string[]>([]);
  const [categoryWordTargets, setCategoryWordTargets] = useState<string[][]>([[]]);
  const [hasSubmitLetter, sethasSubmitLetter] = useState(false);

  const defaultGamemodeSettings = {
    numCategories: props.gamemodeSettings?.defaultNumCategories ?? DEFAULT_NUM_CATEGORIES,
    timerConfig: props.gamemodeSettings?.timerConfig ?? { isTimed: false },
  };

  const [gamemodeSettings, setGamemodeSettings] = useState<{
    numCategories: number;
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  }>(defaultGamemodeSettings);

  const DEFAULT_TIMER_VALUE = 30;
  const [remainingSeconds, setRemainingSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig.seconds
      : DEFAULT_TIMER_VALUE
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
        setinProgress(false);
      }
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [setRemainingSeconds, remainingSeconds, gamemodeSettings.timerConfig.isTimed]);

  // targetWord generation
  React.useEffect(() => {
    generateTargetWords();
  }, [inProgress]);

  // Reset game after change of settings (stops cheating by changing settings partway through a game)
  React.useEffect(() => {
    if (props.page === "campaign/area/level") {
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
      const isFirstLetterProvided = pickRandomElementFrom(DEFAULT_ALPHABET);
      // Set this letter as the letter that all words must begin with
      setCategoryRequiredStartingLetter(isFirstLetterProvided);
      // Provide this letter as the start of guesses/words
      setCurrentWord(isFirstLetterProvided);

      console.log(`%cStart Letter:%c ${isFirstLetterProvided}`, "font-weight: bold", "font-weight: normal");

      // The names of the categories in play
      let categoryNames: string[] = [];

      // The valid words for each of the categories
      let categoryTargetWords: string[][] = [];

      let failedSearchCount = 0;
      const MAX_NUM_FAILED_SEARCHES = 50;

      do {
        const randomCategory = pickRandomElementFrom(categoryMappings);
        // Is the random category, a category which has not been used yet?
        const isNewCategory = !categoryNames.includes(randomCategory.name);

        // Already used this category, so loop around again
        if (!isNewCategory) {
          failedSearchCount += 1;
          continue;
        }

        // Get all the words in the category starting with isFirstLetterProvided
        const words = randomCategory.array
          .map((wordHintCombination: { word: string; hint: string }) => wordHintCombination.word)
          .filter((word: string) => word.charAt(0) === isFirstLetterProvided);

        // No words starting with isFirstLetterProvided
        if (!words || words.length <= 0) {
          failedSearchCount += 1;
          continue;
        }

        // Push these words as an array
        categoryTargetWords.push(words);
        // Keep track this category has been used
        categoryNames.push(randomCategory.name);
      } while (
        // Until there are the specified number of categories (or MAX_NUM_FAILED_SEARCHES attempts were made at finding categories)
        categoryNames.length < gamemodeSettings.numCategories &&
        failedSearchCount <= MAX_NUM_FAILED_SEARCHES
      );

      // Keep reference of which categories have been used
      setCategoryNames(categoryNames);

      for (let i = 0; i < categoryTargetWords.length; i++) {
        console.log(
          `%cCategory:%c ${categoryNames[i]}\n%cWords:%c ${categoryTargetWords[i].join(", ")}`,
          "font-weight: bold",
          "font-weight: normal",
          "font-weight: bold",
          "font-weight: normal"
        );
      }

      setCategoryWordTargets(categoryTargetWords);

      // Start longestValidLength (at 4)
      let longestValidLength = wordLength;

      // Find the longest word in the array of valid words for each category
      for (let i = 0; i < categoryTargetWords.length; i++) {
        const longestWordInArray = categoryTargetWords[i].reduce(
          (currentWord, nextWord) => (currentWord.length > nextWord.length ? currentWord : nextWord),
          ""
        );
        // Update longestValidLength (if there is a longer valid word)
        if (longestWordInArray.length > longestValidLength) {
          longestValidLength = longestWordInArray.length;
        }
      }

      // Set the wordLength to the length of the largest valid word in any of the categories
      setwordLength(longestValidLength);
    }
  }

  function ResetGame() {
    props.onComplete?.(true);
    generateTargetWords();
    setGuesses([]);
    setWordIndex(0);
    setinProgress(true);
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

    if (wordIndex >= categoryWordTargets.length) {
      // Made a guess in each row
      return;
    }

    // Array of valid words (for the row's category)
    const wordArray = categoryWordTargets[wordIndex];

    if (!wordArray || wordArray.length === 0) {
      return;
    }

    if (wordArray.includes(currentWord.toLowerCase())) {
      // Correct word
      setCorrectGuessesCount(correctGuessesCount + 1);
    }

    setGuesses(guesses.concat(currentWord)); // Always show guess

    if (wordIndex + 1 === categoryWordTargets.length) {
      // Out of guesses
      setinProgress(false);

      // Calculate and add gold (only after all guesses have been made)
      const goldBanked = calculateGoldAwarded(correctGuessesCount);
      props.addGold(goldBanked);
    } else {
      setCurrentWord(categoryRequiredStartingLetter);
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

  function updateGamemodeSettings(newGamemodeSettings: {
    numCategories: number;
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  }) {
    setGamemodeSettings(newGamemodeSettings);
  }

  function updateRemainingSeconds(newSeconds: number) {
    setRemainingSeconds(newSeconds);
  }

  return (
    <LetterCategories
      isCampaignLevel={props.page === "campaign/area/level"}
      gamemodeSettings={gamemodeSettings}
      remainingSeconds={remainingSeconds}
      wordLength={wordLength}
      guesses={guesses}
      currentWord={currentWord}
      wordIndex={wordIndex}
      inProgress={inProgress}
      hasSubmitLetter={hasSubmitLetter}
      correctGuessesCount={correctGuessesCount}
      categoryRequiredStartingLetter={categoryRequiredStartingLetter || ""}
      categoryNames={categoryNames || []}
      categoryWordTargets={categoryWordTargets || [[]]}
      finishingButtonText={props.finishingButtonText}
      page={props.page}
      theme={props.theme}
      settings={props.settings}
      onEnter={onEnter}
      onSubmitLetter={onSubmitLetter}
      onBackspace={onBackspace}
      updateGamemodeSettings={updateGamemodeSettings}
      updateRemainingSeconds={updateRemainingSeconds}
      ResetGame={ResetGame}
      setPage={props.setPage}
    />
  );
};

export default LetterCategoriesConfig;