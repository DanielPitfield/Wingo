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
  const [gridWords, setGridWords] = useState<{ word: string; categoryName: string; inCompleteGroup: boolean }[]>([]);
  const [selectedWords, setSelectedWords] = useState<{ word: string; categoryName: string }[]>([]);
  const [numCompletedGroups, setNumCompletedGroups] = useState(0);
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
    setGridWords(grid_words);
  }, []);

  // Check selection
  React.useEffect(() => {
    if (!inProgress) {
      return;
    }

    // Not full selection
    if (selectedWords.length !== props.groupSize) {
      return;
    }

    // Get the category name of the first word in the selection
    const category = selectedWords[0].categoryName;

    // Count how many words in the selection are from this category
    const numCorrectWords = selectedWords.filter(word => word.categoryName === category).length;

    // All of the words are from the same category
    if (numCorrectWords === selectedWords.length) {
      const newGridWords = gridWords.map((x, index) => {
        // Every word of the category found (with the selection)
        if (gridWords[index].categoryName === category) {
          // Update the boolean flag to say it is part of a complete group
          x.inCompleteGroup = true;
        }
        return x;
      });

      setGridWords(newGridWords);

      // Determine the row number of where this row should be shown on the grid
      const rowNumber = numCompletedGroups + 1;
      // Increment count of how many groups have been correctly selected
      setNumCompletedGroups(rowNumber);

      /* TODO: Re-order gridWords (shove row into correct position on grid)
      Say the selection is the first complete group,
      the words of that group all need to be shown on the first row of the grid together,
      ideally with the tiles all having a background colour unique to that group
      */

    }

  }, [selectedWords]);

  function handleSelection(gridItem : { word: string, categoryName: string, inCompleteGroup: boolean } ) {
    if (!inProgress) {
      return;
    }

    if (!gridItem) {
      return;
    }

    let newSelectedWords = selectedWords.slice();

    // Word is already selected
    if (selectedWords.includes(gridItem)) {
      // Remove word from selection (de-select)
      newSelectedWords = newSelectedWords.filter((x) => x !== gridItem);
    }
    // Room for word to be added to selection
    else if (selectedWords.length < props.groupSize) {
      newSelectedWords.push(gridItem);
    }
    // Selection is already full
    else {
      return;
    }

    setSelectedWords(newSelectedWords);
  }

  // (props.groupSize) words from (props.numGroups) categories, shuffled
  function getGridWords(): { word: string; categoryName: string; inCompleteGroup: boolean }[] {
    // Names of the groups/categories that must be found in the wall
    let category_names: string[] = [];

    // Array to hold all the words for the grid (along with their categories)
    let grid_words: { word: string; categoryName: string; inCompleteGroup: boolean }[] = [];

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
        let wordSubset: string[] = [];

        // Until a full group of words has been determined from the category
        while (wordSubset.length < props.groupSize) {
          const newIndex = Math.round(Math.random() * (wordList.length - 1));
          const randomWord = wordList[newIndex];

          // Word has not already been selected (avoids duplicates)
          if (randomWord && !wordSubset.includes(randomWord)) {
            wordSubset.push(randomWord);
          }
        }

        // Attach category name to word (in an object)
        const categorySubset = wordSubset.map((word) => ({ word: word, categoryName: randomCategory.name, inCompleteGroup: false }));

        // Add group of words
        grid_words = grid_words.concat(categorySubset);

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
          const index = (rowNumber * props.groupSize) + i;
          const gridItem = gridWords[index];
          return (
            <button key={index} className="only-connect-button" data-selected={selectedWords.includes(gridItem)} onClick={() => handleSelection(gridItem)}>
              {gridItem ? gridItem.word : ""}
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
