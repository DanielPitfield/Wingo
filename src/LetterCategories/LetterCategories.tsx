import React from "react";
import "../App.scss";
import { Keyboard } from "../Keyboard";
import { Page } from "../App";
import { WordRow } from "../WordRow";
import { Button } from "../Button";
import { MessageNotification } from "../MessageNotification";
import ProgressBar, { GreenToRedColorTransition } from "../ProgressBar";
import { categoryMappings } from "../WordleConfig";

interface Props {
  timerConfig: { isTimed: false } | { isTimed: true; totalSeconds: number; elapsedSeconds: number };
  keyboard: boolean;
  wordLength: number;
  numGuesses: number;
  guesses: string[];
  currentWord: string;
  wordIndex: number;
  inProgress: boolean;
  isIncompleteWord: boolean;
  hasSubmitLetter: boolean;
  targetWord: string;
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

      Grid.push(
        <WordRow
          key={i}
          mode={"letters_categories"}
          inProgress={props.inProgress}
          isVertical={false}
          word={word}
          length={wordLength}
          targetWord={props.targetWord}
          targetArray={props.categoryWordTargets ? props.categoryWordTargets[i] : []}
          hasSubmit={props.wordIndex > i || !props.inProgress}
          inDictionary={true}
          isIncompleteWord={props.isIncompleteWord}
        ></WordRow>
      );
    }

    return Grid;
  }

  function displayOutcome() {
    // Game still in progress, don't display anything
    if (props.inProgress) {
      return;
    } else {
      // Number of green rows / total rows
    }
  }

  return (
    <div className="App">
      <div>{/*displayOutcome()*/}</div>
      <div>
        {!props.inProgress && (
          <Button mode={"accept"} onClick={() => props.ResetGame()}>
            {"Restart"}
          </Button>
        )}
      </div>

      <MessageNotification type="default">
        {/*TODO: Format text, ideally would position near respective WordRow */ JSON.stringify(props.categoryNames)}
        </MessageNotification>

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
              targetWord={props.targetWord}
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
