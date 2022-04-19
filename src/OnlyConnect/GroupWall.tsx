import React, { useState } from "react";
import { Page } from "../App";
import { Button } from "../Button";
import { MessageNotification } from "../MessageNotification";
import { shuffleArray } from "../NumbersArithmetic/ArithmeticDrag";
import ProgressBar, { GreenToRedColorTransition } from "../ProgressBar";
import { categoryMappings } from "../WordleConfig";

interface Props {
  numGroups: number;
  groupSize: number;
  numGuesses: number;
  timerConfig: { isTimed: false } | { isTimed: true; seconds: number };
  setPage: (page: Page) => void;
}

/** */
const GroupWall: React.FC<Props> = (props) => {
  const [inProgress, setInProgress] = useState(true);
  const [gridWords, setGridWords] = useState<string[]>([]);
  const [remainingGuesses, setRemainingGuesses] = useState(props.numGuesses);
  const [seconds, setSeconds] = useState(props.timerConfig.isTimed ? props.timerConfig.seconds : 0);

  // (Guess) Timer Setup
  React.useEffect(() => {
    if (!props.timerConfig.isTimed || !inProgress) {
      return;
    }

    const timerGuess = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      } else {
        setInProgress(false);
      }
    }, 1000);
    return () => {
      clearInterval(timerGuess);
    };
  }, [setSeconds, seconds, props.timerConfig.isTimed]);

  // Populate grid/wall
  React.useEffect(() => {
    // Grid words already initialised
    if (gridWords.length > 0) {
      return;
    }

    const grid_words = getGridWords();
    console.log(grid_words);
    setGridWords(grid_words);

  }, []);

  // (props.groupSize) words from (props.numGroups) categories, shuffled
  function getGridWords(): string[] {
    // Names of the groups/categories that must be found in the wall
    let category_names: string[] = [];

    // Array to hold all the words for the grid (from all the categories)
    let grid_words: string[] = [];

    // Use the specified number of groups but never exceed the number of category word lists
    const numCategories = Math.min(props.numGroups, categoryMappings.length);

    while (category_names.length < numCategories) {
      // Get a random index of categoryMappings
      const newIndex = Math.round(Math.random() * (categoryMappings.length - 1));

      // Get a random category by using this index
      const randomCategory = categoryMappings[newIndex];

      // If the category has not already been used and there are enough words in the word list
      if (!category_names.includes(randomCategory.name) && randomCategory.array.length >= props.groupSize) {
        const wordList = randomCategory.array;

        // Array to hold the group of words from this category
        const selectedWords: string[] = [];

        // Until a full group of words has been determined from the category
        while (selectedWords.length < props.groupSize) {
          const newIndex = Math.round(Math.random() * (wordList.length - 1));
          const randomWord = wordList[newIndex];

          // Word has not already been selected (avoids duplicates)
          if (randomWord && !selectedWords.includes(randomWord)) {
            selectedWords.push(randomWord);
          }
        }

        // Add group of words to array of words for entire grid
        grid_words = grid_words.concat(selectedWords);

        // Keep track this category has been used
        category_names.push(categoryMappings[newIndex].name);
      }
    }

    grid_words = shuffleArray(grid_words);
    return grid_words;
  }

  function populateRow(rowNumber: number) {
    return (
      <div className="only-connect-row">
        {Array.from({ length: props.groupSize }).map((_, i) => {
          let index = rowNumber * props.groupSize + i;
          return (
            <button key={index} className="only-connect-button">
              {gridWords[index]}
            </button>
          );
        })}
      </div>
    );
  }

  function displayGrid() {
    var Grid = [];

    for (let i = 0; i < props.numGroups; i++) {
      Grid.push(populateRow(i));
    }

    return Grid;
  }

  /**
   *
   * @returns
   */
  function displayOutcome(): React.ReactNode {
    // Game still in progress, don't display anything
    if (inProgress) {
      return;
    }

    return (
      <>
        <MessageNotification type="default">
          <strong></strong>
        </MessageNotification>

        <br></br>

        <Button mode="accept" onClick={() => ResetGame()}>
          Restart
        </Button>
      </>
    );
  }

  function ResetGame() {
    setInProgress(true);
    setRemainingGuesses(props.numGuesses);

    if (props.timerConfig.isTimed) {
      // Reset the timer if it is enabled in the game options
      setSeconds(props.timerConfig.seconds);
    }
  }

  return (
    <div className="App only_connect_wall">
      <div className="outcome">{displayOutcome()}</div>
      {inProgress && <MessageNotification type="default">{`Guesses left: ${remainingGuesses}`}</MessageNotification>}
      <div className="only_connect_wall">{displayGrid()}</div>
      <div>
        {props.timerConfig.isTimed && (
          <ProgressBar
            progress={seconds}
            total={props.timerConfig.seconds}
            display={{ type: "transition", colorTransition: GreenToRedColorTransition }}
          ></ProgressBar>
        )}
      </div>
    </div>
  );
};

export default GroupWall;
