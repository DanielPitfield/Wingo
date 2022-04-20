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
  const [gridWords, setGridWords] = useState<
    { word: string; categoryName: string; inCompleteGroup: boolean; rowNumber: number | null }[]
  >([]);
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
    const numCorrectWords = selectedWords.filter((word) => word.categoryName === category).length;

    // If not all of the selected words are from the same category
    if (numCorrectWords !== selectedWords.length) {
      // Reset the selected words
      setSelectedWords([]);

      return;
    }

    // Count the number of groups BEFORE checking each grid word
    const completedGroupCountPre = gridWords.filter((x) => x.inCompleteGroup).length / props.groupSize;

    const newGridWords = gridWords
      .map((x, index) => {
        // If the word is not in the selected words
        if (!selectedWords.some((y) => y.word === x.word)) {
          // Ignore it
          return x;
        }

        // Every word of the category found (with the selection)
        if (gridWords[index].categoryName === category) {
          // Update the boolean flag to say it is part of a complete group
          x.inCompleteGroup = true;

          // Add the row number of the completed group
          x.rowNumber = numCompletedGroups + 1;
        }

        return x;
      })
      /* 
        Re-orders gridWords (shove row into correct position on grid)
        Say the selection is the first complete group,
        the words of that group all need to be shown on the first row of the grid together.

        The 999's ensure that if a grid word has no row number (i.e. no part of a group),
        that it appears after any grouped words.
        */
      .sort((a, b) => {
        return (a?.rowNumber || 999) - (b?.rowNumber || 999);
      });

    // Count the number of groups AFTER checking each grid word
    const completedGroupCountPost = newGridWords.filter((x) => x.inCompleteGroup).length / props.groupSize;

    // If there is a new completed group (i.e. the group count has incremented by 1)
    if (completedGroupCountPost > completedGroupCountPre) {
      // If there is only 1 group left
      if (completedGroupCountPost === props.groupSize - 1) {
        // Auto-complete the last group
        setGridWords(
          newGridWords.map((gridWord) => ({
            ...gridWord,

            // Set all to true
            inCompleteGroup: true,

            // Set the row number to the final row number, if not already set
            rowNumber: gridWord.rowNumber === null ? numCompletedGroups + 2 : gridWord.rowNumber,
          }))
        );

        // Increment count of how many groups have been correctly selected
        setNumCompletedGroups(numCompletedGroups + 2);

        setInProgress(false);
      } else {
        // Update the calculated grid words
        setGridWords(newGridWords);

        // Increment count of how many groups have been correctly selected
        setNumCompletedGroups(numCompletedGroups + 1);
      }
    }

    // Reset the selected words
    setSelectedWords([]);
  }, [selectedWords]);

  function handleSelection(gridItem: { word: string; categoryName: string; inCompleteGroup: boolean }) {
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
  function getGridWords(): {
    word: string;
    categoryName: string;
    inCompleteGroup: boolean;
    rowNumber: number | null;
  }[] {
    // Names of the groups/categories that must be found in the wall
    let category_names: string[] = [];

    // Array to hold all the words for the grid (along with their categories)
    let grid_words: { word: string; categoryName: string; inCompleteGroup: boolean; rowNumber: number | null }[] = [];

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
        const categorySubset = wordSubset.map((word) => ({
          word: word,
          categoryName: randomCategory.name,
          inCompleteGroup: false,
          rowNumber: null,
        }));

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
          const index = rowNumber * props.groupSize + i;
          const gridItem = gridWords[index];

          return (
            <button
              key={index}
              className="only-connect-button"
              data-num-completed-groups={numCompletedGroups}
              data-row-number={gridItem?.rowNumber}
              data-selected={selectedWords.includes(gridItem)}
              onClick={() => handleSelection(gridItem)}
            >
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