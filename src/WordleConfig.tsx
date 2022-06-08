import React, { useState } from "react";
import { Page } from "./App";
import Wordle from "./Wordle";
import { words_three_guessable, words_three_targets } from "./WordArrays/Lengths/words_3";
import { words_four_guessable, words_four_targets } from "./WordArrays/Lengths/words_4";
import { words_five_guessable, words_five_targets } from "./WordArrays/Lengths/words_5";
import { words_six_guessable, words_six_targets } from "./WordArrays/Lengths/words_6";
import { words_seven_guessable, words_seven_targets } from "./WordArrays/Lengths/words_7";
import { words_eight_guessable, words_eight_targets } from "./WordArrays/Lengths/words_8";
import { words_nine_guessable, words_nine_targets } from "./WordArrays/Lengths/words_9";
import { words_ten_guessable, words_ten_targets } from "./WordArrays/Lengths/words_10";
import { words_eleven_guessable, words_eleven_targets } from "./WordArrays/Lengths/words_11";
import { words_puzzles } from "./WordArrays/words_puzzles";
import { SaveData, SettingsData } from "./SaveData";
import { words_dogs } from "./WordArrays/Categories/dogs";
import { words_countries } from "./WordArrays/Categories/countries";
import { words_chemical_elements } from "./WordArrays/Categories/chemical_elements";
import { words_colours } from "./WordArrays/Categories/colours";
import { words_fruits } from "./WordArrays/Categories/fruits";
import { words_sports } from "./WordArrays/Categories/sports";
import { Theme } from "./Themes";
import { WordleInterlinked } from "./WordleInterlinked";
import { words_vegetables } from "./WordArrays/Categories/vegetables";
import { words_pizza_toppings } from "./WordArrays/Categories/pizza_toppings";
import { words_capital_cities } from "./WordArrays/Categories/capital_cities";
import { words_animals } from "./WordArrays/Categories/animals";
import { words_herbs_and_spices } from "./WordArrays/Categories/herbs_and_spices";
import { words_meats_and_fish } from "./WordArrays/Categories/meats_and_fish";
import { words_gemstones } from "./WordArrays/Categories/gemstones";
import { Chance } from "chance";
import { generateConundrum } from "./CountdownLetters/Conundrum";

export interface WordleConfigProps {
  mode:
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
  gamemodeSettings?: {
    wordLength?: boolean;
    firstLetter?: boolean;
    showHint?: boolean;
    timer?: { isTimed: true; seconds: number } | { isTimed: false };
  };
  conundrum?: string;
  targetWord?: string;
  wordArray?: string[];
  enforceFullLengthGuesses: boolean;
  defaultWordLength?: number;
  puzzleRevealMs: number;
  puzzleLeaveNumBlanks: number;
  defaultnumGuesses: number;
  guesses?: string[];
  checkInDictionary?: boolean;
  finishingButtonText?: string;
  onComplete?: (wasCorrect: boolean, answer: string, targetAnswer: string, score: number | null) => void;
  roundScoringInfo?: { basePoints: number; pointsLostPerGuess: number };
  gameshowScore?: number;
}

interface Props extends WordleConfigProps {
  page: Page;
  theme?: Theme;
  settings: SettingsData;
  setPage: (page: Page) => void;
  addGold: (gold: number) => void;
  setTheme: (theme: Theme) => void;
}

export const wordLengthMappingsGuessable = [
  { value: 3, array: words_three_guessable },
  { value: 4, array: words_four_guessable },
  { value: 5, array: words_five_guessable },
  { value: 6, array: words_six_guessable },
  { value: 7, array: words_seven_guessable },
  { value: 8, array: words_eight_guessable },
  { value: 9, array: words_nine_guessable },
  { value: 10, array: words_ten_guessable },
  { value: 11, array: words_eleven_guessable },
];

export const wordLengthMappingsTargets = [
  { value: 3, array: words_three_targets },
  { value: 4, array: words_four_targets },
  { value: 5, array: words_five_targets },
  { value: 6, array: words_six_targets },
  { value: 7, array: words_seven_targets },
  { value: 8, array: words_eight_targets },
  { value: 9, array: words_nine_targets },
  { value: 10, array: words_ten_targets },
  { value: 11, array: words_eleven_targets },
];

export const categoryMappings = [
  { name: "Animals", array: words_animals },
  { name: "Capital Cities", array: words_capital_cities },
  { name: "Chemical Elements", array: words_chemical_elements },
  { name: "Colours", array: words_colours },
  { name: "Countries", array: words_countries },
  { name: "Dog Breeds", array: words_dogs },
  { name: "Fruits", array: words_fruits },
  { name: "Gemstones", array: words_gemstones },
  { name: "Herbs and Spices", array: words_herbs_and_spices },
  { name: "Meats and Fish", array: words_meats_and_fish },
  { name: "Pizza Toppings", array: words_pizza_toppings },
  { name: "Puzzles", array: words_puzzles },
  { name: "Sports", array: words_sports },
  { name: "Vegetables", array: words_vegetables },
];

export function getNewLives(numGuesses: number, wordIndex: number): number {
  // Calculate the number of rows not used
  const extraRows = numGuesses - (wordIndex + 1);
  // TODO: A game option toggle could change this value (e.g extraRows would remove cap on new lives)
  const MAX_NEW_LIVES = 5;
  // The number of new lives is the number of extra rows (capped at a max of above variable)
  const newLives = Math.min(extraRows, MAX_NEW_LIVES);
  return newLives;
}

export function getWordSummary(mode: string, word: string, targetWord: string, inDictionary: boolean) {
  const simpleStatusModes = ["letters_categories"];
  // Character and status array
  let defaultCharacterStatuses = (word || "").split("").map((character, index) => ({
    character: character,
    status: getLetterStatus(character, index, targetWord, inDictionary),
  }));

  if (simpleStatusModes.includes(mode) && word === targetWord) {
    let finalCharacterStatuses = defaultCharacterStatuses.map((x) => {
      x.status = "correct";
      return x;
    });
    return finalCharacterStatuses;
  } else if (simpleStatusModes.includes(mode) && word !== targetWord) {
    let finalCharacterStatuses = defaultCharacterStatuses.map((x) => {
      x.status = "incorrect";
      return x;
    });
    return finalCharacterStatuses;
  } else {
    // Changing status because of repeated letters
    let finalCharacterStatuses = defaultCharacterStatuses.map((x, index) => {
      // If there is a green tile of a letter, don't show any orange tiles
      if (
        x.status === "contains" &&
        defaultCharacterStatuses.some((y) => y.character === x.character && y.status === "correct")
      ) {
        x.status = "not in word";
      }
      // Only ever show 1 orange tile of each letter
      if (
        x.status === "contains" &&
        defaultCharacterStatuses.findIndex((y) => y.character === x.character && y.status === "contains") !== index
      ) {
        x.status = "not in word";
      }
      return x;
    });
    return finalCharacterStatuses;
  }
}

export function getLetterStatus(
  letter: string,
  index: number,
  targetWord: string,
  inDictionary: boolean
): "incorrect" | "contains" | "correct" | "not set" | "not in word" {
  var status: "incorrect" | "contains" | "correct" | "not set" | "not in word";

  if (!inDictionary) {
    // Red
    status = "incorrect";
  } else if (targetWord?.[index]?.toUpperCase() === letter?.toUpperCase()) {
    // Green
    status = "correct";
  } else if (targetWord?.toUpperCase().includes(letter?.toUpperCase())) {
    // Yellow
    status = "contains";
  } else {
    // Grey
    status = "not in word";
  }

  return status;
}

/**
 * Gets a number guaranteed to be the same throughout today, and guaranteed to change every day.
 * @returns Seed value.
 */
function todaySeed(): number {
  return Number(
    new Date().toLocaleDateString("en-GB", { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/[^\d]/g, "")
  );
}

/**
 * Gets a number guaranteed to be the same for all days of this week, and guaranteed to change every Monday.
 * @returns Seed value.
 */
function thisWeekSeed(): number {
  const mondayThisWeek = new Date();

  while (mondayThisWeek.getDay() !== 1) {
    mondayThisWeek.setDate(mondayThisWeek.getDate() - 1);
  }

  return Number(
    mondayThisWeek
      .toLocaleDateString("en-GB", { year: "numeric", month: "2-digit", day: "2-digit" })
      .replace(/[^\d]/g, "")
  );
}

/**
 * Gets a number of items from an array, guaranteed to be deterministic based on the seed.
 * @param seed Seed of the returned items.
 * @param numItems Number of items to return.
 * @param array Array of possible items.
 * @returns Deterministic items from array as per the seed.
 */
function getDeterministicArrayItems<T>(
  seed: { seedType: "today" } | { seedType: "this-week" } | { seedType: "custom"; value: number },
  numItems: number,
  array: T[]
): T[] {
  const seedValue = (() => {
    switch (seed.seedType) {
      case "today":
        return todaySeed();

      case "this-week":
        return thisWeekSeed();

      case "custom":
        return seed.value;
    }
  })();

  const chance = new Chance(seedValue);

  return chance.shuffle(array.slice()).slice(0, numItems);
}

const WordleConfig: React.FC<Props> = (props) => {
  const [guesses, setGuesses] = useState<string[]>(props.guesses ?? []);
  const [numGuesses, setNumGuesses] = useState(props.defaultnumGuesses);
  const [gameId, setGameId] = useState<string | null>(null);

  // Gamemode settings
  const [isFirstLetterProvided, setIsFirstLetterProvided] = useState(props.gamemodeSettings?.firstLetter ?? false);
  const [isHintShown, setIsHintShown] = useState(props.gamemodeSettings?.showHint ?? false);

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

  const [currentWord, setCurrentWord] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [inProgress, setinProgress] = useState(true);
  const [inDictionary, setinDictionary] = useState(true);
  const [isIncompleteWord, setisIncompleteWord] = useState(false);
  const [wordLength, setWordLength] = useState(
    // Take highest of either defaultWordLength and targetWord length (if specified)
    Math.max.apply(
      undefined,
      [props.defaultWordLength!, props.targetWord?.length!].filter((x) => x)
    )
  );
  const [conundrum, setConundrum] = useState("");
  const [targetWord, setTargetWord] = useState(props.targetWord ? props.targetWord : "");
  // The words which are valid to be used as guesses
  const [wordArray, setWordArray] = useState(props.wordArray ? props.wordArray : []);
  const [targetHint, setTargetHint] = useState("");
  const [targetCategory, setTargetCategory] = useState("");
  const [hasSelectedTargetCategory, sethasSelectedTargetCategory] = useState(false);
  const [hasSubmitLetter, sethasSubmitLetter] = useState(false);
  const [revealedLetterIndexes, setRevealedLetterIndexes] = useState<number[]>([]);

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
    { letter: "-", status: "" },
    { letter: "'", status: "" },
  ];

  const [letterStatuses, setletterStatuses] = useState<
    {
      letter: string;
      status: "" | "contains" | "correct" | "not set" | "not in word";
    }[]
  >(defaultLetterStatuses);

  function generateTargetWord() {
    // Array of words to choose from
    let targetWordArray: { word: string; hint: string }[] = [];
    // The singular word chosen
    let newTarget;

    switch (props.mode) {
      case "daily":
        newTarget = getDeterministicArrayItems({ seedType: "today" }, 1, targetWordArray)[0];
        console.log(
          `%cMode:%c ${props.mode}\n%cHint:%c ${newTarget.hint || "-"}\n%cWord:%c ${newTarget.word || "-"}`,
          "font-weight: bold",
          "font-weight: normal",
          "font-weight: bold",
          "font-weight: normal",
          "font-weight: bold",
          "font-weight: normal"
        );

        if (newTarget.word) {
          setTargetWord(newTarget.word);
        }

        if (isHintShown && newTarget.hint) {
          setTargetHint(newTarget.hint);
        }

        // Load previous attempts at daily (if applicable)
        const daily_word_storage = SaveData.getDailyWordGuesses();

        // The actual daily word and the daily word set in local storage are the same
        if (newTarget.word === daily_word_storage?.dailyWord) {
          // Display the sava data on the word grid
          setGuesses(daily_word_storage.guesses);
          setWordIndex(daily_word_storage.wordIndex);
          setinProgress(daily_word_storage.inProgress);
          setCurrentWord(daily_word_storage.currentWord);
          setinDictionary(daily_word_storage.inDictionary);
        }

        return;

      case "puzzle":
        // Get a random puzzle (from words_puzzles.ts)
        // TODO: Expand to have 9, 10 and 11 length puzzles
        const puzzle = words_puzzles[Math.round(Math.random() * words_puzzles.length - 1)];

        // Log the current gamemode and the target word
        console.log(
          `%cMode:%c ${props.mode}\n%cHint:%c ${puzzle.hint || "-"}\n%cWord:%c ${puzzle.word || "-"}`,
          "font-weight: bold",
          "font-weight: normal",
          "font-weight: bold",
          "font-weight: normal",
          "font-weight: bold",
          "font-weight: normal"
        );

        if (puzzle.word) {
          setTargetWord(puzzle.word);
        }

        if (isHintShown && puzzle.hint) {
          setTargetHint(puzzle.hint);
        }

        return;

      case "category":
        // A target category has been manually selected from dropdown
        if (hasSelectedTargetCategory) {
          // Continue using that category
          targetWordArray = categoryMappings.find((x) => x.name === targetCategory)?.array!;
        } else {
          // Otherwise, randomly choose a category (can be changed afterwards)
          const random_category = categoryMappings[Math.round(Math.random() * (categoryMappings.length - 1))];
          setTargetCategory(random_category.name);
          // A random word from this category is set in a useEffect(), so return
          return;
        }
        break;

      case "increasing":
        // There is already a targetWord which is of the needed wordLength
        if (targetWord && targetWord.length === wordLength) {
          return;
        }

        // There is no array for the current wordLength
        if (!targetWordArray) {
          // Just reset (reached the end)
          ResetGame();
          return;
        }

        break;

      case "limitless":
        // There is already a targetWord which is of the needed wordLength
        if (targetWord && targetWord.length === wordLength) {
          return;
        }

        // There is no array for the current wordLength
        if (!targetWordArray) {
          // Don't reset otherwise the number of lives would be lost, just go back to 4 letter words
          setWordLength(4);
          targetWordArray = wordLengthMappingsTargets
            .find((x) => x.value === 4)
            ?.array.map((x) => ({ word: x, hint: "" }))!;
        }

        break;

      case "conundrum":
        const newConundrum = generateConundrum();
        if (newConundrum) {
          console.log(
            `%cMode:%c ${props.mode}\n%cWord:%c ${newConundrum.answer || "-"}`,
            "font-weight: bold",
            "font-weight: normal",
            "font-weight: bold",
            "font-weight: normal"
          );

          setConundrum(newConundrum.question);
          setTargetWord(newConundrum.answer);
          // All letters revealed from start
          setRevealedLetterIndexes(Array.from({ length: newConundrum.answer.length }).map((_, index) => index));

          return;
        }
        break;

      default:
        // Other modes choose a target word based on length
        targetWordArray = wordLengthMappingsTargets
          .find((x) => x.value === wordLength)
          ?.array.map((x) => ({ word: x, hint: "" }))!;
    }

    // A new target word needs to be determined (not returned from function yet)
    if (targetWordArray) {
      newTarget = targetWordArray[Math.round(Math.random() * (targetWordArray.length - 1))];

      // Log the current gamemode and the target word
      console.log(
        `%cMode:%c ${props.mode}\n%cHint:%c ${newTarget.hint || "-"}\n%cWord:%c ${newTarget.word || "-"}`,
        "font-weight: bold",
        "font-weight: normal",
        "font-weight: bold",
        "font-weight: normal",
        "font-weight: bold",
        "font-weight: normal"
      );

      if (newTarget.word) {
        setTargetWord(newTarget.word);
      }

      if (newTarget.hint) {
        setTargetHint(newTarget.hint);
      }
    }
  }

  // Timer Setup
  React.useEffect(() => {
    if (!isTimerEnabled) {
      return;
    }

    const timer = setInterval(() => {
      if (remainingSeconds > 0) {
        setRemainingSeconds(remainingSeconds - 1);
      } else {
        setinDictionary(false);
        setinProgress(false);
      }
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [setRemainingSeconds, remainingSeconds, isTimerEnabled]);

  // Save gameplay progress of daily wingo
  React.useEffect(() => {
    if (props.mode === "daily" && targetWord) {
      SaveData.setDailyWordGuesses(targetWord, guesses, wordIndex, inProgress, inDictionary, currentWord);
    }
  }, [targetWord, currentWord, guesses, wordIndex, inProgress, inDictionary]);

  React.useEffect(() => {
    if (!targetWord) {
      return;
    }

    // Update word length every time the target word changes
    if (targetWord) {
      setWordLength(targetWord.length);
    }

    // Show first letter of the target word (if enabled)
    if (isFirstLetterProvided) {
      setCurrentWord(targetWord.charAt(0));
    }

    let wordArray: string[] = [];

    // Valid word array directly specified
    if (props.wordArray) {
      wordArray = props.wordArray;
    }
    // Category mode - Find the array which includes the target word
    else if (props.mode === "category") {
      wordArray = categoryMappings
        .find((categoryMapping) => categoryMapping.array.some(({ word }) => word === targetWord))
        ?.array.map((x) => x.word)!;
    }
    // Find the valid array using wordLength
    else {
      // All arrays containing words of length up to and including the wordLength combined together (full and partial length guesses)
      for (let i = 3; i <= wordLength; i++) {
        // Find array containing words of i length
        const currentLengthWordArray = wordLengthMappingsGuessable.find((x) => x.value === i)?.array!;
        if (currentLengthWordArray) {
          // Add array to valid words
          wordArray = wordArray.concat(currentLengthWordArray);
        }
      }
    }

    // When full length guesses is enforced, to be a valid guess, the guess must be of the current wordLength
    if (props.enforceFullLengthGuesses) {
      wordArray = wordArray.filter((word) => word.length === wordLength);
    }

    // Update the currently valid guesses which can be made
    setWordArray(wordArray);
  }, [targetWord]);

  // Update gamemode with new gamemode settings
  React.useEffect(() => {
    if (isTimerEnabled) {
      // Reset time left
      setRemainingSeconds(totalSeconds);
    }

    if (isFirstLetterProvided) {
      setCurrentWord(targetWord.charAt(0));
    }
    // firstLetterProvided now disabled (but first letter remains from when it was enabled)
    else if (currentWord.length > 0) {
      ResetGame();
      return;
    }

    // If guesses can't be found
    if (!guesses || !guesses[0]) {
      return;
    }

    const letterSubmittedFirstLetterEnabled = isFirstLetterProvided && guesses[0].length >= 2;
    const letterSubmittedFirstLetterDisabled = !isFirstLetterProvided && guesses[0].length >= 1;

    // User has starting making guesses
    const letterSubmitted = letterSubmittedFirstLetterEnabled || letterSubmittedFirstLetterDisabled;

    // Reset game after change of settings (stops cheating by changing settings partway through a game)
    if (inProgress && letterSubmitted) {
      ResetGame();
    }
  }, [/* TODO: Changing wordLength setting mid-game */ isFirstLetterProvided, isHintShown, isTimerEnabled]);

  // Update targetWord every time the targetCategory changes
  React.useEffect(() => {
    if (props.mode === "category") {
      // Category may be changed mid-game (so clear anything from before)
      ResetGame();

      const wordArray = categoryMappings.find((x) => x.name === targetCategory)?.array;

      if (!wordArray) {
        return;
      }

      const newTarget = wordArray[Math.round(Math.random() * (wordArray.length - 1))];
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
    }
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

    setletterStatuses(letterStatusesCopy);
  }, [guesses, wordIndex]);

  // Reveals letters of read only puzzle row periodically
  React.useEffect(() => {
    let intervalId: number;

    if (props.mode === "puzzle" && !hasSubmitLetter) {
      // Not tried entering a letter/word yet
      intervalId = window.setInterval(() => {
        // This return is needed to prevent a letter being revealed after trying to enter a word (because an interval was queued)
        if (hasSubmitLetter) {
          return;
        }

        if (!targetWord) {
          return;
        }

        if (
          // Stop revealing letters when there is only (props.puzzleLeaveNumBlanks) left to reveal
          revealedLetterIndexes.length >=
          targetWord!.length - props.puzzleLeaveNumBlanks
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
            newIndex = Math.round(Math.random() * (targetWord!.length - 1));
          } while (revealedLetterIndexes.includes(newIndex));

          // Reveal a random letter
          if (newIndex >= 0 && newIndex <= (props.defaultWordLength || props.targetWord?.length!) - 1) {
            // Check index is in the range (0, wordLength-1)
            newrevealedLetterIndexes.push(newIndex);
          }
        }
        setRevealedLetterIndexes(newrevealedLetterIndexes);
      }, props.puzzleRevealMs);
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

    generateTargetWord();
  }, [/* Short circuit boolean evaluation */ props.mode === "category" || wordLength, inProgress, props.mode]);

  // Save the game
  React.useEffect(() => {
    if (!targetWord) {
      return;
    }

    const gameId = SaveData.addGameToHistory(props.page, {
      timestamp: new Date().toISOString(),
      gameCategory: "wingo",
      levelProps: {
        mode: props.mode,
        // TODO: firstLetterProvided and timerEnabled are no longer apart of WordleConfigProps
        //firstLetterProvided: isFirstLetterProvided,
        //timerEnabled: isTimerEnabled,
        puzzleLeaveNumBlanks: props.puzzleLeaveNumBlanks,
        puzzleRevealMs: props.puzzleRevealMs,
        targetWord,
        defaultWordLength: props.defaultWordLength,
        defaultnumGuesses: props.defaultnumGuesses,
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
    // Lingo round
    else if (props.mode !== "conundrum" && props.roundScoringInfo) {
      const pointsLost =
        props.mode === "puzzle"
          ? (revealedLetterIndexes.length - 1) * props.roundScoringInfo?.pointsLostPerGuess
          : numGuesses * props.roundScoringInfo.pointsLostPerGuess;

      const score = props.roundScoringInfo.basePoints - pointsLost;

      return score;
    }
    // Unexpected round type or Lingo round but with no scoring information
    else {
      return null;
    }
  }

  function ResetGame() {
    if (currentWord.length > 0) {
      props.onComplete?.(
        currentWord.toUpperCase() === targetWord?.toUpperCase(),
        currentWord,
        targetWord,
        determineScore()
      );
    }
    setisIncompleteWord(false);
    generateTargetWord();
    setGuesses([]);
    setCurrentWord("");
    setWordIndex(0);
    setinProgress(true);
    setinDictionary(true);
    sethasSubmitLetter(false);
    setConundrum("");
    setRevealedLetterIndexes([]);
    setletterStatuses(defaultLetterStatuses);
    if (isTimerEnabled) {
      // Reset the timer if it is enabled in the game options
      setRemainingSeconds(totalSeconds);
    }
    if (props.mode !== "limitless" || numGuesses <= 1) {
      // Ending of any game mode
      setNumGuesses(props.defaultnumGuesses);
      if (props.mode !== "category") {
        setWordLength(props.defaultWordLength || targetWord.length);
      }
    } else {
      // Game mode is limitless and there are still rows
      setNumGuesses(numGuesses - 1); // Remove a row
    }
  }

  function ContinueGame() {
    setGuesses([]);
    setCurrentWord("");
    setWordIndex(0);
    setinProgress(true);
    setinDictionary(true);
    setWordLength(wordLength + 1);
    sethasSubmitLetter(false);
    setRevealedLetterIndexes([]);
    setletterStatuses(defaultLetterStatuses);

    if (isTimerEnabled) {
      setRemainingSeconds(totalSeconds);
    }

    if (props.mode === "limitless") {
      const newLives = getNewLives(numGuesses, wordIndex);
      setNumGuesses(numGuesses + newLives);
    }
  }

  function calculateGoldAwarded(
    wordLength: number,
    /*win_streak: number,*/
    numGuesses: number
  ) {
    // Base amount by gamemode
    const gamemode_Gold_Mappings = [
      { mode: "daily", value: 1000 },
      { mode: "repeat", value: 50 },
      { mode: "increasing", value: 50 },
      {
        mode: "puzzle",
        value: 20,
      }, // TODO: Balancing, puzzle words are always 10 letters
      { mode: "interlinked", value: 125 },
    ];

    const gamemode_value = gamemode_Gold_Mappings.find((x) => x.mode === props.mode)?.value!;

    // Incremental multiplier with wordLength
    const wordLength_Gold_Mappings = [
      { value: 4, multiplier: 1 },
      { value: 5, multiplier: 1.05 },
      { value: 6, multiplier: 1.25 },
      { value: 7, multiplier: 1.5 },
      { value: 8, multiplier: 2 },
      { value: 9, multiplier: 3 },
      { value: 10, multiplier: 5 },
      { value: 11, multiplier: 7.5 },
    ];

    const wordLength_multiplier = wordLength_Gold_Mappings.find((x) => x.value === wordLength)?.multiplier!;

    // Small bonus for early guesses
    const numGuesses_Gold_Mappings = [
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

    const numGuesses_bonus = numGuesses_Gold_Mappings.find((x) => x.guesses === numGuesses)?.value!;

    const goldTotal = Math.round(gamemode_value * wordLength_multiplier + numGuesses_bonus);
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
    setinDictionary(true);

    // Category mode but no target word (to determine the valid category)
    if (props.mode === "category" && !targetWord) {
      return;
    }

    // Don't allow incomplete words (if specified in props)
    if (props.enforceFullLengthGuesses && currentWord.length !== wordLength) {
      setisIncompleteWord(true);
      return;
    }
    // The word is complete or enforce full length guesses is off
    else {
      setisIncompleteWord(false);
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
        setinProgress(false);
        const goldBanked = calculateGoldAwarded(targetWord.length, wordIndex + 1);
        props.addGold(goldBanked);
        outcome = "success";
      } else if (wordIndex + 1 === numGuesses) {
        // Out of guesses
        setinProgress(false);
        outcome = "failure";
      } else {
        // Not yet guessed
        if (isFirstLetterProvided) {
          setCurrentWord(targetWord?.charAt(0)!);
        } else {
          setCurrentWord(""); // Start new word as empty string
        }
        setWordIndex(wordIndex + 1); // Increment index to indicate new word has been started
        //outcome = "in-progress";
      }
    } else {
      setinDictionary(false);
      setinProgress(false);
      outcome = "failure";
    }

    // Save round to history
    if (outcome !== "in-progress" && gameId) {
      SaveData.addCompletedRoundToGameHistory(gameId, {
        timestamp: new Date().toISOString(),
        gameCategory: "wingo",

        outcome,
        levelProps: {
          mode: props.mode,
          //firstLetterProvided: isFirstLetterProvided,
          //timerEnabled: isTimerEnabled,
          puzzleLeaveNumBlanks: props.puzzleLeaveNumBlanks,
          puzzleRevealMs: props.puzzleRevealMs,
          targetWord,
          defaultWordLength: props.defaultWordLength,
          defaultnumGuesses: props.defaultnumGuesses,
          enforceFullLengthGuesses: props.enforceFullLengthGuesses,
          checkInDictionary: props.checkInDictionary,
          wordArray: props.wordArray,
          guesses,
        },
      });
    }

    if (isTimerEnabled) {
      setRemainingSeconds(totalSeconds);
    }
  }

  function onSubmitLetter(letter: string) {
    if (currentWord.length < wordLength && inProgress) {
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
      if (currentWord.length === 1 && isFirstLetterProvided) {
        return; // Don't allow backspace
      }
      // If there is a letter to remove
      setCurrentWord(currentWord.substring(0, currentWord.length - 1));
    }
  }

  function generateSettings(): React.ReactNode {
    let settings;

    settings = (
      <>
        {props.gamemodeSettings?.wordLength !== undefined && (
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
        )}
        {props.gamemodeSettings?.firstLetter !== undefined && (
          <label>
            <input
              checked={isFirstLetterProvided}
              type="checkbox"
              onChange={(e) => {
                setIsFirstLetterProvided(!isFirstLetterProvided);
              }}
            ></input>
            First Letter Provided
          </label>
        )}
        {props.gamemodeSettings?.showHint !== undefined && (
          <label>
            <input
              checked={isHintShown}
              type="checkbox"
              onChange={(e) => {
                setIsHintShown(!isHintShown);
              }}
            ></input>
            Hints
          </label>
        )}
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

  if (props.mode === "interlinked") {
    return (
      <WordleInterlinked
        wordArrayConfig={{ type: "length" }}
        displayHints={false}
        provideWords={false}
        numWords={2}
        minWordLength={props.defaultWordLength ? props.defaultWordLength : 5}
        maxWordLength={props.defaultWordLength ? props.defaultWordLength : 5}
        numGridGuesses={6}
        theme={props.theme}
        settings={props.settings}
        onComplete={props.onComplete}
      />
    );
  }

  if (props.mode === "crossword") {
    return (
      <WordleInterlinked
        wordArrayConfig={{ type: "category" }}
        displayHints={true}
        provideWords={false}
        numWords={6}
        minWordLength={props.defaultWordLength ? props.defaultWordLength - 3 : 2}
        maxWordLength={props.defaultWordLength ? props.defaultWordLength + 3 : 8}
        numWordGuesses={10}
        numGridGuesses={6}
        theme={props.theme}
        settings={props.settings}
      />
    );
  }

  if (props.mode === "crossword/daily") {
    return (
      <WordleInterlinked
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
        displayHints={true}
        provideWords={false}
        numWords={6}
        minWordLength={props.defaultWordLength ? props.defaultWordLength - 3 : 2}
        maxWordLength={props.defaultWordLength ? props.defaultWordLength + 3 : 8}
        numWordGuesses={10}
        numGridGuesses={6}
        theme={props.theme}
        settings={props.settings}
      />
    );
  }

  if (props.mode === "crossword/weekly") {
    return (
      <WordleInterlinked
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
        displayHints={true}
        provideWords={false}
        numWords={6}
        minWordLength={props.defaultWordLength ? props.defaultWordLength - 3 : 2}
        maxWordLength={props.defaultWordLength ? props.defaultWordLength + 3 : 8}
        numWordGuesses={10}
        numGridGuesses={6}
        theme={props.theme}
        settings={props.settings}
        onComplete={props.onComplete}
      />
    );
  }

  if (props.mode === "crossword/fit") {
    return (
      <WordleInterlinked
        wordArrayConfig={{ type: "length" }}
        displayHints={false}
        provideWords={true}
        fitRestriction={0}
        numWords={6}
        minWordLength={6}
        maxWordLength={6}
        numWordGuesses={0}
        numGridGuesses={1}
        theme={props.theme}
        settings={props.settings}
        onComplete={props.onComplete}
      />
    );
  }

  return (
    <Wordle
      isCampaignLevel={props.page === "campaign/area/level"}
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
      targetHint={isHintShown ? targetHint : ""}
      targetCategory={targetCategory || ""}
      puzzleRevealMs={props.puzzleRevealMs}
      puzzleLeaveNumBlanks={props.puzzleLeaveNumBlanks}
      revealedLetterIndexes={revealedLetterIndexes}
      letterStatuses={letterStatuses}
      finishingButtonText={props.finishingButtonText}
      theme={props.theme}
      settings={props.settings}
      onEnter={onEnter}
      onSubmitLetter={onSubmitLetter}
      onSubmitTargetCategory={onSubmitTargetCategory}
      onBackspace={onBackspace}
      ResetGame={ResetGame}
      ContinueGame={ContinueGame}
      setPage={props.setPage}
      setTheme={props.setTheme}
      gameshowScore={props.gameshowScore}
    ></Wordle>
  );
};

export default WordleConfig;
