import React, { useState } from "react";
import "./App.scss";
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
import { wordHintMappings } from "./WordArrays/words_puzzles";
import { SaveData } from "./SaveData";
import { words_dogs } from "./WordArrays/Categories/dogs";
import { words_countries } from "./WordArrays/Categories/countries";

export interface WordleConfigProps {
  mode: "daily" | "repeat" | "category" | "increasing" | "limitless" | "puzzle" | "interlinked";
  firstLetterProvided: boolean;
  timerConfig: { isTimed: false } | { isTimed: true; seconds: number };
  keyboard: boolean;
  defaultWordLength: number;
  puzzleRevealMs: number;
  puzzleLeaveNumBlanks: number;
  defaultnumGuesses: number;
  finishingButtonText?: string;
  onComplete?: () => void;
}

interface Props extends WordleConfigProps {
  page: Page;
  setPage: (page: Page) => void;
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
  { name: "Dog Breeds", array: words_dogs },
  { name: "Countries", array: words_countries },
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

export function getWordSummary(word: string, targetWord: string, inDictionary: boolean) {
  // Character and status array
  let defaultCharacterStatuses = word.split("").map((character, index) => ({
    character: character,
    status: getLetterStatus(character, index, targetWord, inDictionary),
  }));
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

const WordleConfig: React.FC<Props> = (props) => {
  const [guesses, setGuesses] = useState<string[]>([]);
  const [numGuesses, setNumGuesses] = useState(props.defaultnumGuesses);
  const [gameId, setGameId] = useState<string | null>(null);
  const [currentWord, setCurrentWord] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [inProgress, setinProgress] = useState(true);
  const [inDictionary, setinDictionary] = useState(true);
  const [wordLength, setwordLength] = useState(props.defaultWordLength);
  const [targetWord, settargetWord] = useState<string>();
  const [interlinkedWord, setinterlinkedWord] = useState<string>();
  const [targetHint, settargetHint] = useState("");
  const [targetCategory, settargetCategory] = useState("");
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

  // Save gameplay progress of daily wordle
  React.useEffect(() => {
    if (props.mode === "daily" && targetWord) {
      SaveData.setDailyWordGuesses(targetWord, guesses, wordIndex, inProgress, currentWord);
    }
  }, [targetWord, currentWord, guesses, wordIndex, inProgress]);

  // Update word length every time the target word changes during category mode
  React.useEffect(() => {
    if (props.mode === "category") {
      if (targetWord) {
        setwordLength(targetWord.length);
      }
    }
  }, [targetWord]);

  // Update targetWord every time the targetCategory changes
  React.useEffect(() => {
    if (props.mode === "category") {
      const wordArray = categoryMappings.find((x) => x.name === targetCategory)?.array;

      if (!wordArray) {
        return;
      }

      const random_word = wordArray[Math.round(Math.random() * (wordArray.length - 1))];
      console.log(random_word);
      settargetWord(random_word);
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
          if (newIndex >= 0 && newIndex <= props.defaultWordLength - 1) {
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

  React.useEffect(() => {
    if (inProgress) {
      /* --- DAILY ---  */
      if (props.mode === "daily") {
        // Find array of 5 (wordLength) letter words
        const targetWordArray = wordLengthMappingsTargets.find((x) => x.value === wordLength)?.array!;

        const timestamp = +new Date(); // Unix timestamp (in milliseconds)
        const ms_per_day = 24 * 60 * 60 * 1000;
        const days_since_epoch = Math.floor(timestamp / ms_per_day);
        const daily_word_index = Math.round(days_since_epoch % targetWordArray.length); // Number in the range (0, wordArray.length)
        const new_daily_word = targetWordArray[daily_word_index];

        const daily_word_storage = SaveData.getDailyWordGuesses();
        // The actual daily word and the daily word set in local storage are the same
        if (new_daily_word === daily_word_storage?.dailyWord) {
          // Display the sava data on the word grid
          setGuesses(daily_word_storage.guesses);
          setWordIndex(daily_word_storage.wordIndex);
          setinProgress(daily_word_storage.inProgress);
          setCurrentWord(daily_word_storage.currentWord);
        }

        console.log("Daily word: " + new_daily_word);
        settargetWord(new_daily_word);

        // Reveal the first letter from game start
        if (props.firstLetterProvided) {
          setCurrentWord(new_daily_word.charAt(0));
        }
        /* --- PUZZLEWORD ---  */
      } else if (props.mode === "puzzle") {
        // Get a random puzzle and hint (from words_puzzles.ts)
        const puzzle = wordHintMappings[Math.round(Math.random() * wordHintMappings.length - 1)];
        console.log("Puzzle word: " + puzzle.word);
        settargetWord(puzzle.word);
        settargetHint(puzzle.hint);
      } else if (props.mode === "category") {
        /* --- Category ---  */
        const random_category = categoryMappings[Math.round(Math.random() * (categoryMappings.length - 1))];
        const wordArray = random_category.array;
        settargetCategory(random_category.name);

        // TODO: These new target words can have spaces in them (e.g United Kingdom)
        const new_target_word = wordArray[Math.round(Math.random() * (wordArray.length - 1))];

        console.log("Category word: " + new_target_word);
        settargetWord(new_target_word);

        // Reveal the first letter from game start
        if (props.firstLetterProvided) {
          setCurrentWord(new_target_word.charAt(0));
        }
      } else {
        /* --- REPEAT, INCREASING, LIMITLESS AND INTERLINKED ---  */
        const targetWordArray = wordLengthMappingsTargets.find((x) => x.value === wordLength)?.array!;

        // If the wordArray can't be found (increasing/limitless mode runs out of long enough words!)
        if (!targetWordArray) {
          ResetGame();
          return;
        }

        const new_target_word = targetWordArray[Math.round(Math.random() * (targetWordArray.length - 1))];

        console.log("Not daily word: " + new_target_word);
        settargetWord(new_target_word);

        // Reveal the first letter from game start
        if (props.firstLetterProvided) {
          setCurrentWord(new_target_word.charAt(0));
        }

        /* --- INTERLINKED (2nd word) --- */
        if (props.mode === "interlinked") {
          console.log("Target Word (1): " + new_target_word);
          const target_word_letters = new_target_word.split(""); // Get letters of first target word

          // Choose a random letter from these letters to be the shared letter between two interlinked words
          const shared_letter_index_word1 = Math.round(Math.random() * target_word_letters.length - 1); // Position of shared letter in first word
          console.log("Index (1): " + shared_letter_index_word1);

          const sharedLetter = target_word_letters[shared_letter_index_word1];
          console.log("Shared Letter: " + sharedLetter);

          // Look for another word which contains the shared letter
          let interlinked_target_word = "";
          do {
            const randomWord = targetWordArray[Math.round(Math.random() * targetWordArray.length - 1)];
            if (randomWord.includes(sharedLetter) && randomWord !== new_target_word) {
              interlinked_target_word = randomWord;
            }
          } while (interlinked_target_word === "");
          console.log("Target Word (2): " + interlinked_target_word);

          // Position of shared letter in second word
          const shared_letter_index_word2 = interlinked_target_word.indexOf(sharedLetter);
          console.log("Index (2): " + shared_letter_index_word2);

          setinterlinkedWord(interlinked_target_word);
        }
      }
    }
  }, [/* Short circuit boolean evaluation */ props.mode === "category" || wordLength, inProgress, props.mode]);

  // Save the game
  React.useEffect(() => {
    if (!targetWord) {
      return;
    }

    const gameId = SaveData.addGameToHistory(props.page, {
      timestamp: new Date().toISOString(),
      firstLetterProvided: props.firstLetterProvided,
      wordLength,
      numGuesses,
      puzzleLeaveNumBlanks: props.puzzleLeaveNumBlanks,
      puzzleRevealMs: props.puzzleRevealMs,
    });

    setGameId(gameId);
  }, [props.page, targetWord]);

  function ResetGame() {
    props.onComplete?.();
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
        setwordLength(props.defaultWordLength);
      }
    } else {
      // Game mode is limitless and there are still rows
      setNumGuesses(numGuesses - 1); // Remove a row
    }
  }

  function ContinueGame() {
    props.onComplete?.();
    setGuesses([]);
    setCurrentWord("");
    setWordIndex(0);
    setinProgress(true);
    setinDictionary(true);
    setwordLength(wordLength + 1);
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

    setinDictionary(true);

    let outcome: "success" | "failure" | "in-progress" = "in-progress";

    // Allow incomplete words for the category gamemode
    if (props.mode !== "category") {
      if (currentWord.length !== wordLength) {
        // Incomplete (length of) word
        return;
      }
    }

    if (wordIndex >= props.defaultnumGuesses) {
      // Used all the available rows (out of guesses)
      return;
    }

    let wordArray: string[];
    if (props.mode === "category") {
      if (!targetWord) {
        return;
      } else {
        // Find the array which includes the target word
        wordArray = categoryMappings.find((x) => x.array.includes(targetWord))?.array!;
      }
    } else {
      // Find the array by length of word
      wordArray = wordLengthMappingsGuessable.find((x) => x.value === wordLength)?.array!;
    }

    if (!wordArray || wordArray.length === 0) {
      return;
    }

    if (wordArray.includes(currentWord.toLowerCase())) {
      // Accepted word
      setGuesses(guesses.concat(currentWord)); // Add word to guesses

      if (currentWord.toUpperCase() === targetWord?.toUpperCase()) {
        // Exact match
        setinProgress(false);
        const goldBanked = calculateGoldAwarded(targetWord.length, wordIndex + 1);
        SaveData.addGold(goldBanked);
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
        outcome,
        currentWord,
        guesses,
        wordLength,
        numGuesses,
        firstLetterProvided: props.firstLetterProvided,
        puzzleLeaveNumBlanks: props.puzzleLeaveNumBlanks,
        puzzleRevealMs: props.puzzleRevealMs,
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
      settargetCategory(category);
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

  return (
    <Wordle
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
      hasSubmitLetter={hasSubmitLetter}
      targetWord={targetWord || ""}
      interlinkedWord={interlinkedWord || ""}
      targetHint={targetHint || ""}
      targetCategory={targetCategory || ""}
      puzzleRevealMs={props.puzzleRevealMs}
      puzzleLeaveNumBlanks={props.puzzleLeaveNumBlanks}
      revealedLetterIndexes={revealedLetterIndexes}
      letterStatuses={letterStatuses}
      finishingButtonText={props.finishingButtonText}
      onEnter={onEnter}
      onSubmitLetter={onSubmitLetter}
      onSubmitTargetCategory={onSubmitTargetCategory}
      onBackspace={onBackspace}
      ResetGame={ResetGame}
      ContinueGame={ContinueGame}
      setPage={props.setPage}
    ></Wordle>
  );
};

export default WordleConfig;
