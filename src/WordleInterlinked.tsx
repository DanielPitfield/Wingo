import LetterTile from "./LetterTile";
import { SettingsData } from "./SaveData";
import { useState } from "react";
import { shuffleArray } from "./NumbersArithmetic/ArithmeticDrag";
import { Theme } from "./Themes";
import { Keyboard } from "./Keyboard";
import { categoryMappings, getWordSummary, wordLengthMappingsTargets } from "./WordleConfig";
import { Button } from "./Button";
import React from "react";
import { MessageNotification } from "./MessageNotification";
import { CrosswordGenerationResult, crosswordGenerator as crossWordGenerator } from "./CrossWordGenerator";

type Orientation = "vertical" | "horizontal";

type GridConfig = {
  width: number;
  height: number;
  words: { word: string; orientation: Orientation; startingXPos: number; startingYPos: number }[];
};

export type TileStatus = {
  x: number;
  y: number;
  status: "incorrect" | "contains" | "correct" | "not set" | "not in word";
};

interface Props {
  wordArrayConfig: { type: "custom"; array: string[]; useExact: boolean } | { type: "category" } | { type: "length" };
  displayHints: boolean;
  provideWords: boolean;
  // Additional units allowed in grid height or width (in addition to maxWordLength)
  fitRestriction?: number;
  numWords: number;
  minWordLength: number;
  maxWordLength: number;
  numWordGuesses?: number;
  numGridGuesses: number;
  settings: SettingsData;
  initialConfig?: {
    words: string[];
    inProgress: boolean;
    tileStatuses: TileStatus[];
    currentWords: string[];
    currentWordIndex: number;
    remainingGridGuesses: number;
    remainingWordGuesses?: number;
  };
  theme?: Theme;
  onSave?: (
    words: string[],
    inProgress: boolean,
    tileStatuses: TileStatus[],
    currentWords: string[],
    currentWordIndex: number,
    remainingGridGuesses: number,
    remainingWordGuesses?: number
  ) => void;
  onComplete?: (wasCorrect: boolean, answer: string, targetAnswer: string, score: number | null) => void;
}

export const WordleInterlinked: React.FC<Props> = (props) => {
  const [inProgress, setInProgress] = useState(props.initialConfig?.inProgress ?? true);
  const [allowSpaces, setAllowSpaces] = useState(false);
  const [remainingWordGuesses, setRemainingWordGuesses] = useState(
    props.initialConfig?.remainingWordGuesses ?? props.numWordGuesses
  );
  const [remainingGridGuesses, setRemainingGridGuesses] = useState(
    props.initialConfig?.remainingGridGuesses ?? props.numGridGuesses
  );
  // Crossword configuration generated when provided with an array of words
  const [gridConfig, setGridConfig] = useState<GridConfig>(generateGridConfig(getTargetWordArray()));
  const [correctGrid, setCorrectGrid] = useState<{ x: number; y: number; letter: string; wordIndex?: number }[]>(
    getCorrectLetterGrid()
  );

  const [tileStatuses, setTileStatuses] = useState<TileStatus[]>(
    props.initialConfig?.tileStatuses ??
      getCorrectLetterGrid().map((position) => {
        return { x: position.x, y: position.y, status: "not set" };
      })
  );
  const [currentWords, setCurrentWords] = useState<string[]>(
    props.initialConfig?.currentWords ?? Array.from({ length: props.numWords }).map((x) => "")
  );
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(props.initialConfig?.currentWordIndex ?? 0);

  // Save gameplay progress
  React.useEffect(() => {
    props.onSave?.(
      gridConfig.words.map((x) => x.word),
      inProgress,
      tileStatuses,
      currentWords,
      currentWordIndex,
      remainingGridGuesses,
      remainingWordGuesses
    );
  }, [
    gridConfig,
    inProgress,
    tileStatuses,
    currentWords,
    currentWordIndex,
    remainingGridGuesses,
    remainingWordGuesses,
  ]);

  // Words and their hints
  const wordHints = getWordHints();

  function getTargetWordArray(): string[] {
    let targetWordArray: string[] = [];

    switch (props.wordArrayConfig.type) {
      case "category": {
        targetWordArray = categoryMappings
          // Combine all categories (just the words)
          .flatMap((categoryMappings) => categoryMappings.array.map((mapping) => mapping.word))
          // Return words between minimum and maximum length
          .filter((word) => word.length >= props.minWordLength && word.length <= props.maxWordLength);

        break;
      }

      case "length": {
        // Combine all length word arrays between minimum and maximum length
        targetWordArray = wordLengthMappingsTargets
          .filter((mapping) => mapping.value >= props.minWordLength && mapping.value <= props.maxWordLength)
          .flatMap((lengthMappings) => lengthMappings.array);

        break;
      }

      case "custom": {
        // Use the custom array provided
        targetWordArray = props.wordArrayConfig.array;

        break;
      }
    }

    // Any word with spaces, return true
    if (targetWordArray.filter((word) => word.indexOf(" ") >= 0).length > 0) {
      // Adds space to keyboard
      setAllowSpaces(true);
    }

    return targetWordArray;
  }

  function getWordHints() {
    if (props.wordArrayConfig.type !== "category") {
      return;
    }

    if (!props.displayHints) {
      return;
    }

    const wordHints = categoryMappings
      // Combine all categories
      .flatMap((categoryMappings) => categoryMappings.array)
      // Return words between minimum and maximum length
      .filter(({ word }) => word.length >= props.minWordLength && word.length <= props.maxWordLength);

    return wordHints;
  }

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
    console.log(
      `%cIndex:%c ${currentWordIndex}\n%cWord:%c ${gridConfig.words[currentWordIndex].word}`,
      "font-weight: bold",
      "font-weight: normal",
      "font-weight: bold",
      "font-weight: normal"
    );
  }, [currentWordIndex]);

  // Check if the grid has been completed each time the tileStatuses are updated
  React.useEffect(() => {
    if (!inProgress) {
      return;
    }

    const gridCompleted = tileStatuses.every((tile) => {
      if (tile.status === "correct") {
        return true;
      }
    });

    if (gridCompleted) {
      setInProgress(false);
    }
  }, [tileStatuses]);

  /**
   * Generates the crossword grid from the target word array.
   * If `useExact` is set true on the "custom" type, the exact target word array, without shuffling or slicing will be used.
   * @param targetWordArray Target word array.
   * @returns Generated grid config.
   */
  function generateGridConfig(targetWordArray: string[]): GridConfig {
    let targetWordArraySliced = shuffleArray(targetWordArray).slice(0, props.numWords);
    let result: CrosswordGenerationResult | null = null;

    if (props.wordArrayConfig.type === "custom" && props.wordArrayConfig.useExact) {
      result = crossWordGenerator(targetWordArray);

      if (!result) {
        throw new Error("The specified targetWordArray could not generate a crossword");
      }
    } else if (props.fitRestriction !== undefined) {
      // Crossword fit
      // Height and width can't exceed this value (to begin with)
      const DEFAULT_MAX_GRID_DIMENSION = props.maxWordLength + props.fitRestriction;

      // Start with DEFAULT_MAX_GRID_DIMENSION and slowly increment until a result is found
      for (
        let maxGridDimension = DEFAULT_MAX_GRID_DIMENSION;
        maxGridDimension < DEFAULT_MAX_GRID_DIMENSION + 10;
        maxGridDimension++
      ) {
        // Determine the maximum number of times to find the a result with current maxGridDimension
        const MAX_ATTEMPTS_BEFORE_TRYING_LOWER_NUM = 15;

        // For this number of max attempts
        for (let attemptNo = 1; attemptNo <= MAX_ATTEMPTS_BEFORE_TRYING_LOWER_NUM; attemptNo++) {
          // Try generate a crossword result
          result = crossWordGenerator(targetWordArraySliced);

          // Found an ideal result
          if (result && result.width <= maxGridDimension && result.height <= maxGridDimension) {
            break;
          }

          // Try another random slice of the array
          targetWordArraySliced = shuffleArray(targetWordArray).slice(0, props.numWords);
        }

        // Break out of outer loop too
        if (result && result.width <= maxGridDimension && result.height <= maxGridDimension) {
          break;
        }
      }
    } else {
      do {
        result = crossWordGenerator(targetWordArraySliced);

        if (!result) {
          targetWordArraySliced = shuffleArray(targetWordArray).slice(0, props.numWords);
        }
      } while (!result);
    }

    if (!result) {
      throw new Error("No crossword");
    }

    const words = result!.positionObjArr.map((position) => ({
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

  function checkInput(wordsToCheck: "current" | "all") {
    if (!inProgress) {
      return;
    }

    if (wordsToCheck === "current" && props.numWordGuesses) {
      // Still a 'Check current word' guess left
      if (remainingWordGuesses! >= 1) {
        setRemainingWordGuesses(remainingWordGuesses! - 1);
        // Check current word
        checkTileStatuses(currentWords, wordsToCheck);
      }

      // Used last current word guess and also no grid guesses left
      if (remainingWordGuesses! <= 1 && remainingGridGuesses <= 0) {
        setInProgress(false);
      }
    } else if (wordsToCheck === "all") {
      // Still a 'Check Crossword' guess left
      if (remainingGridGuesses! >= 1) {
        setRemainingGridGuesses(remainingGridGuesses! - 1);
        // Check entire crossword
        checkTileStatuses(currentWords, wordsToCheck);
      }

      // Word guesses were not enabled or were but just used last one
      const noWordGuessesLeft = !props.numWordGuesses || (props.numWordGuesses && remainingWordGuesses! <= 1);

      // Used last grid guess and also no word guesses left
      if (remainingGridGuesses <= 1 && noWordGuessesLeft) {
        setInProgress(false);
      }
    }
  }

  function checkTileStatuses(currentWords: string[], wordsToCheck: "current" | "all") {
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

      // Don't check any other words
      if (wordsToCheck === "current") {
        break;
      }
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

  function onEnter() {
    checkInput("current");
  }

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
            <div
              key={x}
              className="letter-tile-wrapper"
              data-is-focussed={matchingGridEntry?.wordIndex === currentWordIndex}
            >
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

  function displayOutcome(): React.ReactNode {
    // Game still in progress, don't display anything
    if (inProgress) {
      return;
    }

    // Is the grid completed (all correct words entered?)
    const gridCompleted = tileStatuses.every((tile) => {
      if (tile.status === "correct") {
        return true;
      }
    });

    return (
      <>
        <MessageNotification type={gridCompleted ? "success" : "error"}>
          <strong>{gridCompleted ? "Correct!" : "Incorrect"}</strong>
          {!gridCompleted && (
            <>
            <br></br>
              <>The correct answers were:</>
              <br></br>
              <>{gridConfig.words.map((x) => x.word).join(", ")}</>
            </>
          )}
        </MessageNotification>

        <br></br>

        <Button mode="accept" settings={props.settings} onClick={() => ResetGame()}>
          Restart
        </Button>
      </>
    );
  }

  function ResetGame() {
    const gridCompleted = tileStatuses.every((tile) => {
      if (tile.status === "correct") {
        return true;
      }
    });

    // TODO: Scoring method instead of 10 value
    props.onComplete?.(gridCompleted, currentWords.join(""), gridConfig.words.map((x) => x.word).join(""), 10);
    setInProgress(true);
    setCurrentWordIndex(0);
    setRemainingWordGuesses(props.numWordGuesses ? props.numWordGuesses : undefined);
    setRemainingGridGuesses(props.numGridGuesses);
    setTileStatuses(
      getCorrectLetterGrid().map((position) => {
        return { x: position.x, y: position.y, status: "not set" };
      })
    );
    setCurrentWords(Array.from({ length: props.numWords }).map((x) => ""));
    setGridConfig(generateGridConfig(getTargetWordArray()));
    setCorrectGrid(getCorrectLetterGrid());
  }

  const hint = wordHints?.find((x) => x.word === gridConfig.words[currentWordIndex].word)?.hint;

  return (
    <div
      className="App wordle_interlinked"
      style={{ backgroundImage: props.theme && `url(${props.theme.backgroundImageSrc})` }}
    >
      {!inProgress && <div className="outcome">{displayOutcome()}</div>}
      {Boolean(inProgress && props.provideWords) && (
        <div className="provided_words">{gridConfig.words.map((wordInfo) => wordInfo.word).join(",")}</div>
      )}
      {inProgress && (
        <MessageNotification type="default">
          Grid guesses left: <strong>{remainingGridGuesses}</strong>
          {Boolean(props.numWordGuesses) && (
            <>
              <br />
              Current word guesses left: <strong>{remainingWordGuesses}</strong>
            </>
          )}
        </MessageNotification>
      )}
      {Boolean(inProgress && props.displayHints && hint) && (
        <MessageNotification type="info">
          <strong>Hint:</strong> {hint}
        </MessageNotification>
      )}
      <div className="word_grid">{populateGrid()}</div>
      {Boolean(inProgress && props.numWordGuesses) && (
        <Button
          mode="accept"
          disabled={remainingWordGuesses! <= 0}
          settings={props.settings}
          onClick={() => checkInput("current")}
        >
          Check current word
        </Button>
      )}
      {inProgress && (
        <Button
          mode="accept"
          disabled={remainingGridGuesses! <= 0}
          settings={props.settings}
          onClick={() => checkInput("all")}
        >
          Check crossword
        </Button>
      )}
      <div className="keyboard">
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
          allowSpaces={allowSpaces}
        />
      </div>
    </div>
  );
};
