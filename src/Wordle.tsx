import React from "react";
import "./App.scss";
import { Keyboard } from "./Keyboard";
import { Page } from "./App";
import { WordRow } from "./WordRow";
import { Button } from "./Button";
import { MessageNotification } from "./MessageNotification";
import ProgressBar from "./ProgressBar";

interface Props {
  mode:
    | "daily"
    | "repeat"
    | "increasing"
    | "limitless"
    | "puzzle"
    | "interlinked"
    | "countdown_letters";
  timerConfig:
    | { isTimed: false }
    | { isTimed: true; totalSeconds: number; elapsedSeconds: number };
  wordLength: number;
  numGuesses: number;
  guesses: string[];
  currentWord: string;
  countdownWord: string;
  wordIndex: number;
  inProgress: boolean;
  inDictionary: boolean;
  hasSubmitLetter: boolean;
  targetWord: string;
  interlinkedWord: string;
  targetHint: string;
  puzzleRevealMs: number;
  puzzleLeaveNumBlanks: number;
  letterStatuses: {
    letter: string;
    status: "" | "contains" | "correct" | "not set" | "not in word";
  }[];
  revealedLetterIndexes: number[];
  setPage: (page: Page) => void;
  onEnter: () => void;
  onSubmitCountdownLetter: (letter: string) => void;
  onSubmitLetter: (letter: string) => void;
  onBackspace: () => void;
  ResetGame: () => void;
  ContinueGame: () => void;
}

const Wordle: React.FC<Props> = (props) => {
  // Create grid of rows (for guessing words)
  function populateGrid(rowNumber: number, wordLength: number) {
    var Grid = [];

    if (props.mode === "puzzle") {
      // Create read only WordRow that slowly reveals puzzle word
      let displayWord = "";

      for (let i = 0; i < props.targetWord.length; i++) {
        if (props.revealedLetterIndexes.includes(i)) {
          displayWord += props.targetWord[i];
        } else {
          displayWord += " ";
        }
      }

      Grid.push(
        <WordRow
          key={"read-only"}
          word={displayWord}
          isVertical={false}
          length={wordLength}
          targetWord={props.targetWord}
          hasSubmit={true}
          inDictionary={props.inDictionary}
        ></WordRow>
      );
    }

    function addVowel() {
      const vowels_string = "aeiou";
      const vowels = vowels_string.split("");

      const random_vowel_index = Math.round(
        Math.random() * (vowels.length - 1)
      );
      const random_vowel = vowels[random_vowel_index];

      // TODO: This sets current word (but both the WordRows update with this word!)
      props.onSubmitCountdownLetter(random_vowel);
    }

    function addConsonant() {
      const consonant_string = "qwrtypsdfghjklzxcvbnm";
      const consonants = consonant_string.split("");

      const random_consonant_index = Math.round(
        Math.random() * (consonants.length - 1)
      );
      const random_consonant = consonants[random_consonant_index];

      props.onSubmitCountdownLetter(random_consonant);
    }

    if (props.mode === "countdown_letters") {
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
            <Button mode={"default"} onClick={addVowel}>
              Vowel
            </Button>
            <Button mode={"default"} onClick={addConsonant}>
              Consonant
            </Button>
          </div>
        </div>
      );
    }

    for (let i = 0; i < rowNumber; i++) {
      let word;

      if (props.wordIndex === i) {
        /* 
        If the wordIndex and the row number are the same
        (i.e the row is currently being used)
        Show the currentWord
        */
        word = props.currentWord;
      } else if (props.wordIndex <= i) {
        /*
        If the wordIndex is behind the currently iterated row
        (i.e the row has not been used yet)
        Show an empty string 
        */
        word = "";
      } else {
        /* 
        If the wordIndex is ahead of the currently iterated row
        (i.e the row has already been used)
        Show the respective guessed word
        */
        word = props.guesses[i];
      }

      Grid.push(
        <WordRow
          key={i}
          isVertical={false}
          word={word}
          length={wordLength}
          targetWord={props.targetWord}
          hasSubmit={props.wordIndex > i || !props.inProgress}
          inDictionary={props.inDictionary}
        ></WordRow>
      );

      // Push another WordRow for interlinked gamemode
      if (props.mode === "interlinked") {
        Grid.push(
          <WordRow
            key={i}
            isVertical={true}
            word={word}
            length={
              wordLength - 1
            } /* Length is 1 smaller than horizontal counterpart */
            targetWord={props.targetWord}
            hasSubmit={props.wordIndex > i || !props.inProgress}
            inDictionary={props.inDictionary}
          ></WordRow>
        );
      }
    }

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
          <br />
          The word was: <strong>{props.targetWord}</strong>
          <br />
          {props.mode === "limitless" && <strong>-1 life</strong>}
        </MessageNotification>
      );
    }

    // The number of rows not used in guessing word
    const newLives = props.numGuesses - (props.wordIndex + 1);

    if (props.mode === "limitless") {
      // Word guessed with rows to spare
      if (newLives > 0) {
        return (
          <MessageNotification type="success">
            <strong>+{newLives}</strong> lives
          </MessageNotification>
        );
        // Word guessed with last guess
      } else if (
        props.currentWord.toUpperCase() === props.targetWord.toUpperCase()
      ) {
        return (
          <MessageNotification type="success">
            <strong>No lives added</strong>
          </MessageNotification>
        );
        // Word was not guessed
      } else {
        return (
          <MessageNotification type="default">
            The word was: <strong>{props.targetWord}</strong>
            <br />
            <strong>-1 life</strong>
          </MessageNotification>
        );
      }
    }

    // Other modes
    if (
      props.wordIndex === 0 &&
      props.currentWord.toUpperCase() === props.targetWord.toUpperCase()
    ) {
      if (props.mode === "puzzle") {
        return (
          <MessageNotification type="success">Correct</MessageNotification>
        );
      } else {
        return (
          <MessageNotification type="success">
            You guessed the word in one guess
          </MessageNotification>
        );
      }
    } else if (
      props.wordIndex < props.numGuesses &&
      props.currentWord.toUpperCase() === props.targetWord.toUpperCase()
    ) {
      return (
        <MessageNotification type="success">
          You guessed the word in <strong>{props.wordIndex + 1}</strong> guesses
        </MessageNotification>
      );
    } else {
      return (
        <MessageNotification type="default">
          The word was: <strong>{props.targetWord}</strong>
        </MessageNotification>
      );
    }
  }

  return (
    <div className="App">
      <div>{displayOutcome()}</div>
      <div>
        {!props.inProgress && props.mode !== "daily" && (
          <Button
            mode={"accept"}
            onClick={() =>
              props.mode === "increasing" ||
              (props.mode === "limitless" &&
                props.targetWord.toUpperCase() ===
                  props.currentWord.toUpperCase())
                ? props.ContinueGame()
                : props.ResetGame()
            }
          >
            {props.mode === "increasing" ||
            (props.mode === "limitless" &&
              props.targetWord.toUpperCase() ===
                props.currentWord.toUpperCase())
              ? "Continue"
              : "Restart"}
          </Button>
        )}
      </div>

      <div className="puzzle_hint">
        {props.inProgress && props.mode === "puzzle" && (
          <MessageNotification type="default">
            {props.targetHint}
          </MessageNotification>
        )}
      </div>

      <div className="word_grid">
        {populateGrid(props.numGuesses, props.wordLength)}
      </div>

      <div className="keyboard">
        <Keyboard
          onEnter={props.onEnter}
          onSubmitLetter={props.onSubmitLetter}
          onBackspace={props.onBackspace}
          guesses={props.guesses}
          targetWord={props.targetWord}
          inDictionary={props.inDictionary}
          letterStatuses={props.letterStatuses}
        ></Keyboard>
      </div>

      <div>
        {props.timerConfig.isTimed && (
          <ProgressBar
            progress={props.timerConfig.elapsedSeconds}
            total={props.timerConfig.totalSeconds}
          ></ProgressBar>
        )}
      </div>
    </div>
  );
};

export default Wordle;
