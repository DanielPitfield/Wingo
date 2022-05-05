import LetterTile from "./LetterTile";
import { SettingsData } from "./SaveData";
import crossWordGenerator from "cwg";
import { useState } from "react";
import { shuffleArray } from "./NumbersArithmetic/ArithmeticDrag";
import { Theme } from "./Themes";
import { Keyboard } from "./Keyboard";
import { getWordSummary } from "./WordleConfig";
import { Button } from "./Button";
import React from "react";
import { MessageNotification } from "./MessageNotification";

type Orientation = "vertical" | "horizontal";

type GridConfig = {
  width: number;
  height: number;
  words: { word: string; orientation: Orientation; startingXPos: number; startingYPos: number }[];
};

interface Props {
  targetWordArray: string[];
  numWords: number;
  numGuesses: number;
  settings: SettingsData;
  theme?: Theme;
}

export const WordleInterlinked: React.FC<Props> = (props) => {
  const [inProgress, setInProgress] = useState(true);
  const [remainingGuesses, setRemainingGuesses] = useState(props.numGuesses);
  const [gridConfig, setGridConfig] = useState<GridConfig>(generateGridConfig());
  const [correctGrid, setCorrectGrid] = useState<{ x: number; y: number; letter: string; wordIndex?: number }[]>(
    getCorrectLetterGrid()
  );
  const [tileStatuses, setTileStatuses] = useState<
    { x: number; y: number; status: "incorrect" | "contains" | "correct" | "not set" | "not in word" }[]
  >(
    getCorrectLetterGrid().map((position) => {
      return { x: position.x, y: position.y, status: "not set" };
    })
  );
  const [currentWords, setCurrentWords] = useState<string[]>(Array.from({ length: props.numWords }).map((x) => ""));
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);

  // Each time a word is highlighted/picked
  React.useEffect(() => {
    if (!inProgress) {
      return;
    }

    // All the information about the word (that should be at where was clicked)
    const correctWordInfo = gridConfig.words[currentWordIndex];

    if (!correctWordInfo) {
      return;
    }

    // Update the status of all tiles of the word to "not set"
    const newTileStatuses = tileStatuses.map((position) => {
      if (isWordAtPosition(correctWordInfo, position)) {
        position.status = "not set";
      }
      return position;
    });

    setTileStatuses(newTileStatuses);

    // Update the wordIndex of all the tiles to the same index
    const newCorrectLetterGrid = correctGrid.map((position) => {
      if (isWordAtPosition(correctWordInfo, position)) {
        position.wordIndex = currentWordIndex;
      }
      return position;
    });

    setCorrectGrid(newCorrectLetterGrid);

    // Log the correct word
    console.log(gridConfig.words[currentWordIndex].word);
  }, [currentWordIndex]);

  // Check if the grid has been completed each time the tileStatuses are updated
  React.useEffect(() => {
    if (!inProgress) {
      return;
    }

    const gridCompleted = tileStatuses.every(tile => {
      if (tile.status === "correct") {
        return true;
      }
    });

    if (gridCompleted) {
      setInProgress(false);
    }

  },[tileStatuses]);

  /**
   *
   * @returns
   */
  function generateGridConfig(): GridConfig {
    let targetWordArraySliced = shuffleArray(props.targetWordArray).slice(0, props.numWords);
    let result: CrosswordGenerationResult;

    do {
      result = crossWordGenerator(targetWordArraySliced);

      if (!result) {
        targetWordArraySliced = shuffleArray(props.targetWordArray).slice(0, props.numWords);
      }
    } while (!result);

    const words = result.positionObjArr.map((position) => ({
      orientation: position.isHorizon ? "horizontal" : ("vertical" as Orientation),
      startingXPos: position.xNum,
      startingYPos: position.yNum,
      word: position.wordStr,
    }));

    return {
      width: result.width,
      height: result.height,
      words,
    };
  }

  /**
   * The correct and fully populated crossword/grid
   * @returns
   */
  function getCorrectLetterGrid(): { x: number; y: number; letter: string; wordIndex?: number }[] {
    const grid = [];

    const gridWordCoordinates: { x: number; y: number; letter: string; wordIndex?: number }[] =
      gridConfig.words.flatMap((configWord) => {
        const coords = [];

        // Add the first starting coordinate in the array
        coords.push({
          x: configWord.startingXPos,
          y: configWord.startingYPos,
          letter: configWord.word.charAt(0),
          wordIndex: gridConfig.words.findIndex((x) => x.word === configWord.word),
        });

        // For the remaining length of the word
        for (let i = 1; i <= configWord.word.length; i++) {
          // Increment x co-ordinate
          if (configWord.orientation === "horizontal") {
            coords.push({
              x: configWord.startingXPos + i,
              y: configWord.startingYPos,
              letter: configWord.word.charAt(i),
              wordIndex: gridConfig.words.findIndex((x) => x.word === configWord.word),
            });
          }

          // Increment y co-ordinate
          if (configWord.orientation === "vertical") {
            coords.push({
              x: configWord.startingXPos,
              y: configWord.startingYPos + i,
              letter: configWord.word.charAt(i),
              wordIndex: gridConfig.words.findIndex((x) => x.word === configWord.word),
            });
          }
        }

        return coords;
      });

    // For each x coordinate
    for (let x = 0; x < gridConfig.width; x++) {
      // For each y coordinate
      for (let y = 0; y < gridConfig.height; y++) {
        // For each word of the config
        for (let i = 0; i < gridConfig.words.length; i++) {
          grid.push(
            gridWordCoordinates.find((c) => c.x === x && c.y === y) || {
              x,
              y,
              letter: "",
              wordIndex: undefined,
            }
          );
        }
      }
    }

    return grid;
  }

  // Does the word have a letter at the provided position?
  function isWordAtPosition(
    wordInfo: { word: string; orientation: Orientation; startingXPos: number; startingYPos: number },
    position: { x: number; y: number }
  ) {
    const horizontalCondition =
      wordInfo.orientation === "horizontal" &&
      position.x >= wordInfo.startingXPos &&
      position.x <= wordInfo.startingXPos + wordInfo.word.length &&
      position.y === wordInfo.startingYPos;

    const verticalCondition =
      wordInfo.orientation === "vertical" &&
      position.y >= wordInfo.startingYPos &&
      position.y <= wordInfo.startingYPos + wordInfo.word.length &&
      position.x === wordInfo.startingXPos;

    if (horizontalCondition || verticalCondition) {
      return true;
    } else {
      return false;
    }
  }

  function checkInput() {
    if (!inProgress) {
      return;
    }

    // Decrease number of guesses
    setRemainingGuesses(remainingGuesses - 1);

    // If just used last guess
    if (remainingGuesses <= 1) {
      setInProgress(false);
    }

    // Check if grid is completed
    checkTileStatuses(currentWords);
  }

  function checkTileStatuses(currentWords: string[]) {
    let newTileStatuses = tileStatuses.slice();

    /* 
    Most recently entered word needs to take precedence (to provide most relevant status at intersection points)
    Therefore, move the current word and correct word to the start of (sliced copies of) currentWords and gridConfig.words
    (the first condition when mapping the newTileStatuses ensures a tile's status is set to the status of the highest precedence word)
    */

    let currentWordsOrdered = currentWords.slice();
    // Move currently highlighted word to start of array
    currentWordsOrdered.unshift(currentWordsOrdered.splice(currentWordIndex, 1)[0]);

    let gridWordsOrdered = gridConfig.words.slice();
    // Move correct word (of currently highlighted row/column) to start of array
    gridWordsOrdered.unshift(gridWordsOrdered.splice(currentWordIndex, 1)[0]);

    // For each guessed word
    for (let i = 0; i < currentWordsOrdered.length; i++) {
      const wordGuessed = currentWordsOrdered[i];
      const targetWordInfo = gridWordsOrdered[i];

      // Returns summary of each letter's status in the guess
      const wordSummary = getWordSummary("wordle_interlinked", wordGuessed, targetWordInfo.word, true);

      newTileStatuses = newTileStatuses.map((position) => {
        // Status has already been changed from a previous (higher precedence) word comparison
        if (position.status !== "not set") {
          return position;
        }
        // Not a tile where the word should be
        else if (!isWordAtPosition(targetWordInfo, position)) {
          return position;
        }
        // Guess hasn't been made for this word yet
        else if (wordGuessed === "") {
          return position;
        } else if (targetWordInfo.orientation === "horizontal") {
          const xOffset = position.x - targetWordInfo.startingXPos;
          position.status = wordSummary[xOffset]?.status;
        } else if (targetWordInfo.orientation === "vertical") {
          const yOffset = position.y - targetWordInfo.startingYPos;
          position.status = wordSummary[yOffset]?.status;
        }
        return position;
      });
    }
    setTileStatuses(newTileStatuses);
  }

  function onSubmitLetter(letter: string) {
    if (!inProgress) {
      return;
    }

    const newCurrentWords = currentWords.map((word, i) => {
      // If this is not the currently 'focussed' word
      if (i !== currentWordIndex) {
        // Leave word unmodified
        return word;
      }

      // If the entered word is longer than the target word
      if (word.length >= gridConfig.words[currentWordIndex].word.length) {
        // Don't accept any more characters
        return word;
      }

      // Add the letter to the word
      return `${word}${letter}`;
    });

    setCurrentWords(newCurrentWords);
  }

  function onBackspace() {
    if (!inProgress) {
      return;
    }

    const newCurrentWords = currentWords.map((word, i) => {
      // If this is not the currently 'focussed' word
      if (i !== currentWordIndex) {
        // Leave word unmodified
        return word;
      }

      // If the entered word is empty
      if (word.length === 0) {
        // Don't remove any more characters
        return word;
      }

      // Information about the correct word that the removed tile should be one of the letters of
      const correctWordInfo = gridConfig.words[currentWordIndex];
      // Find the location of the removed/backspaced tile
      const removedTilePosX =
        correctWordInfo.orientation === "vertical"
          ? correctWordInfo.startingXPos
          : correctWordInfo.startingXPos + (word.length - 1);
      const removedTilePosY =
        correctWordInfo.orientation === "horizontal"
          ? correctWordInfo.startingYPos
          : correctWordInfo.startingYPos + (word.length - 1);

      // Change status back to "not set" for removed/backspaced tile
      const newTileStatuses = tileStatuses.slice().map((position) => {
        if (position.x === removedTilePosX && position.y === removedTilePosY) {
          position.status = "not set";
        }
        return position;
      });

      setTileStatuses(newTileStatuses);

      // Remove a letter from the word
      return word.substring(0, word.length - 1);
    });

    setCurrentWords(newCurrentWords);
  }

  function onEnter() {}

  /**
   *
   * @param y
   * @param letterGrid
   * @returns
   */
  function populateRow(y: number): JSX.Element {
    return (
      <div className="word-grid-row" key={y}>
        {Array.from({ length: gridConfig.width }).map((_, x) => {
          const matchingGridEntry = correctGrid.find((letter) => letter.x === x && letter.y === y);
          const currentWord =
            matchingGridEntry?.wordIndex !== undefined ? currentWords[matchingGridEntry.wordIndex] : "";
          const tileStatus = tileStatuses.find((tile) => tile.x === x && tile.y === y)?.status;

          // Find the letter to display
          const letter = (() => {
            // If the tile has no word (i.e. blank)
            if (!matchingGridEntry?.letter) {
              // Render blank
              return "";
            }

            // If no current word yet
            if (!currentWord || matchingGridEntry.wordIndex === undefined) {
              return "?";
            }

            const targetWord = gridConfig.words[matchingGridEntry.wordIndex];

            switch (targetWord.orientation) {
              case "horizontal": {
                const xOffset = x - targetWord.startingXPos;

                return currentWord[xOffset] || "?";
              }

              case "vertical": {
                const yOffset = y - targetWord.startingYPos;

                return currentWord[yOffset] || "?";
              }
            }
          })();

          return (
            <div className="letter-tile-wrapper" data-is-focussed={matchingGridEntry?.wordIndex === currentWordIndex}>
              <LetterTile
                key={x}
                letter={inProgress ? letter : matchingGridEntry ? matchingGridEntry?.letter : "?"}
                settings={props.settings}
                status={letter === "?" ? "not set" : tileStatus ? tileStatus : "not set"}
                onClick={matchingGridEntry ? () => setCurrentWordIndex(matchingGridEntry.wordIndex!) : undefined}
                additionalProps={letter ? undefined : { style: { visibility: "hidden" } }}
              />
            </div>
          );
        })}
      </div>
    );
  }

  /**
   *
   * @returns
   */
  function populateGrid() {
    const grid = [];

    for (let y = 0; y < gridConfig.height; y++) {
      grid.push(populateRow(y));
    }

    return grid;
  }

  function allowSpaces() {
    // Any word with spaces, return true
    return props.targetWordArray.filter((word) => word.indexOf(" ") >= 0).length > 0;
  }

  function displayOutcome(): React.ReactNode {
    // Game still in progress, don't display anything
    if (inProgress) {
      return;
    }

    // TODO: Show correctLetterGrid

    // Is the grid completed (all correct words entered?)
    const gridCompleted = tileStatuses.every(tile => {
      if (tile.status === "correct") {
        return true;
      }
    });

    return (
      <>
        <MessageNotification type={gridCompleted ? "success" : "error"}>
          <strong>
            {gridCompleted ? "Correct!" : `Incorrect! The correct answers were:`}
          </strong>
        </MessageNotification>

        <br></br>

        <Button mode="accept" settings={props.settings} onClick={() => ResetGame()}>
          Restart
        </Button>
      </>
    );
  }

  function ResetGame() {
    setInProgress(true);
    setCurrentWordIndex(0);
    setRemainingGuesses(props.numGuesses);
    setTileStatuses(getCorrectLetterGrid().map((position) => {
      return { x: position.x, y: position.y, status: "not set" };
    }));
    setCurrentWords(Array.from({ length: props.numWords }).map((x) => ""));
    setGridConfig(generateGridConfig());
    setCorrectGrid(getCorrectLetterGrid());
  }

  return (
    <div
      className="App wordle_interlinked"
      style={{ backgroundImage: props.theme && `url(${props.theme.backgroundImageSrc})` }}
    >
      {!inProgress && (<div className="outcome">{displayOutcome()}</div>)}
      {inProgress && (
        <MessageNotification type="default">{`Guesses left: ${remainingGuesses}`}</MessageNotification>
      )}
      <div className="word_grid">{populateGrid()}</div>
      {inProgress && (
        <Button mode="accept" settings={props.settings} onClick={checkInput}>
          Check input
        </Button>
      )}
      <div className="keyboard">
        {
          <Keyboard
            mode={"wingo/interlinked"}
            onEnter={onEnter}
            onSubmitLetter={onSubmitLetter}
            onBackspace={onBackspace}
            guesses={[]}
            targetWord={""}
            inDictionary={true}
            letterStatuses={[]}
            settings={props.settings}
            disabled={!inProgress}
            allowSpaces={allowSpaces()}
          ></Keyboard>
        }
      </div>
    </div>
  );
};
