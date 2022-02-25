import React, { useState } from "react";
import "./App.css";
import { Page } from "./App";
import Wordle from "./Wordle";
import { words_four } from "./WordArrays/words_4";
import { words_five } from "./WordArrays/words_5";
import { words_six } from "./WordArrays/words_6";
import { words_seven } from "./WordArrays/words_7";
import { words_eight } from "./WordArrays/words_8";
import { words_nine } from "./WordArrays/words_9";
import { words_ten } from "./WordArrays/words_10";
import { words_eleven } from "./WordArrays/words_11";
import { wordHintMappings } from "./WordArrays/words_puzzles";

interface Props {
  mode: "daily" | "repeat" | "limitless" | "puzzle" | "interlinked";
  gold: string;
  firstLetterProvided: boolean;
  timerConfig: { isTimed: false } | { isTimed: true; seconds: number };
  defaultWordLength: number;
  puzzleRevealMs: number;
  puzzleLeaveNumBlanks: number;
  numGuesses: number;
  setPage: (page: Page) => void;
  updateGoldCoins: (value: number) => void;
}

const wordLengthMappings = [
  { value: 4, array: words_four },
  { value: 5, array: words_five },
  { value: 6, array: words_six },
  { value: 7, array: words_seven },
  { value: 8, array: words_eight },
  { value: 9, array: words_nine },
  { value: 10, array: words_ten },
  { value: 11, array: words_eleven },
];

const WordleConfig: React.FC<Props> = (props) => {
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [inProgress, setinProgress] = useState(true);
  const [inDictionary, setinDictionary] = useState(true);
  const [wordLength, setwordLength] = useState(props.defaultWordLength);
  const [targetWord, settargetWord] = useState<string>();
  const [interlinkedWord, setinterlinkedWord] = useState<string>();
  const [targetHint, settargetHint] = useState("");
  const [hasSubmitLetter, sethasSubmitLetter] = useState(false);
  const [revealedLetterIndexes, setRevealedLetterIndexes] = useState<number[]>(
    []
  );
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
  ];

  const [letterStatuses, setletterStatuses] = useState<
    {
      letter: string;
      status: "" | "contains" | "correct" | "not set" | "not in word";
    }[]
  >(defaultLetterStatuses);

  const [seconds, setSeconds] = useState(
    props.timerConfig.isTimed ? props.timerConfig.seconds : 0
  );

  React.useEffect(() => {
    if (!props.timerConfig.isTimed) {
      return;
    }
    const timer = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      }
      else {
        setinDictionary(false);
        setinProgress(false);
      }
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [setSeconds, seconds, props.timerConfig.isTimed]);

  React.useEffect(() => {
    const letterStatusesCopy = letterStatuses.slice();

    for (const guess of guesses) {
      for (let i = 0; i < guess.length; i++) {
        const letter = guess[i];

        const currentLetterStatus = letterStatusesCopy.find(
          (x) => x.letter.toLowerCase() === letter.toLowerCase()
        );
        const newStatus = getLetterStatus(letter, i);

        if (newStatus !== "incorrect") {
          currentLetterStatus!.status = newStatus;
        }
      }
    }

    console.log(letterStatusesCopy);
    setletterStatuses(letterStatusesCopy);
  }, [guesses, wordIndex]);

  React.useEffect(() => {
    let intervalId: number;

    if (props.mode === "puzzle" && !hasSubmitLetter) {
      intervalId = window.setInterval(() => {
        if (hasSubmitLetter) {
          return;
        }

        if (!targetWord) {
          return;
        }

        if (
          revealedLetterIndexes.length >=
          targetWord!.length - props.puzzleLeaveNumBlanks
        ) {
          // Leave
          return;
        }

        const newrevealedLetterIndexes = revealedLetterIndexes.slice();

        if (revealedLetterIndexes.length === 0) {
          // Reveal the first letter
          newrevealedLetterIndexes.push(0);
        } else if (revealedLetterIndexes.length === 1) {
          // Reveal the last letter
          newrevealedLetterIndexes.push(targetWord!.length - 1);
        } else {
          let newIndex: number;

          do {
            newIndex = Math.round(Math.random() * targetWord!.length - 1);
          } while (revealedLetterIndexes.includes(newIndex));

          // Reveal a random letter
          newrevealedLetterIndexes.push(newIndex);
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
        const wordArray = wordLengthMappings.find((x) => x.value === wordLength)
          ?.array!;

        const timestamp = +new Date(); // Unix timestamp (in milliseconds)
        const ms_per_day = 24 * 60 * 60 * 1000;
        const days_since_epoch = Math.floor(timestamp / ms_per_day);
        const daily_word_index = Math.round(
          days_since_epoch % wordArray.length
        ); // Number in the range (0, wordArray.length)
        const new_daily_word = wordArray[daily_word_index];

        console.log("Daily word: " + new_daily_word);
        settargetWord(new_daily_word);

        /* Reveal the first letter from game start */
        if (props.firstLetterProvided) {
          setCurrentWord(new_daily_word.charAt(0));
        }
        /* --- PUZZLEWORD ---  */
      } else if (props.mode === "puzzle") {
        const puzzle =
          wordHintMappings[
            Math.round(Math.random() * wordHintMappings.length - 1)
          ];
        console.log("Puzzle word: " + puzzle.word);
        settargetWord(puzzle.word);
        settargetHint(puzzle.hint);
        /* --- REPEAT, LIMITLESS AND INTERLINKED ---  */
      } else {
        const wordArray = wordLengthMappings.find((x) => x.value === wordLength)
          ?.array!;

        // If the wordArray can't be found (limitless mode runs out of long enough words!)
        if (!wordArray) {
          ResetGame();
          return;
        }

        const new_target_word =
          wordArray[Math.round(Math.random() * wordArray.length - 1)];

        console.log("Not daily word: " + new_target_word);
        settargetWord(new_target_word);

        /* Reveal the first letter from game start */
        if (props.firstLetterProvided) {
          setCurrentWord(new_target_word.charAt(0));
        }

        /* --- INTERLINKED (2nd word) --- */
        if (props.mode === "interlinked") {
          console.log("Target Word (1): " + new_target_word);
          const target_word_letters = new_target_word.split(""); // Get letters of first target word

          // Choose a random letter from these letters to be the shared letter between two interlinked words
          const shared_letter_index_word1 = Math.round(
            Math.random() * target_word_letters.length - 1
          ); // Position of shared letter in first word
          console.log("Index (1): " + shared_letter_index_word1);

          const sharedLetter = target_word_letters[shared_letter_index_word1];
          console.log("Shared Letter: " + sharedLetter);

          // Look for another word which contains the shared letter
          let interlinked_target_word = "";
          do {
            const randomWord =
              wordArray[Math.round(Math.random() * wordArray.length - 1)];
            if (
              randomWord.includes(sharedLetter) &&
              randomWord !== new_target_word
            ) {
              interlinked_target_word = randomWord;
            }
          } while (interlinked_target_word === "");
          console.log("Target Word (2): " + interlinked_target_word);

          // Position of shared letter in second word
          const shared_letter_index_word2 =
            interlinked_target_word.indexOf(sharedLetter);
          console.log("Index (2): " + shared_letter_index_word2);

          setinterlinkedWord(interlinked_target_word);
        }
      }
    }
  }, [wordLength, inProgress, props.mode]);

  function ResetGame() {
    setGuesses([]);
    setCurrentWord("");
    setWordIndex(0);
    setinProgress(true);
    setinDictionary(true);
    setwordLength(props.defaultWordLength);
    sethasSubmitLetter(false);
    setRevealedLetterIndexes([]);
    setletterStatuses(defaultLetterStatuses);
  }

  function ContinueGame() {
    setGuesses([]);
    setCurrentWord("");
    setWordIndex(0);
    setinProgress(true);
    setinDictionary(true);
    setwordLength(wordLength + 1);
    sethasSubmitLetter(false);
    setRevealedLetterIndexes([]);
    setletterStatuses(defaultLetterStatuses);
  }

  function calculateGoldAwarded(
    wordLength: number,
    /*win_streak: number,*/
    numGuesses: number
  ) {
    /* Base amount by gamemode */
    const gamemode_Gold_Mappings = [
      { mode: "daily", value: 1000 },
      { mode: "repeat", value: 50 },
      { mode: "limitless", value: 50 },
      {
        mode: "puzzle",
        value: 20,
      } /* TODO: Balancing, puzzle words are always 10 letters */,
      { mode: "interlinked", value: 125 },
    ];

    const gamemode_value = gamemode_Gold_Mappings.find(
      (x) => x.mode === props.mode
    )?.value!;

    /* Incremental multiplier with wordLength */
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

    const wordLength_multiplier = wordLength_Gold_Mappings.find(
      (x) => x.value === wordLength
    )?.multiplier!;

    /* Small bonus for early guesses */
    const numGuesses_Gold_Mappings = [
      {
        guesses: 1,
        value: 250,
      } /* TODO: Balancing, puzzle words are always 1 guess */,
      { guesses: 2, value: 100 },
      { guesses: 3, value: 50 },
      { guesses: 4, value: 25 },
      { guesses: 5, value: 10 },
      { guesses: 6, value: 0 },
    ];

    const numGuesses_bonus = numGuesses_Gold_Mappings.find(
      (x) => x.guesses === numGuesses
    )?.value!;

    const goldTotal = Math.round(
      gamemode_value * wordLength_multiplier + numGuesses_bonus
    );
    return goldTotal;
  }

  function getLetterStatus(
    letter: string,
    index: number
  ): "incorrect" | "contains" | "correct" | "not set" | "not in word" {
    var status:
      | "incorrect"
      | "contains"
      | "correct"
      | "not set"
      | "not in word";

    if (!inDictionary) {
      // Red
      status = "incorrect";
    } else if (targetWord?.[index]?.toUpperCase() === letter?.toUpperCase()) {
      // Green
      status = "correct";
    } else if (targetWord?.toUpperCase().includes(letter?.toUpperCase())) {
      // Yellow
      status = "contains";
      // Keyboard button with letter props.word[i],
    } else {
      status = "not in word"; // Another status for letter is not in word?
    }

    return status;
  }

  function onEnter() {
    //Pressing Enter to Continue or Restart
    if (!inProgress) {
      if (props.mode !== "daily") {
        if (props.mode === "limitless") {
          ContinueGame();
        } else {
          ResetGame();
        }
      }
      return;
    }

    setinDictionary(true);

    if (currentWord.length !== wordLength) {
      /* Incomplete word */
      return;
    }

    if (wordIndex >= props.numGuesses) {
      /* Used all the available rows (out of guesses) */
      return;
    }

    const wordArray = wordLengthMappings.find((x) => x.value === wordLength)
      ?.array!;

    if (wordArray.includes(currentWord.toLowerCase())) {
      /* Completed and accepeted word */
      setGuesses(guesses.concat(currentWord)); /* Add word to guesses */

      if (currentWord.toUpperCase() === targetWord?.toUpperCase()) {
        /* Exact match */
        setinProgress(false);
        const goldBanked = calculateGoldAwarded(
          targetWord.length,
          wordIndex + 1
        );
        props.updateGoldCoins(goldBanked);
      } else if (wordIndex + 1 === props.numGuesses) {
        setinProgress(false);
      } else {
        // Not yet guessed
        if (props.firstLetterProvided) {
          /* TODO: Reveal the first letter of the word for each new guess */
          setCurrentWord(targetWord?.charAt(0)!);
        } else {
          setCurrentWord(""); /* Start new word as empty string */
        }
        setWordIndex(
          wordIndex + 1
        ); /* Increment index to indicate new word has been started */
      }
    } else {
      setinDictionary(false);
      setinProgress(false);
    }
    if (props.timerConfig.isTimed) {
      setSeconds(props.timerConfig.seconds);
    }
    
  }

  function onSubmitLetter(letter: string) {
    if (currentWord.length < wordLength && inProgress) {
      setCurrentWord(
        currentWord + letter
      ); /* Append chosen letter to currentWord */
      sethasSubmitLetter(true);
    }
  }

  function onBackspace() {
    if (currentWord.length > 0 && inProgress) {
      /* If only the first letter and it was provided to begin with */
      if (currentWord.length === 1 && props.firstLetterProvided) {
        return; // Don't allow backspace
      }
      /* If there is a letter to remove */
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
      gold={props.gold}
      wordLength={wordLength}
      numGuesses={props.numGuesses}
      guesses={guesses}
      currentWord={currentWord}
      wordIndex={wordIndex}
      inProgress={inProgress}
      inDictionary={inDictionary}
      hasSubmitLetter={hasSubmitLetter}
      targetWord={targetWord || ""}
      interlinkedWord={interlinkedWord || ""}
      targetHint={targetHint || ""}
      puzzleRevealMs={props.puzzleRevealMs}
      puzzleLeaveNumBlanks={props.puzzleLeaveNumBlanks}
      revealedLetterIndexes={revealedLetterIndexes}
      letterStatuses={letterStatuses}
      getLetterStatus={getLetterStatus}
      setPage={props.setPage}
      updateGoldCoins={props.updateGoldCoins}
      onEnter={onEnter}
      onSubmitLetter={onSubmitLetter}
      onBackspace={onBackspace}
      ResetGame={ResetGame}
      ContinueGame={ContinueGame}
    ></Wordle>
  );
};

export default WordleConfig;
