import React from "react";
import "../App.scss";
import { Keyboard } from "../Keyboard";
import { Page } from "../App";
import { WordRow } from "../WordRow";
import { Button } from "../Button";
import { MessageNotification } from "../MessageNotification";
import ProgressBar from "../ProgressBar";

interface Props {
  timerConfig:
    | { isTimed: false }
    | { isTimed: true; totalSeconds: number; elapsedSeconds: number };
  keyboard: boolean;
  wordLength: number;
  guesses: string[];
  currentWord: string;
  countdownWord: string;
  inProgress: boolean;
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
  onSubmitLetter: (letter: string) => void;
  onBackspace: () => void;
  ResetGame: () => void;
  ContinueGame: () => void;
}

const CountdownLetters: React.FC<Props> = (props) => {
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

    function addVowel() {
      // Already 9 picked letters, don't add any more
      if (props.countdownWord.length === 9) {
        return;
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
      if (turnOffWeighting) {
        vowel_weightings.map((x) => {
          x.weighting = 1;
          return x;
        });
      }
      */

      const weighted_vowel = getWeightedLetter(vowel_weightings);
      props.onSubmitCountdownLetter(weighted_vowel);
    }

    function addConsonant() {
      if (props.countdownWord.length === 9) {
        return;
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
      if (turnOffWeighting) {
        consonant_weightings.map((x) => {
          x.weighting = 1;
          return x;
        });
      }
      */

      const weighted_consonant = getWeightedLetter(consonant_weightings);
      props.onSubmitCountdownLetter(weighted_consonant);
    }

    var Grid = [];

    // Check if 9 letters have been selected
    const isSelectionFinished = props.countdownWord.length == 9;

    // Read only letter selection WordRow
    Grid.push(
      <div className="countdown-letters-wrapper">
        <WordRow
          key={"letter_selection"}
          word={props.countdownWord}
          isVertical={false}
          length={wordLength}
          targetWord={""}
          hasSubmit={true}
          inDictionary={props.inDictionary}
        ></WordRow>
        <div className="add-letter-buttons-wrapper">
          <Button
            mode={"default"}
            disabled={isSelectionFinished}
            onClick={addVowel}
          >
            Vowel
          </Button>
          <Button
            mode={"default"}
            disabled={isSelectionFinished}
            onClick={addConsonant}
          >
            Consonant
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
    // Game still in progress, don't display anything
    if (props.inProgress) {
      return;
    }

    // Invalid word (wrong spelling)
    if (!props.inDictionary) {
      return (
        <MessageNotification type="error">
          <strong>{props.currentWord}</strong> is not a valid word
        </MessageNotification>
      );
    }

    if (props.currentWord.toUpperCase() === props.targetWord.toUpperCase()) {
      return (
        <MessageNotification type="success">Valid Word</MessageNotification>
      );
    }
  }

  return (
    <div className="App">
      <div>{displayOutcome()}</div>

      <div className="word_grid">{populateGrid(props.wordLength)}</div>

      <div className="keyboard">
        {props.keyboard && (
          <Keyboard
            onEnter={props.onEnter}
            onSubmitLetter={props.onSubmitLetter}
            onBackspace={props.onBackspace}
            guesses={props.guesses}
            targetWord={props.targetWord}
            inDictionary={props.inDictionary}
            /* TODO: Send CountdownLetters keyboard letterStatuses
              All letters as not in word with real time evaluation of word OFF
              Same letterStauses as Wordle with real time evaluation of word ON
            */
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
        {props.guesses.map((guess) => <p className="countdown_letters_guess">{guess}</p>)}
      </div>
      
    </div>
  );
};

export default CountdownLetters;
