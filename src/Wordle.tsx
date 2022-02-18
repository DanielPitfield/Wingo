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
  targetWord: string;
  targetHint: string;
  puzzleRevealMs: number;
  puzzleLeaveNumBlanks: number;
  setPage: (page: Page) => void;
  onEnter: () => void;
  onSubmitLetter: (letter: string) => void;
  onBackspace: () => void;
  ResetGame: () => void;
  ContinueGame: () => void;
}

const Wordle: React.FC<Props> = (props) => {
  const [revealedLetterIndexes, setRevealedLetterIndexes] = useState<number[]>(
    []
  );

  const [letterStatuses, setletterStatuses] = useState<
    {
      letter: string;
      status: "" | "contains" | "correct" | "not set" | "not in word";
    }[]
  >([
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
  ]);

  React.useEffect(() => {
    // props.guesses.map((guess) => {
    //   // Get the letter statuses for all letters of this guess string
    //   const letterStatuses = guess
    //     .split("")
    //     .map((letter, i) => ({ letter, status: getLetterStatus(letter, i) }));

    // });

    const letterStatusesCopy = letterStatuses.slice();

    for (const guess of props.guesses) {
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
  }, [props.guesses, props.wordIndex]);

  React.useEffect(() => {
    let intervalId: number;

    if (props.mode === "puzzle") {
      intervalId = window.setInterval(() => {
        if (
          revealedLetterIndexes.length >=
          props.targetWord.length - props.puzzleLeaveNumBlanks
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
          newrevealedLetterIndexes.push(props.targetWord.length - 1);
        } else {
          let newIndex: number;

          do {
            newIndex = Math.round(Math.random() * props.targetWord.length - 1);
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
  }, [props.mode, props.targetWord, revealedLetterIndexes]);

  /* Create grid of rows (for guessing words) */
  function populateGrid(rowNumber: number, wordLength: number) {
    var Grid = [];

    if (props.mode === "puzzle") {
      let displayWord = "";

      for (let i = 0; i < props.targetWord.length; i++) {
        if (revealedLetterIndexes.includes(i)) {
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
          getLetterStatus={getLetterStatus}
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
          getLetterStatus={getLetterStatus}
          inDictionary={props.inDictionary}
        ></WordRow>
      );
    }

    return Grid;
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

    if (!props.inDictionary) {
      // Red
      status = "incorrect";
    } else if (
      props.targetWord[index]?.toUpperCase() === letter?.toUpperCase()
    ) {
      // Green
      status = "correct";
    } else if (props.targetWord?.toUpperCase().includes(letter?.toUpperCase())) {
      // Yellow
      status = "contains";
      // Keyboard button with letter props.word[i],
    } else {
      status = "not in word"; // Another status for letter is not in word?
    }

    return status;
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
          letterStatuses={letterStatuses}
        ></Keyboard>
      </div>
    </div>
  );
};

export default Wordle;
