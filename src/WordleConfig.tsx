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
    | "crossword";
  targetWord?: string;
  wordArray?: string[];
  enforceFullLengthGuesses: boolean;
  firstLetterProvided: boolean;
  timerConfig: { isTimed: false } | { isTimed: true; seconds: number };
  keyboard: boolean;
  showHint?: boolean;
  defaultWordLength?: number;
  puzzleRevealMs: number;
  puzzleLeaveNumBlanks: number;
  defaultnumGuesses: number;
  guesses?: string[];
  checkInDictionary?: boolean;
  finishingButtonText?: string;
  onComplete?: (wasCorrect: boolean) => void;
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
  // Character and status array
  let defaultCharacterStatuses = (word || "").split("").map((character, index) => ({
    character: character,
    status: getLetterStatus(character, index, targetWord, inDictionary),
  }));

  if (mode === "letters_categories" && word === targetWord) {
    let finalCharacterStatuses = defaultCharacterStatuses.map((x) => {
      x.status = "correct";
      return x;
    });
    return finalCharacterStatuses;
  } else if (mode === "letters_categories" && word !== targetWord) {
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
  const [currentWord, setCurrentWord] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [inProgress, setinProgress] = useState(true);
  const [inDictionary, setinDictionary] = useState(true);
  const [isIncompleteWord, setisIncompleteWord] = useState(false);
  const [wordLength, setWordLength] = useState(props.defaultWordLength || props.targetWord?.length!);
  const [targetWord, setTargetWord] = useState(props.targetWord ? props.targetWord : "");
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

  const [seconds, setSeconds] = useState(props.timerConfig.isTimed ? props.timerConfig.seconds : 0);

  function generateTargetWord() {
    // Most modes choose a target word based on length (will be reassigned if not one of these modes)
    let targetWordArray = wordLengthMappingsTargets
      .find((x) => x.value === wordLength)
      ?.array.map((x) => ({ word: x, hint: "" }))!;

    let newTarget;

    switch (props.mode) {
      case "daily":
        newTarget = getDeterministicArrayItems({ seedType: "today" }, 1, targetWordArray)[0];
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
        const puzzle = words_puzzles[Math.round(Math.random() * words_puzzles.length - 1)];
        setTargetHint(puzzle.hint);

        // Log the current gamemode and the target word
        console.log(
          `%cMode:%c ${props.mode}\n%cHint:%c ${puzzle.hint}\n%cWord:%c ${puzzle.word}`,
          "font-weight: bold",
          "font-weight: normal",
          "font-weight: bold",
          "font-weight: normal",
          "font-weight: bold",
          "font-weight: normal"
        );
        setTargetWord(puzzle.word);
        setTargetHint(puzzle.hint);
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
    }

    // A new target word can be determined
    if (targetWordArray) {
      newTarget = targetWordArray[Math.round(Math.random() * (targetWordArray.length - 1))];

      // Log the current gamemode and the target word
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
  }

  // Timer Setup
  React.useEffect(() => {
    if (!props.timerConfig.isTimed) {
      return;
    }

    const timer = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      } else {
        setinDictionary(false);
        setinProgress(false);
      }
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [setSeconds, seconds, props.timerConfig.isTimed]);

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

    // Show first letter of the target word (if enabled)
    if (props.firstLetterProvided) {
      if (props.targetWord) {
        setCurrentWord(props.targetWord.charAt(0));
      } else {
        setCurrentWord(targetWord.charAt(0));
      }
    }

    // Update word length every time the target word changes during category mode
    if (props.mode === "category") {
      if (targetWord) {
        setWordLength(targetWord.length);
      }
    }
  }, [targetWord]);

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
        firstLetterProvided: props.firstLetterProvided,
        puzzleLeaveNumBlanks: props.puzzleLeaveNumBlanks,
        puzzleRevealMs: props.puzzleRevealMs,
        targetWord,
        defaultWordLength: props.defaultWordLength,
        defaultnumGuesses: props.defaultnumGuesses,
        enforceFullLengthGuesses: props.enforceFullLengthGuesses,
        keyboard: props.keyboard,
        timerConfig: props.timerConfig,
        checkInDictionary: props.checkInDictionary,
        wordArray: props.wordArray,
      },
    });

    setGameId(gameId);
  }, [props.page, targetWord]);

  function ResetGame() {
    props.onComplete?.(currentWord.toLowerCase() === targetWord.toLowerCase());
    setGuesses([]);
    setCurrentWord("");
    setWordIndex(0);
    setinProgress(true);
    setinDictionary(true);
    sethasSubmitLetter(false);
    setRevealedLetterIndexes([]);
    setletterStatuses(defaultLetterStatuses);
    if (props.timerConfig.isTimed) {
      // Reset the timer if it is enabled in the game options
      setSeconds(props.timerConfig.seconds);
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
    props.onComplete?.(currentWord.toLowerCase() === targetWord.toLowerCase());
    setGuesses([]);
    setCurrentWord("");
    setWordIndex(0);
    setinProgress(true);
    setinDictionary(true);
    setWordLength(wordLength + 1);
    sethasSubmitLetter(false);
    setRevealedLetterIndexes([]);
    setletterStatuses(defaultLetterStatuses);

    if (props.timerConfig.isTimed) {
      setSeconds(props.timerConfig.seconds);
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
    // Pressing Enter to Continue or Restart
    if (!inProgress) {
      // Daily mode is strictly one attempt only (no continue or restart)
      if (props.mode !== "daily") {
        if (
          targetWord?.toUpperCase() === currentWord.toUpperCase() &&
          (props.mode === "increasing" || props.mode === "limitless")
        ) {
          ContinueGame();
        } else {
          ResetGame();
        }
      }
      return;
    }

    // Start as true until proven otherwise
    setinDictionary(true);

    let outcome: "success" | "failure" | "in-progress" = "in-progress";

    // Don't allow incomplete words (if specified in props)
    if (props.enforceFullLengthGuesses) {
      if (currentWord.length !== wordLength) {
        // Incomplete (length of) word
        setisIncompleteWord(true);
        return;
      }
    }

    // Reached here, the word is complete or enforce full length guesses is off
    setisIncompleteWord(false);

    if (wordIndex >= props.defaultnumGuesses) {
      // Used all the available rows (out of guesses)
      return;
    }

    // TODO: Optimisation: Not determining all the words which are valid guesses EVERY and every time enter is pressed?

    // wordArray generation
    let wordArray: string[] = [];
    // wordArray was explicitly specified, so use that
    if (props.wordArray) {
      wordArray = props.wordArray;
    } else if (props.mode === "category") {
      if (!targetWord) {
        return;
      } else {
        // Category mode - Find the array which includes the target word
        wordArray = categoryMappings
          .find((categoryMapping) => categoryMapping.array.some(({ word }) => word === targetWord))
          ?.array.map((x) => x.word)!;
      }
    } else {
      // Most gamemodes

      // Only full length guesses - Find the array by length of word
      if (props.enforceFullLengthGuesses) {
        wordArray = wordLengthMappingsGuessable.find((x) => x.value === wordLength)?.array || [];
      }
      // Full AND partial length guesses - All arrays containing words up to the wordLength (inclusive)
      else {
        for (let i = 3; i <= wordLength; i++) {
          // Find array of containing words of i length
          const currentLengthWordArray = wordLengthMappingsGuessable.find((x) => x.value === i)?.array!;
          if (currentLengthWordArray) {
            // Add smaller word array to larger wordArray
            wordArray = wordArray.concat(currentLengthWordArray);
            console.log(wordArray);
          }
        }
      }
    }

    if (wordArray.length === 0 && currentWord.toLowerCase() !== targetWord.toLowerCase()) {
      return;
    }

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
        if (props.firstLetterProvided) {
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

    if (outcome !== "in-progress" && gameId) {
      SaveData.addCompletedRoundToGameHistory(gameId, {
        timestamp: new Date().toISOString(),
        gameCategory: "wingo",
        outcome,
        levelProps: {
          mode: props.mode,
          firstLetterProvided: props.firstLetterProvided,
          puzzleLeaveNumBlanks: props.puzzleLeaveNumBlanks,
          puzzleRevealMs: props.puzzleRevealMs,
          targetWord,
          defaultWordLength: props.defaultWordLength,
          defaultnumGuesses: props.defaultnumGuesses,
          enforceFullLengthGuesses: props.enforceFullLengthGuesses,
          keyboard: props.keyboard,
          timerConfig: props.timerConfig,
          checkInDictionary: props.checkInDictionary,
          wordArray: props.wordArray,
          guesses,
        },
      });
    }

    if (props.timerConfig.isTimed) {
      setSeconds(props.timerConfig.seconds);
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
      if (currentWord.length === 1 && props.firstLetterProvided) {
        return; // Don't allow backspace
      }
      // If there is a letter to remove
      setCurrentWord(currentWord.substring(0, currentWord.length - 1));
    }
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
      />
    );
  }

  return (
    <Wordle
      isCampaignLevel={props.page === "campaign/area/level"}
      mode={props.mode}
      timerConfig={
        props.timerConfig.isTimed
          ? {
              isTimed: true,
              elapsedSeconds: seconds,
              totalSeconds: props.timerConfig.seconds,
            }
          : { isTimed: false }
      }
      keyboard={props.keyboard}
      wordLength={wordLength}
      numGuesses={numGuesses}
      guesses={guesses}
      currentWord={currentWord}
      wordIndex={wordIndex}
      inProgress={inProgress}
      inDictionary={inDictionary}
      isIncompleteWord={isIncompleteWord}
      hasSubmitLetter={hasSubmitLetter}
      targetWord={targetWord || ""}
      targetHint={props.showHint === false ? "" : targetHint}
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
    ></Wordle>
  );
};

export default WordleConfig;
