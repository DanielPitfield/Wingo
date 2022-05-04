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

type Orientation = "vertical" | "horizontal";

type GridConfig = {
  width: number;
  height: number;
  words: { word: string; orientation: Orientation; startingXPos: number; startingYPos: number }[];
};

interface Props {
  targetWordArray: string[];
  numWords: number;
  settings: SettingsData;
  theme?: Theme;
}

export const WordleInterlinked: React.FC<Props> = (props) => {
  const [inProgress, setInProgress] = useState(true);
  const [gridConfig] = useState<GridConfig>(generateGridConfig());
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

  // Re-evaluate tile statuses each time a word is highlighted/picked
  React.useEffect(() => {
    //checkTileStatuses(currentWords);
    console.log(gridConfig.words[currentWordIndex]);
  }, [currentWordIndex]);

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

  // Changes the precedence of wordIndex for intersection points (when a word is clicked)
  function updateGridWordIndexes(
    matchingGridEntry: { x: number; y: number; letter: string; wordIndex?: number } | undefined
  ) {
    if (matchingGridEntry === undefined || matchingGridEntry.wordIndex === undefined) {
      return;
    }

    // Update the currently highlighted word
    setCurrentWordIndex(matchingGridEntry.wordIndex!);

    // Al the information about the word (that should at where was clicked)
    const correctWordInfo = gridConfig.words[matchingGridEntry.wordIndex];

    // Log the correct word (when it becomes highlighted)
    console.log(correctWordInfo.word);

    if (!correctWordInfo) {
      return;
    }

    // Update the wordIndex of all the tiles of the clicked word (to the same index)
    const newCorrectLetterGrid = correctGrid.map((position) => {
      if (isWordAtPosition(correctWordInfo, position)) {
        position.wordIndex = matchingGridEntry.wordIndex;
      }
      return position;
    });

    setCorrectGrid(newCorrectLetterGrid);
  }

  // Does the word have a letter at the provided position?
  function isWordAtPosition(
    wordInfo: { word: string; orientation: Orientation; startingXPos: number; startingYPos: number },
    /* TODO: Position is used as an element of correctGrid but also of tileStatuses */
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

  function checkTileStatuses(currentWords: string[]) {
    let newTileStatuses = tileStatuses.slice();

    /*
    The most recently entered/highlighted word needs to be evaluated last
    The most recent word must be the last element in both currentWords and gridConfig.words
    */

    const currentWordsCopy = currentWords.slice();
    // Remove most recent word from this copy
    const mostRecentWord = currentWordsCopy.splice(currentWordIndex, 1);
    // Put it back at the end of array
    const currentWordsOrdered = currentWordsCopy.concat(mostRecentWord);

    const gridConfigWordsCopy = gridConfig.words.slice();
    // Find which index the most recent word is at
    const mostRecentWordIndex = gridConfigWordsCopy.findIndex((wordInfo) => wordInfo.word === mostRecentWord[0]);
    // gridConfig.words but with the most recently changed word moved to the end
    const gridConfigWords = gridConfigWordsCopy.concat(gridConfigWordsCopy.splice(mostRecentWordIndex, 1));

    // For each guessed word
    for (let i = 0; i < currentWordsOrdered.length; i++) {
      const wordGuessed = currentWordsOrdered[i];
      const targetWordInfo = gridConfigWords[i];

      if (wordGuessed.length > 2) {
        console.log(wordGuessed);
        console.log(targetWordInfo.word);
      }

      // Returns summary of each letter's status in the guess
      const wordSummary = getWordSummary("wordle_interlinked", wordGuessed, targetWordInfo.word, true);

      newTileStatuses = newTileStatuses.map((position) => {
        if (!isWordAtPosition(targetWordInfo, position)) {
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
      const removedTilePosX = correctWordInfo.orientation === "vertical" ? correctWordInfo.startingXPos : correctWordInfo.startingXPos + (word.length - 1);
      const removedTilePosY = correctWordInfo.orientation === "horizontal" ? correctWordInfo.startingYPos : correctWordInfo.startingYPos + (word.length - 1);

      // Change status back to "not set" for removed/backspaced tile
      const newTileStatuses = tileStatuses.slice().map(position => {
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

    // TODO: Delete?
    // Remove any previous statuses (from when a letter was there before)
    // checkTileStatuses(newCurrentWords);
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
                letter={letter}
                settings={props.settings}
                status={letter === "?" ? "not set" : tileStatus ? tileStatus : "not set"}
                onClick={matchingGridEntry ? () => updateGridWordIndexes(matchingGridEntry) : undefined}
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

  return (
    <div
      className="App wordle_interlinked"
      style={{ backgroundImage: props.theme && `url(${props.theme.backgroundImageSrc})` }}
    >
      <div className="word_grid">{populateGrid()}</div>
      {inProgress && (
        <Button mode="accept" settings={props.settings} onClick={() => checkTileStatuses(currentWords)}>
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
