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
import GamemodeSettingsMenu from "./GamemodeSettingsMenu";
import { DEFAULT_WORD_LENGTH, MAX_TARGET_WORD_LENGTH, MIN_TARGET_WORD_LENGTH } from "./App";
import ProgressBar, { GreenToRedColorTransition } from "./ProgressBar";

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
  isCampaignLevel: boolean;
  // TODO: Add as a gamemode setting?
  wordArrayConfig:
    | { type: "custom"; array: string[]; useExact: boolean; canRestart: boolean }
    | { type: "category" }
    | { type: "length" };
  // The words of the crossword are given to the player (for crossword fit mode)
  provideWords: boolean;

  gamemodeSettings?: {
    numWords?: number;
    minWordLength?: number;
    maxWordLength?: number;
    numWordGuesses?: number;
    numGridGuesses?: number;
    isFirstLetterProvided?: boolean;
    showHint?: boolean;
    timerConfig?: { isTimed: true; seconds: number } | { isTimed: false };
  };

  /*
  When not specified, the crossword's height and width is not restricted
  When is specified, the value is the additional units allowed in grid height or width (in addition to maxWordLength)
  */
  // TODO: Add as gamemode setting?
  fitRestriction?: number;

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

  const DEFAULT_NUM_WORDS = 2;
  const STARTING_NUM_WORDS = props.gamemodeSettings?.numWords ?? DEFAULT_NUM_WORDS;

  const IS_CROSSWORD = STARTING_NUM_WORDS > 2;

  const STARTING_NUM_GRID_GUESSES =
    props.initialConfig?.remainingGridGuesses ?? props.gamemodeSettings?.numGridGuesses ?? 0;

  // TODO: Balancing
  const DEFAULT_NUM_WORD_GUESSES = STARTING_NUM_WORDS * 3;
  // Specified amount of word guesses (either from initial config or gamemode settings)?
  const specifiedValue =
    props.initialConfig?.remainingWordGuesses ?? props.gamemodeSettings?.numWordGuesses ?? undefined;
  // In case of no specified value, if also no grid guesses, use default value, otherwise zero
  const fallbackValue = STARTING_NUM_GRID_GUESSES === 0 ? DEFAULT_NUM_WORD_GUESSES : 0;
  const STARTING_NUM_WORD_GUESSES = specifiedValue ?? fallbackValue;

  const defaultGamemodeSettings = {
    numWords: STARTING_NUM_WORDS,
    minWordLength: props.gamemodeSettings?.minWordLength ?? DEFAULT_WORD_LENGTH,
    maxWordLength: props.gamemodeSettings?.maxWordLength ?? DEFAULT_WORD_LENGTH,

    // Specified amount of grid guesses (either from initial config or gamemode settings), otherwise zero
    numGridGuesses: STARTING_NUM_GRID_GUESSES,
    numWordGuesses: STARTING_NUM_WORD_GUESSES,

    isFirstLetterProvided: props.gamemodeSettings?.isFirstLetterProvided ?? false,
    // Use gamemode setting value if specified, otherwise default to true for large crosswords (more than 2 words)
    isHintShown: props.gamemodeSettings?.showHint ?? STARTING_NUM_WORDS > 2 ? true : false,

    timerConfig: props.gamemodeSettings?.timerConfig ?? { isTimed: false },
  };

  const [gamemodeSettings, setGamemodeSettings] = useState<{
    numWords: number;
    minWordLength: number;
    maxWordLength: number;
    numGridGuesses: number;
    numWordGuesses: number;
    isFirstLetterProvided: boolean;
    isHintShown: boolean;
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  }>(defaultGamemodeSettings);

  const DEFAULT_TIMER_VALUE = 30;
  const [remainingSeconds, setRemainingSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true ? props.gamemodeSettings?.timerConfig.seconds : DEFAULT_TIMER_VALUE
  );

  /*
  Keep track of the most recent value for the timer
  So that the value can be used as the default value for the total seconds input element
  (even after the timer is enabled/disabled)
  */
  const [mostRecentTotalSeconds, setMostRecentTotalSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true ? props.gamemodeSettings?.timerConfig.seconds : DEFAULT_TIMER_VALUE
  );

  const [remainingGridGuesses, setRemainingGridGuesses] = useState(STARTING_NUM_GRID_GUESSES);
  const [remainingWordGuesses, setRemainingWordGuesses] = useState(STARTING_NUM_WORD_GUESSES);

  // The entered words of the crossword
  const [currentWords, setCurrentWords] = useState<string[]>(
    props.initialConfig?.currentWords ?? Array.from({ length: gamemodeSettings.numWords }).map((x) => "")
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
          .filter(
            (word) => word.length >= gamemodeSettings.minWordLength && word.length <= gamemodeSettings.maxWordLength
          );

        break;
      }

      case "length": {
        // Combine all length word arrays between minimum and maximum length
        targetWordArray = wordLengthMappingsTargets
          .filter(
            (mapping) =>
              mapping.value >= gamemodeSettings.minWordLength && mapping.value <= gamemodeSettings.maxWordLength
          )
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
    if (!gamemodeSettings.isHintShown) {
      return;
    }

    // Don't show hints when words aren't from a category
    if (props.wordArrayConfig.type !== "category") {
      return;
    }

    const wordHints = categoryMappings
      // Combine all categories
      .flatMap((categoryMappings) => categoryMappings.array)
      // Return words between minimum and maximum length
      .filter(
        ({ word }) => word.length >= gamemodeSettings.minWordLength && word.length <= gamemodeSettings.maxWordLength
      );

    return wordHints;
  }

  // TODO: Handling mid-game changes - apply this to other modes
  // TODO: Seems to be using previous values, e.g increase numWords to 7 but creates only 6 words

  // Update gamemode with new gamemode settings
  React.useEffect(() => {
    // TODO: Move most of this logic to ResetGame()
    if (gamemodeSettings.timerConfig.isTimed) {
      // Reset time left
      setRemainingSeconds(gamemodeSettings.timerConfig.seconds);
    }

    // All words are the first letter of their respective correct word
    const firstLetterWords = Array.from({ length: gamemodeSettings.numWords }).map((value, index) => gridConfig.words[index].word.charAt(0));
    // All words are empty
    const emptyWords = Array.from({ length: gamemodeSettings.numWords }).map((x) => "");
    const newCurrentWords = gamemodeSettings.isFirstLetterProvided ? firstLetterWords : emptyWords;

    // Reset game after change of settings (stops cheating by changing settings partway through a game)
    if (inProgress) {
      ResetGame();
    }
  }, [gamemodeSettings]);

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

  // Timer Setup
  React.useEffect(() => {
    if (!gamemodeSettings.timerConfig.isTimed) {
      return;
    }

    const timer = setInterval(() => {
      if (remainingSeconds > 0) {
        setRemainingSeconds(remainingSeconds - 1);
      } else {
        setInProgress(false);
      }
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [setRemainingSeconds, remainingSeconds, gamemodeSettings.timerConfig.isTimed]);

  /**
   * Generates the crossword grid from the target word array.
   * If `useExact` is set true on the "custom" type, the exact target word array, without shuffling or slicing will be used.
   * @param targetWordArray Target word array.
   * @returns Generated grid config.
   */
  function generateGridConfig(targetWordArray: string[]): GridConfig {
    let targetWordArraySliced = shuffleArray(targetWordArray).slice(0, gamemodeSettings.numWords);
    let result: CrosswordGenerationResult | null = null;

    if (props.wordArrayConfig.type === "custom" && props.wordArrayConfig.useExact) {
      result = crossWordGenerator(targetWordArray);

      if (!result) {
        throw new Error("The specified targetWordArray could not generate a crossword");
      }
    } else if (props.fitRestriction !== undefined) {
      // Crossword fit
      // Height and width can't exceed this value (to begin with)
      const DEFAULT_MAX_GRID_DIMENSION = gamemodeSettings.maxWordLength + props.fitRestriction;

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
          targetWordArraySliced = shuffleArray(targetWordArray).slice(0, gamemodeSettings.numWords);
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
          targetWordArraySliced = shuffleArray(targetWordArray).slice(0, gamemodeSettings.numWords);
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

    // Still a 'Check current word' guess left
    if (wordsToCheck === "current" && remainingWordGuesses >= 1) {
      setRemainingWordGuesses(remainingWordGuesses - 1);
      // Check current word
      checkTileStatuses(currentWords, wordsToCheck);

      // Used last current word guess and also no grid guesses left
      if (remainingWordGuesses <= 1 && remainingGridGuesses <= 0) {
        setInProgress(false);
      }
    } else if (wordsToCheck === "all" && remainingGridGuesses >= 1) {
      // Still a 'Check Crossword' guess left
      setRemainingGridGuesses(remainingGridGuesses - 1);
      // Check entire crossword
      checkTileStatuses(currentWords, wordsToCheck);

      // Used last grid guess and also no word guesses left
      if (remainingGridGuesses <= 1 && remainingWordGuesses === 0) {
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
      const wordSummary = getWordSummary("wingo/interlinked", wordGuessed, targetWordInfo.word, true);

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

      const correctWordInfo = gridConfig.words[currentWordIndex];

      // If the entered word is already of full length
      if (word.length >= correctWordInfo.word.length) {
        const startingTileStatus = tileStatuses.find(
          (tileStatus) => tileStatus.x === correctWordInfo.startingXPos && tileStatus.y === correctWordInfo.startingYPos
        )?.status;

        console.log(startingTileStatus);

        if (startingTileStatus !== "not set") {
          // Word has been checked, Overwrite (clear word and add letter)
          return letter;
        } else {
          // Don't accept any more characters
          return word;
        }
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

  function generateSettingsOptions(): React.ReactNode {
    let settings;

    settings = (
      <>
        {IS_CROSSWORD && (
          <label>
            <input
              type="number"
              value={gamemodeSettings.numWords}
              min={2}
              max={10}
              onChange={(e) => {
                const newGamemodeSettings = { ...gamemodeSettings, numWords: e.target.valueAsNumber };
                setGamemodeSettings(newGamemodeSettings);
              }}
            ></input>
            Number of words
          </label>
        )}
        <label>
          <input
            type="number"
            value={gamemodeSettings.minWordLength}
            min={MIN_TARGET_WORD_LENGTH}
            // Can't go above maximum word length
            max={Math.min(gamemodeSettings.maxWordLength, MAX_TARGET_WORD_LENGTH)}
            onChange={(e) => {
              const newGamemodeSettings = { ...gamemodeSettings, minWordLength: e.target.valueAsNumber };
              setGamemodeSettings(newGamemodeSettings);
            }}
          ></input>
          Minimum Word Length
        </label>
        <label>
          <input
            type="number"
            value={gamemodeSettings.maxWordLength}
            // Can't go below the minimum word length
            min={Math.max(gamemodeSettings.minWordLength, MIN_TARGET_WORD_LENGTH)}
            max={MAX_TARGET_WORD_LENGTH}
            onChange={(e) => {
              const newGamemodeSettings = { ...gamemodeSettings, maxWordLength: e.target.valueAsNumber };
              setGamemodeSettings(newGamemodeSettings);
            }}
          ></input>
          Maximum Word Length
        </label>

        <label>
          <input
            checked={gamemodeSettings.isFirstLetterProvided}
            type="checkbox"
            onChange={() => {
              const newGamemodeSettings = {
                ...gamemodeSettings,
                isFirstLetterProvided: !gamemodeSettings.isFirstLetterProvided,
              };
              setGamemodeSettings(newGamemodeSettings);
            }}
          ></input>
          First Letter Provided
        </label>
        <label>
          <input
            checked={gamemodeSettings.isHintShown}
            type="checkbox"
            onChange={() => {
              const newGamemodeSettings = { ...gamemodeSettings, isHintShown: !gamemodeSettings.isHintShown };
              setGamemodeSettings(newGamemodeSettings);
            }}
          ></input>
          Hints
        </label>
        <label>
          <input
            type="number"
            value={gamemodeSettings.numWordGuesses}
            min={0}
            max={100}
            onChange={(e) => {
              const newGamemodeSettings = { ...gamemodeSettings, numWordGuesses: e.target.valueAsNumber };
              setGamemodeSettings(newGamemodeSettings);
            }}
          ></input>
          Number of word guesses
        </label>
        <label>
          <input
            type="number"
            value={gamemodeSettings.numGridGuesses}
            min={0}
            max={20}
            onChange={(e) => {
              const newGamemodeSettings = { ...gamemodeSettings, numGridGuesses: e.target.valueAsNumber };
              setGamemodeSettings(newGamemodeSettings);
            }}
          ></input>
          Number of grid guesses
        </label>
        <>
          <label>
            <input
              checked={gamemodeSettings.timerConfig.isTimed}
              type="checkbox"
              onChange={() => {
                // If currently timed, on change, make the game not timed and vice versa
                const newTimer = gamemodeSettings.timerConfig.isTimed
                  ? { isTimed: false }
                  : { isTimed: true, seconds: mostRecentTotalSeconds };
                const newGamemodeSettings = { ...gamemodeSettings, timer: newTimer };
                setGamemodeSettings(newGamemodeSettings);
              }}
            ></input>
            Timer
          </label>
          {gamemodeSettings.timerConfig.isTimed && (
            <label>
              <input
                type="number"
                value={gamemodeSettings.timerConfig.seconds}
                min={10}
                max={120}
                step={5}
                onChange={(e) => {
                  setRemainingSeconds(e.target.valueAsNumber);
                  setMostRecentTotalSeconds(e.target.valueAsNumber);
                  const newGamemodeSettings = {
                    ...gamemodeSettings,
                    timer: { isTimed: true, seconds: e.target.valueAsNumber },
                  };
                  setGamemodeSettings(newGamemodeSettings);
                }}
              ></input>
              Seconds
            </label>
          )}
        </>
      </>
    );

    return settings;
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
              <>{gridConfig.words.map((x) => x.word.toUpperCase()).join(", ")}</>
            </>
          )}
        </MessageNotification>

        {(props.wordArrayConfig.type !== "custom" || props.wordArrayConfig.canRestart) && (
          <>
            <br />
            <Button mode="accept" settings={props.settings} onClick={() => ResetGame()}>
              Restart
            </Button>
          </>
        )}
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
    
    setCurrentWords(Array.from({ length: gamemodeSettings.numWords }).map((x) => ""));
    setTileStatuses(
      getCorrectLetterGrid().map((position) => {
        return { x: position.x, y: position.y, status: "not set" };
      })
    );
    setGridConfig(generateGridConfig(getTargetWordArray()));
    setCorrectGrid(getCorrectLetterGrid());
    
    setRemainingWordGuesses(gamemodeSettings.numWordGuesses);
    setRemainingGridGuesses(gamemodeSettings.numGridGuesses);
    setCurrentWordIndex(0);

    setRemainingSeconds(gamemodeSettings.timerConfig.isTimed ? gamemodeSettings.timerConfig.seconds : DEFAULT_TIMER_VALUE);

    setInProgress(true);
  }

  const hint = wordHints?.find((x) => x.word === gridConfig.words[currentWordIndex].word)?.hint;

  return (
    <div
      className="App wordle_interlinked"
      style={{ backgroundImage: props.theme && `url(${props.theme.backgroundImageSrc})` }}
    >
      {!props.isCampaignLevel && (
        <div className="gamemodeSettings">
          <GamemodeSettingsMenu>{generateSettingsOptions()}</GamemodeSettingsMenu>
        </div>
      )}

      {!inProgress && <div className="outcome">{displayOutcome()}</div>}
      {Boolean(inProgress && props.provideWords) && (
        <MessageNotification type="info">
          <strong>Provided words:</strong>
          <br />
          {gridConfig.words.map((wordInfo) => wordInfo.word.toUpperCase()).join(", ")}
        </MessageNotification>
      )}
      {inProgress && (
        <MessageNotification type="default">
          Grid guesses left: <strong>{remainingGridGuesses}</strong>
          {STARTING_NUM_GRID_GUESSES > 0 && (
            <>
              <br />
              Current word guesses left: <strong>{remainingWordGuesses}</strong>
            </>
          )}
        </MessageNotification>
      )}
      {Boolean(inProgress && gamemodeSettings.isHintShown && hint) && (
        <MessageNotification type="info">
          <strong>Hint:</strong> {hint}
        </MessageNotification>
      )}
      <div className="word_grid">{populateGrid()}</div>
      {Boolean(inProgress && STARTING_NUM_WORD_GUESSES > 0) && (
        <Button
          mode="accept"
          disabled={remainingWordGuesses <= 0}
          settings={props.settings}
          onClick={() => checkInput("current")}
        >
          Check current word
        </Button>
      )}
      {inProgress && (
        <Button
          mode="accept"
          disabled={remainingGridGuesses <= 0}
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
          showKeyboard={props.settings.gameplay.keyboard}
          allowSpaces={allowSpaces}
        />
      </div>
      <div>
        {gamemodeSettings.timerConfig.isTimed && (
          <ProgressBar
            progress={remainingSeconds}
            total={gamemodeSettings.timerConfig.seconds}
            display={{ type: "transition", colorTransition: GreenToRedColorTransition }}
          ></ProgressBar>
        )}
      </div>
    </div>
  );
};
