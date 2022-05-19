import React, { useState } from "react";
import { Page } from "../App";
import { SettingsData } from "../SaveData";
import { Theme } from "../Themes";
import { words_nine_targets } from "../WordArrays/Lengths/words_9";
import { wordLengthMappingsTargets } from "../WordleConfig";

interface Props {
  timerConfig: { isTimed: false } | { isTimed: true; seconds: number };
  keyboard: boolean;
  page: Page;
  defaultWordLength: number;
  theme: Theme;
  settings: SettingsData;
  setTheme: (theme: Theme) => void;
  setPage: (page: Page) => void;
  addGold: (gold: number) => void;
  onComplete?: (wasCorrect: boolean, answer: string, targetAnswer: string, score: number | null) => void;
  gameshowScore?: number;
}

export const Conundrum: React.FC<Props> = (props) => {
  const [conundrum, setConundrum] = useState("");
  const [solution, setSolution] = useState("");

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
  },[])

  function checkAnagram(constructedWord: string, targetWord: string) {
    var constructedWordLetters = constructedWord.split("").sort().join("");
    var targetWordLetters = targetWord.split("").sort().join("");

    return constructedWordLetters === targetWordLetters;
  }

  function generateConundrum() {
    // Get a random word length combination
    let wordLengthCombination =
      wordLengthCombinations[Math.round(Math.random() * (wordLengthCombinations.length - 1))];

    let conundrumSolution;

    // Loop until a conundrum is found
    while (conundrumSolution === undefined) {
      let constructedWord = "";

      for (const wordLength of wordLengthCombination) {
        // TODO: Guessable or target words?
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

      // Can't be an anagram if not the same length
      if (constructedWord.length !== 9) {
        continue;
      }

      // TODO: Guessable or target words?
      const anagrams = words_nine_targets.filter((word) => checkAnagram(constructedWord, word));

      // TODO: Ideally, there is only one solution to the conundrum (anagrams.length === 1)
      
      // There is a 9 letter anagram to use
      if (anagrams.length >= 1) {
        console.log("found");
        // Choose one of them
        const randomAnagram = anagrams[Math.round(Math.random() * (anagrams.length - 1))];
        // A conundrum has been found, stop looping
        conundrumSolution = randomAnagram;
        // Set state
        setConundrum(constructedWord);
        setSolution(conundrumSolution);
      }
    }

    // TODO: Try a different wordLength combination after failing a number of times

  }

  return (
    <div className="conundrum">
      <>{`Question: ${conundrum}`}</>
      <>{`Answer: ${solution}`}</>
    </div>
  );
};
