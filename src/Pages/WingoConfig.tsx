import React, { useState } from "react";
import Wingo from "./Wingo";
import { SaveData, SettingsData } from "../Data/SaveData";
import { Theme } from "../Data/Themes";
import { WingoInterlinked } from "./WingoInterlinked";
import { PageName } from "../Data/PageNames";
import {
  defaultDailyCrosswordGamemodeSettings,
  defaultWeeklyCrosswordGamemodeSettings,
  defaultWingoCrosswordFitGamemodeSettings,
  defaultWingoCrosswordGamemodeSettings,
  defaultWingoInterlinkedGamemodeSettings,
} from "../Data/DefaultGamemodeSettings";
import { MIN_TARGET_WORD_LENGTH } from "../Data/GamemodeSettingsInputLimits";
import { categoryMappings, wordLengthMappingsTargets } from "../Data/WordArrayMappings";
import { getDeterministicArrayItems } from "../Helper Functions/DeterministicSeeding";
import { LetterStatus } from "../Components/LetterTile";
import { getAllWordsOfLength } from "../Helper Functions/getAllWordsOfLength";
import { getGamemodeDefaultTimerValue } from "../Helper Functions/getGamemodeDefaultTimerValue";
import { getGamemodeDefaultWordLength } from "../Helper Functions/getGamemodeDefaultWordLength";
import { getConundrum } from "../Helper Functions/getConundrum";
import { getRandomElementFrom } from "../Helper Functions/getRandomElementFrom";
import { puzzles_ten } from "../Data/WordArrays/Puzzles/Puzzles10";

export type WingoMode =
  | "daily"
  | "repeat"
  | "category"
  | "increasing"
  | "limitless"
  | "puzzle"
  | "interlinked"
  | "crossword/fit"
  | "crossword/daily"
  | "crossword/weekly"
  | "crossword"
  | "conundrum";

export interface WingoConfigProps {
  mode: WingoMode;

  gamemodeSettings: {
    wordLength: number;
    isFirstLetterProvided: boolean;
    isHintShown: boolean;

    // Puzzle mode
    puzzleRevealMs: number;
    puzzleLeaveNumBlanks: number;

    // Limitless mode
    maxLivesConfig: { isLimited: true; maxLives: number } | { isLimited: false };
    wordLengthMaxLimit: number;

    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  };

  defaultNumGuesses: number;
  // TODO: All gets a bit confusing with gamemodeSettings wordLength, defaultWordLength, targetWordLength
  defaultWordLength?: number;
  enforceFullLengthGuesses: boolean;

  // Word to guess specified in some way?
  conundrum?: string;
  targetWord?: string;

  // The words which are valid to be used as guesses
  wordArray?: string[];

  // Previous guesses (for daily)
  guesses?: string[];

  checkInDictionary?: boolean;

  roundScoringInfo?: { basePoints: number; pointsLostPerGuess: number };
  gameshowScore?: number;
}

interface Props extends WingoConfigProps {
  isCampaignLevel: boolean;
  page: PageName;
  theme?: Theme;
  settings: SettingsData;
  setPage: (page: PageName) => void;
  setTheme: (theme: Theme) => void;
  addGold: (gold: number) => void;
  onComplete: (wasCorrect: boolean) => void;
  onCompleteGameshowRound?: (wasCorrect: boolean, guess: string, correctAnswer: string, score: number | null) => void;
}

export const DEFAULT_ALPHABET_STRING = "abcdefghijklmnopqrstuvwxyz";
export const DEFAULT_ALPHABET = DEFAULT_ALPHABET_STRING.split("");

const WingoConfig = (props: Props) => {
  const [guesses, setGuesses] = useState<string[]>(props.guesses ?? []);
  const [numGuesses, setNumGuesses] = useState(props.defaultNumGuesses);
  const [gameId, setGameId] = useState<string | null>(null);

  const [gamemodeSettings, setGamemodeSettings] = useState<WingoConfigProps["gamemodeSettings"]>(
    props.gamemodeSettings
  );

  const [remainingSeconds, setRemainingSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig.seconds
      : getGamemodeDefaultTimerValue(props.page)
  );

  /*
  Keep track of the most recent value for the timer
  So that the value can be used as the default value for the total seconds input element
  (even after the timer is enabled/disabled)
  */
  const [mostRecentTotalSeconds, setMostRecentTotalSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig.seconds
      : getGamemodeDefaultTimerValue(props.page)
  );

  const [currentWord, setCurrentWord] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [inProgress, setInProgress] = useState(true);
  const [inDictionary, setInDictionary] = useState(true);
  const [isIncompleteWord, setIsIncompleteWord] = useState(false);

  const [conundrum, setConundrum] = useState("");
  const [targetWord, setTargetWord] = useState(props.targetWord ?? "");
  // The words which are valid to be used as guesses
  const [wordArray, setWordArray] = useState(props.wordArray ?? []);
  const [targetHint, setTargetHint] = useState("");
  const [targetCategory, setTargetCategory] = useState("");
  const [hasSelectedTargetCategory, sethasSelectedTargetCategory] = useState(false);
  const [hasSubmitLetter, sethasSubmitLetter] = useState(false);
  const [revealedLetterIndexes, setRevealedLetterIndexes] = useState<number[]>([]);

  const defaultLetterStatuses: {
    letter: string;
    status: LetterStatus;
  }[] = DEFAULT_ALPHABET.map((x) => ({
    letter: x,
    status: "not set",
  }));

  defaultLetterStatuses.push({ letter: "-", status: "not set" });
  defaultLetterStatuses.push({ letter: "'", status: "not set" });

  const [letterStatuses, setLetterStatuses] = useState<
    {
      letter: string;
      status: LetterStatus;
    }[]
  >(defaultLetterStatuses);

  // Returns the newly determined target word
  function getTargetWord() {
    // Array of words of the current gamemode length (most modes will choose a word from this array)
    let targetLengthWordArray: { word: string; hint: string }[] = wordLengthMappingsTargets
      .find((x) => x.value === gamemodeSettings.wordLength)
      ?.array.map((x) => ({ word: x, hint: "" }))!;

    switch (props.mode) {
      case "daily":
        const newTarget = getDeterministicArrayItems({ seedType: "today" }, 1, targetLengthWordArray)[0];
        // Load previous attempts at daily (if applicable)
        const daily_word_storage = SaveData.getDailyWordGuesses();

        // The actual daily word and the daily word set in local storage are the same
        if (newTarget.word === daily_word_storage?.dailyWord) {
          // Display the sava data on the word grid
          setGuesses(daily_word_storage.guesses);
          setWordIndex(daily_word_storage.wordIndex);
          setInProgress(daily_word_storage.inProgress);
          setCurrentWord(daily_word_storage.currentWord);
          setInDictionary(daily_word_storage.inDictionary);
        }

        return newTarget;

      case "puzzle":
        // Get a random puzzle (from puzzles_ten.ts)
        // TODO: Expand to have 9, 10 and 11 length puzzles
        return getRandomElementFrom(puzzles_ten);

      case "category":
        // A target category has been manually selected from dropdown
        if (hasSelectedTargetCategory) {
          // Continue using that category
          const targetWordArray = categoryMappings.find((x) => x.name === targetCategory)?.array!;
          return getRandomElementFrom(targetWordArray);
        } else {
          // Otherwise, randomly choose a category (can be changed afterwards)
          setTargetCategory(getRandomElementFrom(categoryMappings).name);
          // A random word from this category is set in a useEffect(), so return
          return;
        }

      case "increasing":
        // There is already a targetWord which is of the needed wordLength
        if (targetWord && targetWord.length === gamemodeSettings.wordLength) {
          return targetWord;
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
            wordLength: getGamemodeDefaultWordLength("wingo/limitless"),
          };
          setGamemodeSettings(newGamemodeSettings);

          targetLengthWordArray = wordLengthMappingsTargets
            .find((x) => x.value === getGamemodeDefaultWordLength("wingo/limitless"))
            ?.array.map((x) => ({ word: x, hint: "" }))!;
        }

        // Choose random word
        return getRandomElementFrom(targetLengthWordArray);

      case "conundrum":
        const newConundrum = getConundrum();
        if (newConundrum) {
          setConundrum(newConundrum.question);
          setTargetWord(newConundrum.answer);
          // All letters revealed from start
          setRevealedLetterIndexes(Array.from({ length: newConundrum.answer.length }).map((_, index) => index));
        }

        return { word: newConundrum?.answer, hint: newConundrum?.question };

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

  // Timer Setup
  React.useEffect(() => {
    if (!gamemodeSettings.timerConfig.isTimed) {
      return;
    }

    const timer = setInterval(() => {
      if (remainingSeconds > 0) {
        setRemainingSeconds(remainingSeconds - 1);
      } else {
        setInDictionary(false);
        setInProgress(false);
      }
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [setRemainingSeconds, remainingSeconds, gamemodeSettings.timerConfig.isTimed]);

  // Save gameplay progress of daily wingo
  React.useEffect(() => {
    if (props.mode === "daily" && targetWord) {
      SaveData.setDailyWordGuesses(targetWord, guesses, wordIndex, inProgress, inDictionary, currentWord);
    }
  }, [targetWord, currentWord, guesses, wordIndex, inProgress, inDictionary]);

  const getValidWordArray = (targetWord: string) => {
    // Valid word array directly specified
    if (props.wordArray) {
      return props.wordArray;
    }
    // Category mode - Find the array which includes the target word
    else if (props.mode === "category") {
      return categoryMappings
        .find((categoryMapping) => categoryMapping.array.some(({ word }) => word === targetWord))
        ?.array.map((x) => x.word)!;
    }
    // All words that are the same length as the target word
    else if (props.enforceFullLengthGuesses) {
      return getAllWordsOfLength(targetWord.length);
    }
    // All words of length up to and including the wordLength (partial and full length guesses)
    else {
      let newWordArray: string[] = [];
      for (let i = MIN_TARGET_WORD_LENGTH; i <= targetWord.length; i++) {
        // Find array containing words of i length
        const currentLengthWordArray = getAllWordsOfLength(i);
        newWordArray = newWordArray.concat(currentLengthWordArray);
      }
      return newWordArray;
    }
  };

  React.useEffect(() => {
    if (!targetWord) {
      return;
    }

    // Update word length every time the target word changes
    if (targetWord) {
      const newGamemodeSettings = {
        ...gamemodeSettings,
        wordLength: targetWord.length,
      };
      setGamemodeSettings(newGamemodeSettings);
    }

    // Show first letter of the target word (if enabled)
    if (gamemodeSettings.isFirstLetterProvided) {
      setCurrentWord(targetWord.charAt(0));
    }

    // Update the currently valid guesses which can be made
    setWordArray(getValidWordArray(targetWord));
  }, [targetWord]);

  // Reset game after change of settings (stops cheating by changing settings partway through a game)
  React.useEffect(() => {
    if (props.page === "campaign/area/level") {
      return;
    }

    ResetGame();

    // Save the latest gamemode settings for this mode
    SaveData.setWingoConfigGamemodeSettings(props.page, gamemodeSettings);
  }, [gamemodeSettings]);

  // Update targetWord every time the targetCategory changes
  React.useEffect(() => {
    if (props.mode !== "category") {
      return;
    }

    // Category may be changed mid-game (so clear anything from before)
    ResetGame();

    const newTarget = getRandomElementFrom(categoryMappings.find((x) => x.name === targetCategory)?.array ?? []);

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
    let intervalId: number;

    if (props.mode !== "puzzle") {
      return;
    }

    // Not tried entering a letter/word yet
    if (!hasSubmitLetter) {
      intervalId = window.setInterval(() => {
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
          targetWord!.length - (gamemodeSettings.puzzleLeaveNumBlanks ?? gamemodeSettings.puzzleLeaveNumBlanks)
        ) {
          return;
        }

        const newrevealedLetterIndexes = revealedLetterIndexes.slice();

        if (revealedLetterIndexes.length === 0) {
          // Start by revealing the first letter
          newrevealedLetterIndexes.push(0);
        } else if (revealedLetterIndexes.length === 1) {
          // Next reveal the last letter
          newrevealedLetterIndexes.push(targetWord!.length - 1);
        } else {
          let newIndex: number;

          // Keep looping to find a random index that hasn't been used yet
          do {
            newIndex = Math.floor(Math.random() * targetWord!.length);
          } while (revealedLetterIndexes.includes(newIndex));

          // Reveal a random letter
          if (newIndex >= 0 && newIndex <= (props.defaultWordLength || props.targetWord?.length!) - 1) {
            // Check index is in the range (0, wordLength-1)
            newrevealedLetterIndexes.push(newIndex);
          }
        }
        setRevealedLetterIndexes(newrevealedLetterIndexes);
      }, gamemodeSettings.puzzleRevealMs);
    }

    return () => {
      window.clearInterval(intervalId);
    };
  }, [props.mode, targetWord, revealedLetterIndexes, hasSubmitLetter]);

  // targetWord generation
  React.useEffect(() => {
    // Don't need to determine a target word, if it is explicitly specified
    if (!inProgress || props.targetWord) {
      return;
    }

    if (!gamemodeSettings.wordLength) {
      return;
    }

    // TODO: This function call is put inside either the ResetGame() function or the useEffect with gamemodeSettings as a dependency
    updateTargetWord();
  }, [
    // Always when category mode (short circuit) or when word length is changed
    props.mode === "category" || gamemodeSettings.wordLength,
    // Puzzle settings are changed
    gamemodeSettings.puzzleLeaveNumBlanks,
    gamemodeSettings.puzzleRevealMs,
    // Game ends or mode is changed
    inProgress,
    props.mode,
  ]);

  // Save the game
  React.useEffect(() => {
    if (!targetWord) {
      return;
    }

    // TODO: Page is its own parameter but is also in the levelProps
    const gameId = SaveData.addGameToHistory(props.page, {
      timestamp: new Date().toISOString(),
      gameCategory: "Wingo",
      page: props.page,
      levelProps: {
        mode: props.mode,
        gamemodeSettings: {
          wordLength: gamemodeSettings.wordLength,
          isFirstLetterProvided: gamemodeSettings.isFirstLetterProvided,
          isHintShown: gamemodeSettings.isHintShown,
          puzzleRevealMs: gamemodeSettings.puzzleRevealMs,
          puzzleLeaveNumBlanks: gamemodeSettings.puzzleLeaveNumBlanks,
          maxLivesConfig: gamemodeSettings.maxLivesConfig,
          wordLengthMaxLimit: gamemodeSettings.wordLengthMaxLimit,
          timerConfig: gamemodeSettings.timerConfig.isTimed
            ? { isTimed: true, seconds: remainingSeconds }
            : { isTimed: false },
        },
        targetWord,
        defaultWordLength: props.defaultWordLength,
        defaultNumGuesses: props.defaultNumGuesses,
        enforceFullLengthGuesses: props.enforceFullLengthGuesses,
        checkInDictionary: props.checkInDictionary,
        wordArray: props.wordArray,
      },
    });

    setGameId(gameId);
  }, [props.page, targetWord]);

  function determineScore(): number | null {
    // Correct conundrum
    if (props.mode === "conundrum" && props.conundrum && currentWord.toUpperCase() === targetWord.toUpperCase()) {
      return 10;
    }
    // Incorrect conundrum
    else if (props.mode === "conundrum" && props.conundrum && currentWord.toUpperCase() !== targetWord.toUpperCase()) {
      return 0;
    }
    // Wingo round
    else if (props.mode !== "conundrum" && props.roundScoringInfo) {
      const pointsLostPerGuess = props.roundScoringInfo?.pointsLostPerGuess ?? 0;
      // Multiply points lost per guess by either the number of letters revealed or the number of guessed used
      const pointsLost =
        props.mode === "puzzle"
          ? (revealedLetterIndexes.length - 1) * pointsLostPerGuess
          : numGuesses * pointsLostPerGuess;

      const score = props.roundScoringInfo.basePoints - pointsLost ?? 0;

      return score;
    }
    // Unexpected round type or Wingo round but with no scoring information
    else {
      return null;
    }
  }

  function ResetGame() {
    if (!inProgress) {
      // Guessed the target word correctly
      const wasCorrect = currentWord.length > 0 && currentWord.toUpperCase() === targetWord?.toUpperCase();

      if (props.gameshowScore === undefined) {
        props.onComplete(wasCorrect);
      } else {
        props.onCompleteGameshowRound?.(wasCorrect, currentWord, targetWord, determineScore());
      }
    }

    setIsIncompleteWord(false);

    // Update word (when first letter provided setting is changed)
    const newCurrentWord = gamemodeSettings.isFirstLetterProvided ? targetWord.charAt(0) : "";
    setCurrentWord(newCurrentWord);

    setGuesses([]);
    setWordIndex(0);
    setInProgress(true);
    setInDictionary(true);
    sethasSubmitLetter(false);
    setConundrum("");
    setRevealedLetterIndexes([]);
    setLetterStatuses(defaultLetterStatuses);

    const newRemainingSeconds = gamemodeSettings.timerConfig.isTimed
      ? gamemodeSettings.timerConfig.seconds
      : mostRecentTotalSeconds;
    setMostRecentTotalSeconds(newRemainingSeconds);
    setRemainingSeconds(newRemainingSeconds);

    const limitlessAndLivesRemaining = props.mode === "limitless" && numGuesses > 1;

    // Don't reset to defaultNumGuesses when there are lives remaining in limitless mode
    if (!limitlessAndLivesRemaining) {
      setNumGuesses(props.defaultNumGuesses);
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

    sethasSubmitLetter(false);
    setRevealedLetterIndexes([]);
    setLetterStatuses(defaultLetterStatuses);

    const newRemainingSeconds = gamemodeSettings.timerConfig.isTimed
      ? gamemodeSettings.timerConfig.seconds
      : mostRecentTotalSeconds;
    setMostRecentTotalSeconds(newRemainingSeconds);
    setRemainingSeconds(newRemainingSeconds);

    const isCorrectAnswer = currentWord.toLowerCase() === targetWord.toLowerCase() && currentWord.length > 0;

    // Add new rows for success in limitless mode
    if (props.mode === "limitless" && isCorrectAnswer) {
      const newLives = getNewLives(numGuesses, wordIndex, gamemodeSettings.maxLivesConfig);
      setNumGuesses(numGuesses + newLives);
    }

    // Remove row for failiure in limitless mode
    if (props.mode === "limitless" && numGuesses > 1 && !isCorrectAnswer) {
      setNumGuesses(numGuesses - 1); // Remove a row
    }

    // Increment word length (only on success) for these modes
    if ((props.mode === "limitless" || props.mode === "increasing") && isCorrectAnswer) {
      const newGamemodeSettings = {
        ...gamemodeSettings,
        wordLength: gamemodeSettings.wordLength + 1,
      };
      setGamemodeSettings(newGamemodeSettings);
    }
  }

  function calculateGoldAwarded(
    wordLength: number,
    /*win_streak: number,*/
    numGuesses: number
  ) {
    // Base amount by gamemode
    const gamemodeGoldMappings = [
      { mode: "daily", value: 1000 },
      { mode: "repeat", value: 50 },
      { mode: "increasing", value: 50 },
      {
        mode: "puzzle",
        value: 20,
      }, // TODO: Balancing, puzzle words are always 10 letters
      { mode: "interlinked", value: 125 },
    ];

    const gamemodeValue = gamemodeGoldMappings.find((x) => x.mode === props.mode)?.value!;

    // Incremental multiplier with wordLength
    const wordLengthGoldMappings = [
      { value: 4, multiplier: 1 },
      { value: 5, multiplier: 1.05 },
      { value: 6, multiplier: 1.25 },
      { value: 7, multiplier: 1.5 },
      { value: 8, multiplier: 2 },
      { value: 9, multiplier: 3 },
      { value: 10, multiplier: 5 },
      { value: 11, multiplier: 7.5 },
    ];

    const wordLengthMultiplier = wordLengthGoldMappings.find((x) => x.value === wordLength)?.multiplier!;

    // Small bonus for early guesses
    const numGuessesGoldMappings = [
      {
        guesses: 1,
        value: 250,
      }, // TODO: Balancing, puzzle words are always 1 guess
      { guesses: 2, value: 100 },
      { guesses: 3, value: 50 },
      { guesses: 4, value: 25 },
      { guesses: 5, value: 10 },
      { guesses: 6, value: 0 },
    ];

    const numGuessesBonus = numGuessesGoldMappings.find((x) => x.guesses === numGuesses)?.value!;

    const goldTotal = Math.round(gamemodeValue * wordLengthMultiplier + numGuessesBonus);
    return goldTotal;
  }

  function onEnter() {
    // Pressing Enter to Continue or Restart (daily mode is strictly one attempt only, so no continue or restart)
    if (!inProgress && props.mode !== "daily") {
      // Correct word and either increasing or limitless mode
      if (
        targetWord?.toUpperCase() === currentWord.toUpperCase() &&
        (props.mode === "increasing" || props.mode === "limitless")
      ) {
        ContinueGame();
      } else {
        ResetGame();
      }

      return;
    }

    // Used all guesses
    if (wordIndex >= numGuesses) {
      return;
    }

    // Start as true until proven otherwise
    setInDictionary(true);

    // Category mode but no target word (to determine the valid category)
    if (props.mode === "category" && !targetWord) {
      return;
    }

    // Don't allow incomplete words (if specified in props)
    if (props.enforceFullLengthGuesses && currentWord.length !== gamemodeSettings.wordLength) {
      setIsIncompleteWord(true);
      return;
    }
    // The word is complete or enforce full length guesses is off
    else {
      setIsIncompleteWord(false);
    }

    // Don't end game prematurely (before wordArray is determined)
    if (wordArray.length === 0 && currentWord.toLowerCase() !== targetWord.toLowerCase()) {
      return;
    }

    let outcome: "success" | "failure" | "in-progress" = "in-progress";

    // If checking against the dictionary is disabled, or is enabled and the word is in the dictionary,
    // or is the target word exactly (to protect against a bug where the target word may not be in the dictionary)
    if (
      props.checkInDictionary === false ||
      wordArray.includes(currentWord.toLowerCase()) ||
      currentWord.toLowerCase() === targetWord.toLowerCase()
    ) {
      // Accepted word
      setGuesses(guesses.concat(currentWord)); // Add word to guesses

      if (currentWord.toUpperCase() === targetWord?.toUpperCase()) {
        // Exact match
        setInProgress(false);
        const goldBanked = calculateGoldAwarded(targetWord.length, wordIndex + 1);
        props.addGold(goldBanked);
        outcome = "success";
      } else if (wordIndex + 1 === numGuesses) {
        // Out of guesses
        setInProgress(false);
        outcome = "failure";
      } else {
        // Not yet guessed
        if (gamemodeSettings.isFirstLetterProvided) {
          setCurrentWord(targetWord?.charAt(0)!);
        } else {
          setCurrentWord(""); // Start new word as empty string
        }
        setWordIndex(wordIndex + 1); // Increment index to indicate new word has been started
        //outcome = "in-progress";
      }
    } else {
      setInDictionary(false);
      setInProgress(false);
      outcome = "failure";
    }

    // Save round to history
    if (outcome !== "in-progress" && gameId) {
      SaveData.addCompletedRoundToGameHistory(gameId, {
        timestamp: new Date().toISOString(),
        gameCategory: "Wingo",
        page: props.page,
        outcome,
        levelProps: {
          mode: props.mode,
          gamemodeSettings: gamemodeSettings,
          targetWord,
          defaultWordLength: props.defaultWordLength,
          defaultNumGuesses: props.defaultNumGuesses,
          enforceFullLengthGuesses: props.enforceFullLengthGuesses,
          checkInDictionary: props.checkInDictionary,
          wordArray: props.wordArray,
          guesses,
        },
      });
    }

    if (gamemodeSettings.timerConfig.isTimed) {
      setRemainingSeconds(gamemodeSettings.timerConfig.seconds);
    }
  }

  function onSubmitLetter(letter: string) {
    if (currentWord.length < gamemodeSettings.wordLength && inProgress) {
      setCurrentWord(currentWord + letter);
      sethasSubmitLetter(true);
    }
  }

  function onSubmitTargetCategory(category: string) {
    if (categoryMappings.find((x) => x.name === category)) {
      setTargetCategory(category);
      sethasSelectedTargetCategory(true);
    }
  }

  function onBackspace() {
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
    page: props.page,
    theme: props.theme,
    setPage: props.setPage,
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
          SaveData.getWingoInterlinkedGamemodeSettings("wingo/interlinked") ?? defaultWingoInterlinkedGamemodeSettings
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
          SaveData.getWingoInterlinkedGamemodeSettings("wingo/crossword") ?? defaultWingoCrosswordGamemodeSettings
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
        onSave={SaveData.setDailyCrossWordGuesses}
        initialConfig={SaveData.getDailyCrossWordGuesses() || undefined}
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
        onSave={SaveData.setWeeklyCrossWordGuesses}
        initialConfig={SaveData.getWeeklyCrossWordGuesses() || undefined}
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
          SaveData.getWingoInterlinkedGamemodeSettings("wingo/crossword/fit") ??
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
      numGuesses={numGuesses}
      guesses={guesses}
      currentWord={currentWord}
      wordIndex={wordIndex}
      inProgress={inProgress}
      inDictionary={inDictionary}
      isIncompleteWord={isIncompleteWord}
      hasSubmitLetter={hasSubmitLetter}
      conundrum={conundrum || ""}
      targetWord={targetWord || ""}
      targetHint={gamemodeSettings.isHintShown ? targetHint : ""}
      targetCategory={targetCategory || ""}
      revealedLetterIndexes={revealedLetterIndexes}
      letterStatuses={letterStatuses}
      page={props.page}
      theme={props.theme}
      settings={props.settings}
      onEnter={onEnter}
      onSubmitLetter={onSubmitLetter}
      onSubmitTargetCategory={onSubmitTargetCategory}
      onBackspace={onBackspace}
      updateGamemodeSettings={updateGamemodeSettings}
      ResetGame={ResetGame}
      ContinueGame={ContinueGame}
      setPage={props.setPage}
      setTheme={props.setTheme}
      gameshowScore={props.gameshowScore}
    ></Wingo>
  );
};

export default WingoConfig;
