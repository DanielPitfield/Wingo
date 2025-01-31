import React, { useEffect, useState } from "react";
import Wingo from "./Wingo";
import { Theme } from "../Data/Themes";
import WingoInterlinked from "./WingoInterlinked";
import {
  defaultDailyCrosswordGamemodeSettings,
  defaultWeeklyCrosswordGamemodeSettings,
  defaultWingoCrosswordFitGamemodeSettings,
  defaultWingoCrosswordGamemodeSettings,
  defaultWingoInterlinkedGamemodeSettings,
} from "../Data/DefaultGamemodeSettings";
import { categoryMappings, targetWordLengthMappings } from "../Data/WordArrayMappings";
import { getDeterministicArrayItems } from "../Helpers/DeterministicSeeding";
import { LetterTileStatus } from "../Components/LetterTile";
import { getAllPuzzleWordsOfLength, getAllWordsUpToLength, getTargetWordsOfLength } from "../Helpers/getWordsOfLength";
import { getGamemodeDefaultTimerValue } from "../Helpers/getGamemodeDefaultTimerValue";
import { getGamemodeDefaultWordLength } from "../Helpers/getGamemodeDefaultWordLength";
import { getConundrum } from "../Helpers/getConundrum";
import { getRandomElementFrom } from "../Helpers/getRandomElementFrom";
import { getLetterStatus } from "../Helpers/getLetterStatus";
import { getNumNewLimitlessLives } from "../Helpers/getNumNewLimitlessLives";
import { getDailyWeeklyWingoModes } from "../Helpers/getDailyWeeklyWingoModes";
import { useLocation } from "react-router";
import { PagePath } from "../Data/PageNames";
import { isCampaignLevelPath } from "../Helpers/CampaignPathChecks";
import { SettingsData } from "../Data/SaveData/Settings";
import {
  getDailyWordGuesses,
  setDailyWordGuesses,
  setDailyCrossWordGuesses,
  getDailyCrossWordGuesses,
  setWeeklyCrossWordGuesses,
  getWeeklyCrossWordGuesses,
} from "../Data/SaveData/DailyWeeklyGuesses";
import { addGameToHistory, addCompletedRoundToGameHistory } from "../Data/SaveData/GameHistory";
import {
  setMostRecentWingoConfigGamemodeSettings,
  getMostRecentWingoInterlinkedGamemodeSettings,
} from "../Data/SaveData/MostRecentGamemodeSettings";
import { useCountdown } from "usehooks-ts";
import { useCorrectChime, useFailureChime, useLightPingChime, useClickChime } from "../Data/Sounds";
import { isTimePeriodicMode } from "../Helpers/isTimePeriodicMode";

export const wingoModes = [
  "daily",
  "repeat",
  "category",
  "increasing",
  "limitless",
  "puzzle",
  "interlinked",
  "crossword/fit",
  "crossword/daily",
  "crossword/weekly",
  "crossword",
  "conundrum",
] as const;

export type WingoMode = (typeof wingoModes)[number];

export interface WingoConfigProps {
  mode: WingoMode;

  gamemodeSettings: {
    // Main options
    wordLength: number;
    startingNumGuesses: number;

    // Toggles
    enforceFullLengthGuesses: boolean;
    isFirstLetterProvided: boolean;
    isHintShown: boolean;

    // Puzzle mode
    puzzleRevealSeconds: number;
    puzzleLeaveNumBlanks: number;

    // Limitless mode
    maxLivesConfig: { isLimited: true; maxLives: number } | { isLimited: false };
    wordLengthMaxLimit: number;

    // Time limit
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  };

  // Word to guess specified in some way?
  conundrum?: string;
  targetWord?: string;

  // The words which are valid to be used as guesses
  wordArray?: string[];

  // Previous guesses (for daily)
  guesses?: string[];

  checkInDictionary?: boolean;

  roundScoringInfo?: { basePoints: number; pointsLostPerGuess: number };
}

interface Props extends WingoConfigProps {
  isCampaignLevel: boolean;
  theme?: Theme;
  settings: SettingsData;
  setTheme: (theme: Theme) => void;
  addGold: (gold: number) => void;
  onComplete: (wasCorrect: boolean) => void;
  onResetGame: () => void;
}

export type TargetWordMapping = { word: string; canBeTargetWord: boolean };
export type WordHintMapping = { word: string; hint?: string };
export type Conundrum = { conundrum: string; answer: string };

export const DEFAULT_ALPHABET_STRING = "abcdefghijklmnopqrstuvwxyz";
export const DEFAULT_ALPHABET = DEFAULT_ALPHABET_STRING.split("");

const DEFAULT_LETTER_STATUSES: LetterTileStatus[] = [...DEFAULT_ALPHABET, "-", "'"].map((x) => ({
  letter: x,
  status: "not set",
}));

// Modes to perform a full destroy/re-build reset
const HARD_RESET_MODES: WingoMode[] = ["repeat", "puzzle", "category"];

const WingoConfig = (props: Props) => {
  const location = useLocation().pathname as PagePath;

  const [gameId, setGameId] = useState<string | null>(null);

  const [gamemodeSettings, setGamemodeSettings] = useState<WingoConfigProps["gamemodeSettings"]>(
    props.gamemodeSettings
  );

  const [inProgress, setInProgress] = useState(true);

  const [currentWord, setCurrentWord] = useState("");
  const [guesses, setGuesses] = useState<string[]>(props.guesses ?? []);
  const [wordIndex, setWordIndex] = useState(0);

  const [inDictionary, setInDictionary] = useState(true);
  const [errorMessage, setErrorMessage] = useState<{ isShown: true; message: string } | { isShown: false }>({
    isShown: false,
  });
  const [isIncompleteWord, setIsIncompleteWord] = useState(false);

  const [conundrum, setConundrum] = useState("");
  const [targetWord, setTargetWord] = useState(props.targetWord ?? "");
  // The words which are valid to be used as guesses
  const [wordArray, setWordArray] = useState(props.wordArray ?? []);
  const [targetHint, setTargetHint] = useState("");
  const [targetCategory, setTargetCategory] = useState("");
  const [hasSubmitLetter, setHasSubmitLetter] = useState(false);
  const [revealedLetterIndexes, setRevealedLetterIndexes] = useState<number[]>([]);

  const [numCorrectGuesses, setNumCorrectGuesses] = useState(0);
  const [numIncorrectGuesses, setNumIncorrectGuesses] = useState(0);
  const [remainingGuesses, setRemainingGuesses] = useState(props.gamemodeSettings.startingNumGuesses);

  const [letterStatuses, setLetterStatuses] = useState<LetterTileStatus[]>(DEFAULT_LETTER_STATUSES);

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

  // Returns the newly determined target word
  function getTargetWord(): WordHintMapping | undefined {
    // Array of words of the current gamemode length (most modes will choose a word from this array)
    let targetLengthWordArray: WordHintMapping[] = getTargetWordsOfLength(gamemodeSettings.wordLength).map((x) => ({
      word: x,
      hint: "",
    }))!;

    switch (props.mode) {
      case "daily":
        const newTarget = getDeterministicArrayItems({ seedType: "today" }, 1, targetLengthWordArray)[0];

        // Load previous attempts at daily (if applicable)
        const dailyWordStorage = getDailyWordGuesses();

        // The actual daily word and the daily word set in local storage are the same
        if (newTarget.word === dailyWordStorage?.dailyWord) {
          // Display the sava data on the word grid
          setGuesses(dailyWordStorage.guesses);
          setWordIndex(dailyWordStorage.wordIndex);
          setInProgress(dailyWordStorage.inProgress);
          setCurrentWord(dailyWordStorage.currentWord);
          setInDictionary(dailyWordStorage.inDictionary);
        }

        return newTarget;

      case "puzzle":
        // Get a random puzzle
        return getRandomElementFrom(getAllPuzzleWordsOfLength(gamemodeSettings.wordLength));

      case "category":
        if (!targetCategory) {
          // Randomly choose a category (can be changed afterwards)
          setTargetCategory(getRandomElementFrom(categoryMappings).name);
          // A random word from this category is set in a useEffect(), so return
          return;
        }
        break;

      case "increasing":
        // There is already a targetWord which is of the needed wordLength
        if (targetWord && targetWord.length === gamemodeSettings.wordLength) {
          return { word: targetWord };
        }
        // There is no array for the current wordLength
        else if (!targetLengthWordArray || targetLengthWordArray?.length <= 0) {
          // Just reset (reached the end)
          ResetGame();
          return;
        } else {
          // Choose random word
          return getRandomElementFrom(targetLengthWordArray);
        }

      case "limitless":
        // There is no array for the current wordLength
        if (!targetLengthWordArray || targetLengthWordArray.length <= 0) {
          // Don't reset otherwise the number of lives would be lost, just go back to starting wordLength
          const newGamemodeSettings = {
            ...gamemodeSettings,
            wordLength: getGamemodeDefaultWordLength("/Wingo/Limitless"),
          };
          setGamemodeSettings(newGamemodeSettings);

          targetLengthWordArray = targetWordLengthMappings
            .find((x) => x.value === getGamemodeDefaultWordLength("/Wingo/Limitless"))
            ?.array.map((x) => ({ word: x, hint: "" }))!;
        }

        // Choose random word
        return getRandomElementFrom(targetLengthWordArray);

      case "conundrum":
        const newConundrum = getConundrum();

        if (newConundrum) {
          setConundrum(newConundrum.conundrum);
          setTargetWord(newConundrum.answer);
          // All letters revealed from start
          const newRevealedLetterIndexes: number[] = Array.from({ length: newConundrum.conundrum.length }).map(
            (_, index) => index
          );
          setRevealedLetterIndexes(newRevealedLetterIndexes);
          return { word: newConundrum?.answer };
        }

        return;

      default:
        // Choose random word
        return getRandomElementFrom(targetLengthWordArray);
    }
  }

  // Log and set the newly determined target word
  function updateTargetWord() {
    const newTargetWord = getTargetWord();

    if (!newTargetWord) {
      return;
    }

    // Log the mode, hint and word
    console.log(
      `%cMode:%c ${props.mode}\n%cHint:%c ${newTargetWord.hint || "-"}\n%cWord:%c ${newTargetWord.word || "-"}`,
      "font-weight: bold",
      "font-weight: normal",
      "font-weight: bold",
      "font-weight: normal",
      "font-weight: bold",
      "font-weight: normal"
    );

    if (newTargetWord.word) {
      setTargetWord(newTargetWord.word);
    }

    if (gamemodeSettings.isHintShown && newTargetWord.hint) {
      setTargetHint(newTargetWord.hint);
    }
  }

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
      setInDictionary(false);
      setInProgress(false);
    }
  }, [inProgress, gamemodeSettings.timerConfig.isTimed, remainingSeconds]);

  // Save gameplay progress of daily wingo
  React.useEffect(() => {
    if (props.mode === "daily" && targetWord) {
      setDailyWordGuesses(targetWord, guesses, wordIndex, inProgress, inDictionary, currentWord);
    }
  }, [targetWord, currentWord, guesses, wordIndex, inProgress, inDictionary]);

  // Get the word array (ignoring whether gamemodeSettings.enforceFullLengthGuesses is enabled or disabled at this stage)
  const getUntrimmedWordArray = () => {
    // Valid word array directly specified
    if (props.wordArray) {
      return props.wordArray;
    }

    // Category mode - Find the array which includes the target word
    if (props.mode === "category") {
      return categoryMappings
        .find((categoryMapping) => categoryMapping.array.some(({ word }) => word === targetWord))
        ?.array.map((x) => x.word)!;
    }

    // All words of length up to and including the wordLength (partial and full length guesses)
    return getAllWordsUpToLength(targetWord.length);
  };

  // Now trim the word array depending on whether gamemodeSettings.enforceFullLengthGuesses is enabled or disabled
  const getValidWordArray = () => {
    const untrimmedWordArray = getUntrimmedWordArray();

    // If full length guesses are enforced, filter the words that are the same length as the target word
    if (gamemodeSettings.enforceFullLengthGuesses) {
      return untrimmedWordArray.filter((word) => word.length === targetWord.length);
    }

    return untrimmedWordArray;
  };

  React.useEffect(() => {
    if (!targetWord) {
      return;
    }

    // Show first letter of the target word (if enabled)
    if (gamemodeSettings.isFirstLetterProvided) {
      setCurrentWord(targetWord.charAt(0));
    }

    // Update word length every time the target word changes
    const newGamemodeSettings = {
      ...gamemodeSettings,
      wordLength: targetWord.length,
    };
    setGamemodeSettings(newGamemodeSettings);

    // Update the currently valid guesses which can be made
    setWordArray(getValidWordArray());
  }, [targetWord]);

  // Reset game after change of settings (stops cheating by changing settings partway through a game)
  React.useEffect(() => {
    if (isCampaignLevelPath(location)) {
      return;
    }

    if (isTimePeriodicMode(location) || props.mode === "limitless" || props.mode === "conundrum") {
      // Do not reset the game if the gamemode is daily/weekly, as the gamemodeSettings are instead loaded from localStorage (#304, #305, #508)
      return;
    }

    ResetGame();

    // Save the latest gamemode settings for this mode
    setMostRecentWingoConfigGamemodeSettings(location, gamemodeSettings);
  }, [gamemodeSettings]);

  // Update targetWord every time the targetCategory changes
  React.useEffect(() => {
    if (props.mode !== "category") {
      return;
    }

    // Category may be changed mid-game (so clear anything from before)
    ResetGame();

    const newTarget = getRandomElementFrom(categoryMappings.find((x) => x.name === targetCategory)?.array ?? []);

    if (!newTarget) {
      // If the categopryMappings have not yet loaded,
      // do not set the targetWord and targetHint (#400)
      return;
    }

    console.log(
      `%cMode:%c ${props.mode}\n%cHint:%c ${newTarget.hint}\n%cWord:%c ${newTarget.word}`,
      "font-weight: bold",
      "font-weight: normal",
      "font-weight: bold",
      "font-weight: normal",
      "font-weight: bold",
      "font-weight: normal"
    );

    setTargetWord(newTarget.word);
    setTargetHint(newTarget.hint);
  }, [targetCategory]);

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

    setLetterStatuses(letterStatusesCopy);
  }, [guesses, wordIndex]);

  // Reveals letters of read only puzzle row periodically
  React.useEffect(() => {
    if (props.mode !== "puzzle") {
      return;
    }

    // Tried entering a guess, so revealing of tiles has been interrupted/stopped
    if (hasSubmitLetter) {
      return;
    }

    const intervalId = setInterval(() => {
      // This return is needed to prevent a letter being revealed after trying to enter a word (because an interval was queued)
      if (hasSubmitLetter) {
        return;
      }

      if (!targetWord) {
        return;
      }

      if (
        // Stop revealing letters when there is only puzzleLeaveNumBlanks left to reveal
        revealedLetterIndexes.length >=
        targetWord.length - gamemodeSettings.puzzleLeaveNumBlanks
      ) {
        return;
      }

      const newRevealedLetterIndexes = revealedLetterIndexes.slice();

      if (revealedLetterIndexes.length === 0) {
        // Start by revealing the first letter
        newRevealedLetterIndexes.push(0);
      } else if (revealedLetterIndexes.length === 1) {
        // Next reveal the last letter
        newRevealedLetterIndexes.push(targetWord.length - 1);
      } else {
        let newIndex: number;

        // Keep looping to find a random index that hasn't been used yet
        do {
          newIndex = Math.floor(Math.random() * targetWord.length);
        } while (revealedLetterIndexes.includes(newIndex));

        // Reveal a random letter
        if (newIndex >= 0 && newIndex <= targetWord.length - 1) {
          // Check index is in the range (0, wordLength-1)
          newRevealedLetterIndexes.push(newIndex);
        }
      }
      setRevealedLetterIndexes(newRevealedLetterIndexes);
    }, gamemodeSettings.puzzleRevealSeconds * 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [props.mode, targetWord, revealedLetterIndexes, hasSubmitLetter]);

  // targetWord generation
  React.useEffect(() => {
    // Don't need to determine a target word, if it is explicitly specified
    if (!inProgress) {
      return;
    }

    // A target word of the correct length was explicitly specified
    if (props.targetWord !== undefined && props.targetWord.length === gamemodeSettings.wordLength) {
      return;
    }

    // Already a word of the correct length
    if (targetWord.length === gamemodeSettings.wordLength) {
      return;
    }

    updateTargetWord();
  }, [
    // When word length is changed
    gamemodeSettings.wordLength,
    targetWord,
    props.targetWord,
    // Puzzle settings are changed
    gamemodeSettings.puzzleLeaveNumBlanks,
    gamemodeSettings.puzzleRevealSeconds,
    // Game ends or mode is changed
    inProgress,
    props.mode,
  ]);

  // Save the game
  React.useEffect(() => {
    if (!targetWord) {
      return;
    }

    const gameId = addGameToHistory(location, {
      timestamp: new Date().toISOString(),
      gameCategory: "Wingo",
      page: location,
      levelProps: {
        mode: props.mode,
        gamemodeSettings: gamemodeSettings,
        wordArray: props.wordArray,
        targetWord,
        checkInDictionary: props.checkInDictionary,
      },
    });

    setGameId(gameId);
  }, [location, targetWord]);

  const isCurrentGuessCorrect = (): boolean => {
    return (
      currentWord.length > 0 &&
      currentWord.replace(/ /g, "-").toLowerCase() === targetWord.replace(/ /g, "-").toLowerCase()
    );
  };

  const isCurrentGuessInDictionary = (): boolean => {
    return isCurrentGuessCorrect() || (wordArray.includes(currentWord.toLowerCase()) && currentWord.length > 0);
  };

  function ResetGame() {
    if (!inProgress) {
      // Guessed the target word correctly
      const wasCorrect = isCurrentGuessCorrect();

      props.onComplete(wasCorrect);
    }

    setIsIncompleteWord(false);

    // Update word (when first letter provided setting is changed)
    const newCurrentWord = gamemodeSettings.isFirstLetterProvided ? targetWord.charAt(0) : "";
    setCurrentWord(newCurrentWord);
    setErrorMessage({ isShown: false });
    setGuesses([]);
    setRemainingGuesses(gamemodeSettings.startingNumGuesses);
    setWordIndex(0);
    setInProgress(true);
    setInDictionary(true);
    setHasSubmitLetter(false);
    setConundrum("");
    setRevealedLetterIndexes([]);
    setLetterStatuses(DEFAULT_LETTER_STATUSES);

    if (gamemodeSettings.timerConfig.isTimed) {
      // Reset the timer if it is enabled in the game options
      resetCountdown();
    }

    if (HARD_RESET_MODES.includes(props.mode)) {
      props.onResetGame();
    }
  }

  function ContinueGame() {
    // Update word (when first letter provided setting is changed)
    const newCurrentWord = gamemodeSettings.isFirstLetterProvided ? targetWord.charAt(0) : "";
    setCurrentWord(newCurrentWord);

    setGuesses([]);
    setWordIndex(0);
    setInProgress(true);
    setInDictionary(true);

    setHasSubmitLetter(false);
    setRevealedLetterIndexes([]);
    setLetterStatuses(DEFAULT_LETTER_STATUSES);

    if (gamemodeSettings.timerConfig.isTimed) {
      // Reset the timer if it is enabled in the game options
      resetCountdown();
    }

    // Add new rows for success in limitless mode
    if (props.mode === "limitless" && isCurrentGuessCorrect()) {
      setNumCorrectGuesses(numCorrectGuesses + 1);

      const newLives = getNumNewLimitlessLives(remainingGuesses, wordIndex, gamemodeSettings.maxLivesConfig);
      setRemainingGuesses(remainingGuesses + newLives);
    }

    // Remove a row for failiure in limitless mode
    if (props.mode === "limitless" && !isCurrentGuessCorrect() && remainingGuesses >= 1) {
      setNumIncorrectGuesses(numIncorrectGuesses + 1);
      setRemainingGuesses(remainingGuesses - 1);
    }

    // Increment word length (only on success) for these modes
    if ((props.mode === "limitless" || props.mode === "increasing") && isCurrentGuessCorrect()) {
      const newGamemodeSettings = {
        ...gamemodeSettings,
        wordLength: gamemodeSettings.wordLength + 1,
      };
      setGamemodeSettings(newGamemodeSettings);
    }
  }

  function isOutcomeContinue(): boolean {
    if (props.mode === "increasing") {
      // Correct and next wordLength does not exceed limit
      return isCurrentGuessCorrect() && props.gamemodeSettings.wordLength < props.gamemodeSettings.wordLengthMaxLimit;
    }

    if (props.mode === "limitless") {
      // Correct answer with last row left
      const lastRowCorrectAnswer = isCurrentGuessCorrect() && remainingGuesses === 1;
      // Lives left or correct answer with last remaining life
      return lastRowCorrectAnswer || remainingGuesses > 1;
    }

    // Only increasing and limitless modes can be continued
    return false;
  }

  function onEnter() {
    // Daily/weekly modes are one attempt only, if they are over, don't allow pressing Enter to restart
    if (!inProgress && getDailyWeeklyWingoModes().includes(props.mode)) {
      return;
    }

    // Pressing Enter to Continue/Restart
    if (!inProgress) {
      isOutcomeContinue() ? ContinueGame() : ResetGame();
    }

    // No target word yet
    if (!targetWord) {
      return;
    }

    // Don't end game prematurely (before wordArray is determined), only if the current guess is not correct (to avoid the correct answer failing as its not in the word array)
    if (!isCurrentGuessCorrect() && (!wordArray || wordArray.length <= 0)) {
      return;
    }

    // Used all guesses
    if (wordIndex >= remainingGuesses) {
      return;
    }

    // Don't allow incomplete words (if specified in props)
    if (gamemodeSettings.enforceFullLengthGuesses && currentWord.length !== gamemodeSettings.wordLength) {
      setIsIncompleteWord(true);
      setErrorMessage({ isShown: true, message: "Only full length words are allowed" });
      return;
    }

    // Start as true until proven otherwise
    setInDictionary(true);

    // The word is complete or enforce full length guesses is off
    setIsIncompleteWord(false);

    let outcome: "success" | "failure" | "in-progress" = "in-progress";

    // Checking against the dictionary is enabled and the word submitted was not in the dictionary
    if (!isCurrentGuessInDictionary()) {
      setInDictionary(false);
      setErrorMessage({ isShown: true, message: "Not a valid word" });

      if (props.checkInDictionary) {
        setInProgress(false);
        outcome = "failure";
      }
    }

    // The word is in the dictionary or is the target word exactly (to protect against a bug where the target word may not be in the dictionary)
    const isAccepetedWord = isCurrentGuessCorrect() || isCurrentGuessInDictionary();

    if (isAccepetedWord) {
      // Add word to guesses
      setGuesses(guesses.concat(currentWord));
    }

    // Exact match
    if (isCurrentGuessCorrect()) {
      setInProgress(false);
      outcome = "success";
    }

    // Out of guesses
    if (wordIndex + 1 === remainingGuesses) {
      setInProgress(false);
      outcome = "failure";
    }

    // Not an ending outcome
    if (outcome === "in-progress" && isCurrentGuessInDictionary()) {
      const newCurrentWord = gamemodeSettings.isFirstLetterProvided ? targetWord?.charAt(0)! : "";
      setCurrentWord(newCurrentWord);
      setWordIndex(wordIndex + 1); // Increment index to indicate new word has been started
    }

    // Save round to history
    if (outcome !== "in-progress" && gameId) {
      addCompletedRoundToGameHistory(gameId, {
        timestamp: new Date().toISOString(),
        gameCategory: "Wingo",
        page: location,
        outcome,
        levelProps: {
          mode: props.mode,
          gamemodeSettings: gamemodeSettings,
          targetWord,
          checkInDictionary: props.checkInDictionary,
          wordArray: props.wordArray,
          guesses,
        },
      });
    }

    if (gamemodeSettings.timerConfig.isTimed) {
      resetCountdown();
    }
  }

  function onSubmitLetter(letter: string) {
    setErrorMessage({ isShown: false as false });

    if (currentWord.length < gamemodeSettings.wordLength && inProgress) {
      setCurrentWord(currentWord + letter);
      setHasSubmitLetter(true);
    }
  }

  function onBackspace() {
    setErrorMessage({ isShown: false as false });

    if (currentWord.length > 0 && inProgress) {
      // If only the first letter and it was provided to begin with
      if (currentWord.length === 1 && gamemodeSettings.isFirstLetterProvided) {
        return; // Don't allow backspace
      }
      // If there is a letter to remove
      setCurrentWord(currentWord.substring(0, currentWord.length - 1));
    }
  }

  function updateGamemodeSettings(newGamemodeSettings: WingoConfigProps["gamemodeSettings"]) {
    setGamemodeSettings(newGamemodeSettings);
  }

  const commonWingoInterlinkedProps = {
    isCampaignLevel: props.isCampaignLevel,
    theme: props.theme,
    setTheme: props.setTheme,
    addGold: props.addGold,
    settings: props.settings,
    onComplete: props.onComplete,
  };

  if (props.mode === "interlinked") {
    return (
      <WingoInterlinked
        {...commonWingoInterlinkedProps}
        wordArrayConfig={{ type: "length" }}
        provideWords={false}
        gamemodeSettings={
          getMostRecentWingoInterlinkedGamemodeSettings("/Wingo/Interlinked") ?? defaultWingoInterlinkedGamemodeSettings
        }
      />
    );
  }

  if (props.mode === "crossword") {
    return (
      <WingoInterlinked
        {...commonWingoInterlinkedProps}
        wordArrayConfig={{ type: "category" }}
        provideWords={false}
        gamemodeSettings={
          getMostRecentWingoInterlinkedGamemodeSettings("/Wingo/Crossword") ?? defaultWingoCrosswordGamemodeSettings
        }
      />
    );
  }

  if (props.mode === "crossword/daily") {
    return (
      <WingoInterlinked
        {...commonWingoInterlinkedProps}
        wordArrayConfig={{
          type: "custom",
          array: getDeterministicArrayItems(
            { seedType: "today" },
            6,
            categoryMappings.flatMap((categoryMappings) => categoryMappings.array.map((mapping) => mapping.word))
          ),
          useExact: true,
          canRestart: false,
        }}
        onSave={setDailyCrossWordGuesses}
        initialConfig={getDailyCrossWordGuesses() ?? undefined}
        provideWords={false}
        gamemodeSettings={defaultDailyCrosswordGamemodeSettings}
      />
    );
  }

  if (props.mode === "crossword/weekly") {
    return (
      <WingoInterlinked
        {...commonWingoInterlinkedProps}
        wordArrayConfig={{
          type: "custom",
          array: getDeterministicArrayItems(
            { seedType: "this-week" },
            6,
            categoryMappings.flatMap((categoryMappings) => categoryMappings.array.map((mapping) => mapping.word))
          ),
          useExact: true,
          canRestart: false,
        }}
        onSave={setWeeklyCrossWordGuesses}
        initialConfig={getWeeklyCrossWordGuesses() || undefined}
        provideWords={false}
        gamemodeSettings={defaultWeeklyCrosswordGamemodeSettings}
      />
    );
  }

  if (props.mode === "crossword/fit") {
    return (
      <WingoInterlinked
        {...commonWingoInterlinkedProps}
        wordArrayConfig={{ type: "length" }}
        provideWords={true}
        gamemodeSettings={
          getMostRecentWingoInterlinkedGamemodeSettings("/Wingo/Crossword/Fit") ??
          defaultWingoCrosswordFitGamemodeSettings
        }
      />
    );
  }

  return (
    <Wingo
      isCampaignLevel={props.isCampaignLevel}
      mode={props.mode}
      gamemodeSettings={gamemodeSettings}
      remainingSeconds={remainingSeconds}
      totalSeconds={totalSeconds}
      numCorrectGuesses={numCorrectGuesses}
      numIncorrectGuesses={numIncorrectGuesses}
      remainingGuesses={remainingGuesses}
      guesses={guesses}
      currentWord={currentWord}
      wordIndex={wordIndex}
      inProgress={inProgress}
      inDictionary={inDictionary}
      errorMessage={errorMessage}
      isIncompleteWord={isIncompleteWord}
      conundrum={conundrum ?? ""}
      targetWord={targetWord ?? ""}
      targetHint={gamemodeSettings.isHintShown ? targetHint : ""}
      targetCategory={targetCategory ?? ""}
      revealedLetterIndexes={revealedLetterIndexes}
      letterStatuses={letterStatuses}
      theme={props.theme}
      settings={props.settings}
      onEnter={onEnter}
      onSubmitLetter={onSubmitLetter}
      onBackspace={onBackspace}
      updateGamemodeSettings={updateGamemodeSettings}
      resetCountdown={resetCountdown}
      setTotalSeconds={setTotalSeconds}
      ResetGame={ResetGame}
      ContinueGame={ContinueGame}
      setTheme={props.setTheme}
    />
  );
};

// Wrapper to easily reset a Wingo game
const WingoConfigWithResetWrapper = (props: Omit<Props, "onResetGame">) => {
  // Number of milliseconds to ignore a ResetGame request after a preivous reset
  // (to avoid an error with re-render limit, as ResetGame is often called in many
  // modes of WingoConfig on initialisation)
  const DEBOUNCE_MS = 1500;

  const [resetKey, setResetKey] = useState(new Date().toISOString());
  const [isLoaded, setIsLoaded] = useState(false);

  // Add a timeout on reset of the WingoConfig to mark the element as loaded
  useEffect(() => {
    const timeoutId = window.setTimeout(() => setIsLoaded(true), DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [setIsLoaded, resetKey]);

  return (
    <WingoConfig
      // Set a unique key (on change of this, the entire WingoConfig component is destroyed and rebuilt)
      key={resetKey}
      {...props}
      onResetGame={() => {
        // Only if the element is loaded (to avoid an error with re-render limit,
        // as ResetGame is often called in many modes of WingoConfig on initialisation)
        if (isLoaded) {
          setResetKey(new Date().toISOString());
          setIsLoaded(false);
        }
      }}
    />
  );
};

export default WingoConfigWithResetWrapper;
