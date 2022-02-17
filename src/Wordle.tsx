import React, { useState } from "react";
import "./App.css";
import { Keyboard } from "./Keyboard";
import { Page } from "./App";
import { WordRow } from "./WordRow";
import { Logo } from "./Logo";
import { Button } from "./Button";

interface Props {
  mode: "daily" | "repeat" | "limitless";
  wordLength: number;
  numGuesses: number;
  guesses: string[];
  currentWord: string;
  wordIndex: number;
  inProgress: boolean;
  inDictionary: boolean;
  targetWord: string;
  setPage: (page: Page) => void;
  onEnter: () => void;
  onSubmitLetter: (letter: string) => void;
  onBackspace: () => void;
  ResetGame: () => void;
  ContinueGame: () => void;
}

const Wordle: React.FC<Props> = (props) => {
  /* Create grid of rows (for guessing words) */
  function populateGrid(rowNumber: number, wordLength: number) {
    var Grid = [];
    for (let i = 0; i < rowNumber; i++) {
      /* 
      If the wordIndex and the row number are the same
      (i.e the row is currently being used)
      Show the currentWord
      */

      /*
      If the wordIndex is behind the currently iterated row
      (i.e the row has not been used yet)
      Show an empty string 
      */

      /* 
      If the wordIndex is ahead of the currently iterated row
      (i.e the row has already been used)
      Show the respective guessed word
      */
      Grid.push(
        <WordRow
          key={i}
          word={
            props.wordIndex === i
              ? props.currentWord
              : props.wordIndex <= i
              ? ""
              : props.guesses[i]
          }
          length={wordLength}
          targetWord={props.targetWord}
          hasSubmit={props.wordIndex > i || !props.inProgress}
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
            label={
              props.mode === "limitless" &&
              props.targetWord.toUpperCase() === props.currentWord.toUpperCase()
                ? "Continue"
                : "Restart"
            }
            onClick={() =>
              props.mode === "limitless" &&
              props.targetWord.toUpperCase() === props.currentWord.toUpperCase()
                ? props.ContinueGame()
                : props.ResetGame()
            }
          ></Button>
        )}
      </div>

      <div className="word_grid">
        {populateGrid(props.numGuesses, props.wordLength)}
      </div>

      <div className="keyboard">
        <Keyboard
          onEnter={() => {
            props.onEnter();
          }}
          onSubmitLetter={(letter) => {
            props.onSubmitLetter(letter);
          }}
          onBackspace={() => {
            props.onBackspace();
          }}
        ></Keyboard>
      </div>
    </div>
  );
};

export default Wordle;
