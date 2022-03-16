import React, { useState } from "react";
import "../App.scss";
import { Alphabet, Keyboard } from "../Keyboard";
import { Page } from "../App";
import { WordRow } from "../WordRow";
import { Button } from "../Button";
import { MessageNotification } from "../MessageNotification";
import ProgressBar from "../ProgressBar";
import { isWordValid } from "./CountdownLettersConfig";

interface Props {
  mode: "casual" | "realistic";
  timerConfig:
    | { isTimed: false }
    | { isTimed: true; totalSeconds: number; elapsedSeconds: number };
  keyboard: boolean;
  wordLength: number;
  guesses: string[];
  currentWord: string;
  countdownWord: string;
  inProgress: boolean;
  hasTimerEnded: boolean;
  inDictionary: boolean;
  hasSubmitLetter: boolean;
  targetWord: string;
  letterStatuses: {
    letter: string;
    status: "" | "contains" | "correct" | "not set" | "not in word";
  }[];
  setPage: (page: Page) => void;
  onEnter: () => void;
  onSubmitCountdownLetter: (letter: string) => void;
  onSubmitCountdownWord: (word: string) => void;
  onSubmitLetter: (letter: string) => void;
  onBackspace: () => void;
  ResetGame: () => void;
  ContinueGame: () => void;
}

const CountdownLetters: React.FC<Props> = (props) => {
  const [finalGuess, setFinalGuess] = useState("");

  // Create grid of rows (for guessing words)
  function populateGrid(wordLength: number) {
    function getWeightedLetter(
      letter_weightings: { letter: string; weighting: number }[]
    ) {
      var weighted_array: string[] = [];

      // For each object in input array
      for (let i = 0; i < letter_weightings.length; i++) {
        // For the 'weighting' value number of times
        for (var j = 0; j < letter_weightings[i].weighting; j++) {
          // Push the related letter to the array
          weighted_array.push(letter_weightings[i].letter);
        }
      }

      // Select a random value from this array
      return weighted_array[
        Math.floor(Math.random() * (weighted_array.length - 1))
      ];
    }

    function getVowel(): string {
      // Already 9 picked letters, don't add any more
      if (props.countdownWord.length === 9) {
        return "";
      }

      // Scrabble distribution (https://en.wikipedia.org/wiki/Scrabble_letter_distributions)
      let vowel_weightings = [
        { letter: "a", weighting: 9 },
        { letter: "e", weighting: 12 },
        { letter: "i", weighting: 9 },
        { letter: "o", weighting: 8 },
        { letter: "u", weighting: 4 },
      ];

      /*
      if (!useWeightings) {
        const randomIndex = Math.floor(
          Math.random() * (vowel_weightings.length - 1)
        );
        const randomLetter = vowel_weightings[randomIndex].letter;
        return randomLetter;
      } else {
        const weighted_vowel = getWeightedLetter(vowel_weightings);
        return weighted_vowel;
      }
      */

      const weighted_vowel = getWeightedLetter(vowel_weightings);
      return weighted_vowel;
    }

    function getConsonant(): string {
      if (props.countdownWord.length === 9) {
        return "";
      }

      let consonant_weightings = [
        { letter: "b", weighting: 2 },
        { letter: "c", weighting: 2 },
        { letter: "d", weighting: 4 },
        { letter: "f", weighting: 2 },
        { letter: "g", weighting: 3 },
        { letter: "h", weighting: 2 },
        { letter: "j", weighting: 1 },
        { letter: "k", weighting: 1 },
        { letter: "l", weighting: 4 },
        { letter: "m", weighting: 2 },
        { letter: "n", weighting: 6 },
        { letter: "p", weighting: 2 },
        { letter: "q", weighting: 1 },
        { letter: "r", weighting: 6 },
        { letter: "s", weighting: 4 },
        { letter: "t", weighting: 6 },
        { letter: "v", weighting: 2 },
        { letter: "w", weighting: 2 },
        { letter: "x", weighting: 1 },
        { letter: "y", weighting: 2 },
        { letter: "z", weighting: 1 },
      ];

      /*
      if (!useWeightings) {
        const randomIndex = Math.floor(
          Math.random() * (consonant_weightings.length - 1)
        );
        const randomLetter = consonant_weightings[randomIndex].letter;
        return randomLetter;
      } else {
        const weighted_consonant = getWeightedLetter(consonant_weightings);
        return weighted_consonant;
      }
      */

      const weighted_consonant = getWeightedLetter(consonant_weightings);
      return weighted_consonant;
    }

    function quickLetterSelection() {
      let newCountdownWord = "";

      // Build word by randomly adding vowels and consonants
      for (let i = 0; i < wordLength; i++) {
        let x = Math.floor(Math.random() * 2) === 0;
        // Equal chance (to add a vowel or consonant)
        if (x) {
          newCountdownWord += getVowel();
        } else {
          newCountdownWord += getConsonant();
        }
      }
      // Set the entire word at once
      props.onSubmitCountdownWord(newCountdownWord);
    }

    var Grid = [];

    // Check if 9 letters have been selected
    const isSelectionFinished = props.countdownWord.length === 9;

    // Read only letter selection WordRow
    Grid.push(
      <div className="countdown-letters-wrapper">
        <WordRow
          key={"letter_selection"}
          word={props.countdownWord}
          isVertical={false}
          length={wordLength}
          targetWord={""}
          hasSubmit={false}
          inDictionary={props.inDictionary}
        ></WordRow>
        <div className="add-letter-buttons-wrapper">
          <Button
            mode={"default"}
            disabled={isSelectionFinished}
            onClick={() => props.onSubmitCountdownLetter(getVowel())}
          >
            Vowel
          </Button>
          <Button
            mode={"default"}
            disabled={isSelectionFinished}
            onClick={() => props.onSubmitCountdownLetter(getConsonant())}
          >
            Consonant
          </Button>
          <Button
            mode={"default"}
            disabled={props.countdownWord.length !== 0 || isSelectionFinished}
            onClick={quickLetterSelection}
          >
            Quick Pick
          </Button>
        </div>
      </div>
    );

    // WordRow to enter words using available letters
    Grid.push(
      <WordRow
        key={"countdown_letters_input"}
        isVertical={false}
        word={props.currentWord}
        length={wordLength}
        targetWord={props.targetWord}
        hasSubmit={!props.inProgress}
        inDictionary={props.inDictionary}
      ></WordRow>
    );

    return Grid;
  }

  function displayOutcome() {
    // TODO: Probably best this doesn't do all the scoring logic and simply just displays outcome!

    // When timer runs out and if a guess has been made
    if (!props.inProgress && props.hasTimerEnded) {
      if (!finalGuess) {
        // finalGuess is empty (no guess was made), no points
        return (
          <MessageNotification type="error">
            <strong>No guess was made</strong>
            <br />
            <strong>0 points</strong>
          </MessageNotification>
        );
      }
      if (props.mode === "casual") {
        // Already evaluated that guess is valid, so just display result
        return (
          <MessageNotification type="success">
            <strong>{finalGuess.toUpperCase()}</strong>
            <br />
            <strong>{finalGuess.length} points</strong>
          </MessageNotification>
        );
      } else {
        // Realistic mode, guess (has not yet and so) needs to be evaluated
        if (
          props.inDictionary &&
          isWordValid(props.countdownWord, finalGuess)
        ) {
          return (
            <MessageNotification type="success">
              <strong>{finalGuess.toUpperCase()}</strong>
              <br />
              <strong>{finalGuess.length} points</strong>
            </MessageNotification>
          );
        } else {
          // Invalid word
          return (
            <MessageNotification type="error">
              <strong>{finalGuess.toUpperCase()} is an invalid word</strong>
              <br />
              <strong>0 points</strong>
            </MessageNotification>
          );
        }
      }
    }
  }

  function isLongestWord(guess: string) {
    // Compares words and returns a single value of the longest word
    const longestWord = props.guesses.reduce((currentWord, nextWord) =>
      currentWord.length > nextWord.length ? currentWord : nextWord
    );

    if (guess === longestWord) {
      return true;
    } else {
      return false;
    }
  }

  function updateSelectedGuess(event: React.ChangeEvent<HTMLInputElement>) {
    const newGuess = event.target.value;
    setFinalGuess(newGuess);
  }

  return (
    <div className="App">
      <div>{displayOutcome()}</div>

      <div className="word_grid">{populateGrid(props.wordLength)}</div>

      <div className="keyboard">
        {props.keyboard && (
          <Keyboard
            isCountdownMode={true}
            onEnter={props.onEnter}
            onSubmitLetter={props.onSubmitLetter}
            onBackspace={props.onBackspace}
            guesses={props.guesses}
            targetWord={props.targetWord}
            inDictionary={props.inDictionary}
            letterStatuses={props.letterStatuses}
          ></Keyboard>
        )}
      </div>

      <div>
        {props.timerConfig.isTimed && (
          <ProgressBar
            progress={props.timerConfig.elapsedSeconds}
            total={props.timerConfig.totalSeconds}
          ></ProgressBar>
        )}
      </div>

      <div className="countdown_letters_guesses">
        {props.guesses.map((guess) => (
          <label className="countdown_letters_guess_label">
            <input
              type="radio"
              // TODO: Can't override this and choose a guess which isn't the longest
              checked={props.mode === "casual" && isLongestWord(guess)}
              onChange={(event) => updateSelectedGuess(event)}
              className="countdown_letters_guess_input"
              name="countdown_letters_guess"
              value={guess}
            ></input>
            {guess}
          </label>
        ))}
      </div>
    </div>
  );
};

export default CountdownLetters;
