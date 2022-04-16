import React from "react";
import { Keyboard } from "../Keyboard";
import { Page } from "../App";
import { WordRow } from "../WordRow";
import { Button } from "../Button";
import { MessageNotification } from "../MessageNotification";
import ProgressBar, { GreenToRedColorTransition } from "../ProgressBar";

interface Props {
  timerConfig: { isTimed: false } | { isTimed: true; totalSeconds: number; elapsedSeconds: number };
  keyboard: boolean;
  wordLength: number;
  numGuesses: number;
  guesses: string[];
  currentWord: string;
  wordIndex: number;
  inProgress: boolean;
  hasSubmitLetter: boolean;
  correctGuessesCount: number;
  categoryRequiredStartingLetter?: string;
  categoryWordTargets?: string[][];
  categoryNames?: string[];
  finishingButtonText?: string;
  setPage: (page: Page) => void;
  onEnter: () => void;
  onSubmitLetter: (letter: string) => void;
  onBackspace: () => void;
  ResetGame: () => void;
}

const LetterCategories: React.FC<Props> = (props) => {
  // Create grid of rows (for guessing words)
  function populateGrid(rowNumber: number, wordLength: number) {
    var Grid = [];

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

      const row = props.categoryNames?.[i] ? (
        <div className="word-row-category-wrapper">
          <div className="word-row-category-name">{props.categoryNames?.[i]}</div>
          <WordRow
            key={i}
            mode={"letters_categories"}
            inProgress={props.inProgress}
            isVertical={false}
            word={word}
            length={wordLength}
            targetWord={""}
            targetArray={props.categoryWordTargets ? props.categoryWordTargets[i] : []}
            hasSubmit={props.wordIndex > i || !props.inProgress}
            inDictionary={true}
          />
        </div>
      ) : (
        <WordRow
          key={i}
          mode={"letters_categories"}
          inProgress={props.inProgress}
          isVertical={false}
          word={word}
          length={wordLength}
          targetWord={""}
          targetArray={props.categoryWordTargets ? props.categoryWordTargets[i] : []}
          hasSubmit={props.wordIndex > i || !props.inProgress}
          inDictionary={true}
        />
      );

      Grid.push(row);
    }

    return Grid;
  }

  function displayOutcome(): JSX.Element {
    // Game still in progress, don't display anything
    if (props.inProgress) {
      return <></>;
    }

    // All correct
    if (props.correctGuessesCount === props.numGuesses) {
      return (
        <MessageNotification type="success">
          <strong>{`You guessed a correct word for all ${props.correctGuessesCount} categories!`}</strong>
        </MessageNotification>
      );
    }
    // All incorrect
    else if (props.correctGuessesCount === 0) {
      return (
        <MessageNotification type="error">
          <strong>{`You didn't guess a correct word for any of the ${props.numGuesses} categories`}</strong>
        </MessageNotification>
      );
    }
    // Some (atleast one) words were right
    else {
      return (
        <MessageNotification type="default">
          <strong>{`You guessed a correct word for ${props.correctGuessesCount} of the ${props.numGuesses} categories`}</strong>
        </MessageNotification>
      );
    }
  }

  return (
    <div className="App">
      <div>{displayOutcome()}</div>
      <div>
        {!props.inProgress && (
          <Button mode={"accept"} onClick={() => props.ResetGame()}>
            {"Restart"}
          </Button>
        )}
      </div>

      <div className="word_grid">{populateGrid(props.numGuesses, props.wordLength)}</div>

      <div className="keyboard">
        {
          /* TODO: Add options to turn keyboard/timer/first letter after Wordle has been launched (during the game) */ props.keyboard && (
            <Keyboard
              mode={"letters_categories"}
              onEnter={props.onEnter}
              onSubmitLetter={props.onSubmitLetter}
              onBackspace={props.onBackspace}
              guesses={props.guesses}
              targetWord={""}
              inDictionary={true}
              letterStatuses={[]}
            ></Keyboard>
          )
        }
      </div>

      <div>
        {props.timerConfig.isTimed && (
          <ProgressBar
            progress={props.timerConfig.elapsedSeconds}
            total={props.timerConfig.totalSeconds}
            display={{ type: "transition", colorTransition: GreenToRedColorTransition }}
          ></ProgressBar>
        )}
      </div>
    </div>
  );
};

export default LetterCategories;
