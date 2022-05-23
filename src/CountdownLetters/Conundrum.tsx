import React, { useState } from "react";
import { Page } from "../App";
import { SettingsData } from "../SaveData";
import { useFailureChime } from "../Sounds";
import { Theme } from "../Themes";
import { words_nine_targets } from "../WordArrays/Lengths/words_9";
import { wordLengthMappingsTargets } from "../WordleConfig";

interface Props {
  timerConfig: { isTimed: false } | { isTimed: true; seconds: number };
  page: Page;
  theme: Theme;
  settings: SettingsData;
  setTheme: (theme: Theme) => void;
  setPage: (page: Page) => void;
  addGold: (gold: number) => void;
  onComplete?: (wasCorrect: boolean, answer: string, targetAnswer: string, score: number | null) => void;
  gameshowScore?: number;
}

export const Conundrum: React.FC<Props> = (props) => {
  const [inProgress, setInProgress] = useState(true);

  const [conundrum, setConundrum] = useState("");
  const [solution, setSolution] = useState("");

  const [seconds, setSeconds] = useState(props.timerConfig.isTimed ? props.timerConfig.seconds : 0);
  const [playFailureChimeSoundEffect] = useFailureChime(props.settings);

  /*
  Combinations of word lengths that could make up a 9 letter conundrum
  There are probably more combinations, but these should make the best conundrums
  */

  const wordLengthCombinations = [
    [6, 3],
    [3, 6],
    [5, 4],
    [4, 5],
    [3, 3, 3],
    [4, 2, 3],
    [3, 2, 4],
  ];

  React.useEffect(() => {
    generateConundrum();
  }, []);

  // Timer Setup
  React.useEffect(() => {
    if (!props.timerConfig.isTimed || !inProgress) {
      return;
    }

    const timerGuess = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      } else {
        playFailureChimeSoundEffect();
        setInProgress(false);
        clearInterval(timerGuess);
      }
    }, 1000);
    return () => {
      clearInterval(timerGuess);
    };
  }, [setSeconds, seconds, props.timerConfig.isTimed]);

  function checkAnagram(constructedWord: string, targetWord: string) {
    var constructedWordLetters = constructedWord.split("").sort().join("");
    var targetWordLetters = targetWord.split("").sort().join("");

    return constructedWordLetters === targetWordLetters;
  }

  function generateConundrum() {
    // Get a random word length combination
    let wordLengthCombination = wordLengthCombinations[Math.round(Math.random() * (wordLengthCombinations.length - 1))];

    let conundrumSolution;

    let failCount = 0;
    const MAX_FAIL_COUNT = 100;

    // Loop until a conundrum is found
    while (conundrumSolution === undefined && failCount < MAX_FAIL_COUNT) {
      let constructedWord = "";

      for (const wordLength of wordLengthCombination) {
        const wordArray = wordLengthMappingsTargets.find((mapping) => mapping.value === wordLength)?.array;
        if (!wordArray) {
          break;
        }

        // Find a word of the wordLength
        const word = wordArray[Math.round(Math.random() * (wordArray.length - 1))];
        if (!word) {
          break;
        }

        // Append the word to constructedWord
        constructedWord += word;
      }

      // Find 9 letter words which are anagrams of constructedWord
      const anagrams = words_nine_targets.filter((word) => checkAnagram(constructedWord, word));

      // Only one unique anagram
      if (anagrams.length === 1) {
        conundrumSolution = anagrams[0];
        setConundrum(constructedWord);
        setSolution(conundrumSolution);
      }
      // Failed to find unique anagram
      else {
        failCount += 1;
        if (failCount === MAX_FAIL_COUNT) {
          // Try a different wordLengthCombination
          wordLengthCombination =
            wordLengthCombinations[Math.round(Math.random() * (wordLengthCombinations.length - 1))];
          failCount = 0;
        }
      }
    }
  }

  function ResetGame(wasCorrect: boolean, answer: string, targetAnswer: string, score: number | null) {
    // Callback of the score achieved (used for Countdown Gameshow)
    props.onComplete?.(wasCorrect, answer, targetAnswer, score);
    generateConundrum();
    if (props.timerConfig.isTimed) {
      // Reset the timer if it is enabled in the game options
      setSeconds(props.timerConfig.seconds);
    }
  }

  return (
    <div className="conundrum">
      <>{`Question: ${conundrum}`}</>
      <>{`Answer: ${solution}`}</>
    </div>
  );
};
