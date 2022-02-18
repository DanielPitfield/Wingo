import React, { useState } from "react";
import "./App.css";
import { Keyboard } from "./Keyboard";
import { Page } from "./App";
import { WordRow } from "./WordRow";
import { Logo } from "./Logo";
import { Button } from "./Button";

interface Props {
  mode: "daily" | "repeat" | "limitless" | "puzzle";
  wordLength: number;
  numGuesses: number;
  guesses: string[];
  currentWord: string;
  wordIndex: number;
  inProgress: boolean;
  inDictionary: boolean;
  hasSubmitLetter: boolean;
  targetWord: string;
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
  onSubmitLetter: (letter: string) => void;
  onBackspace: () => void;
  ResetGame: () => void;
  ContinueGame: () => void;
  getLetterStatus: (
    letter: string,
    index: number
  ) => "incorrect" | "contains" | "correct" | "not set" | "not in word";
}

const Wordle: React.FC<Props> = (props) => {
  /* Create grid of rows (for guessing words) */
  function populateGrid(rowNumber: number, wordLength: number) {
    var Grid = [];

    if (props.mode === "puzzle") {
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
          length={wordLength}
          targetWord={props.targetWord}
          hasSubmit={true}
          getLetterStatus={props.getLetterStatus}
          inDictionary={props.inDictionary}
        ></WordRow>
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
          word={word}
          length={wordLength}
          targetWord={props.targetWord}
          hasSubmit={props.wordIndex > i || !props.inProgress}
          getLetterStatus={props.getLetterStatus}
          inDictionary={props.inDictionary}
        ></WordRow>
      );
    }

    return Grid;
  }

  function displayOutcome() {
    if (props.inProgress) {
      return;
    }

    if (!props.inDictionary) {
      return (
        <>
          {props.currentWord} is not a valid word<br></br>
          The word was: {props.targetWord}
        </>
      );
    }

    if (props.wordIndex === 0) {
      return <>You guessed the word in one guess</>;
    } else if (
      props.wordIndex < props.numGuesses &&
      props.currentWord.toUpperCase() === props.targetWord.toUpperCase()
    ) {
      return <>You guessed the word in {props.wordIndex + 1} guesses</>;
    } else {
      return <>The word was: {props.targetWord}</>;
    }
  }

  return (
    <div className="App">
      <div className="title">
        <Logo></Logo>
      </div>
      <div>{displayOutcome()}</div>
      <div>
        {!props.inProgress && props.mode !== "daily" && (
          <Button
            mode={"accept"}
            onClick={() =>
              props.mode === "limitless" &&
              props.targetWord.toUpperCase() === props.currentWord.toUpperCase()
                ? props.ContinueGame()
                : props.ResetGame()
            }
          >
            {props.mode === "limitless" &&
            props.targetWord.toUpperCase() === props.currentWord.toUpperCase()
              ? "Continue"
              : "Restart"}
          </Button>
        )}
      </div>

      <div className="puzzle_hint">
        {props.inProgress && props.mode === "puzzle" && <>{props.targetHint}</>}
      </div>

      <div className="word_grid">
        {populateGrid(props.numGuesses, props.wordLength)}
      </div>

      <div className="keyboard">
        <Keyboard
          onEnter={props.onEnter}
          onSubmitLetter={props.onSubmitLetter}
          onBackspace={props.onBackspace}
          letterStatuses={props.letterStatuses}
        ></Keyboard>
      </div>
    </div>
  );
};

export default Wordle;
