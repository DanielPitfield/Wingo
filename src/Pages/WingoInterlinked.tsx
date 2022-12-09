import LetterTile, { TileStatus } from "../Components/LetterTile";

import { useState } from "react";
import { Theme } from "../Data/Themes";
import { Keyboard } from "../Components/Keyboard";
import { Button } from "../Components/Button";
import React from "react";
import { MessageNotification } from "../Components/MessageNotification";
import { CrosswordGenerationResult, crosswordGenerator } from "../Helpers/CrossWordGenerator";
import ProgressBar, { GreenToRedColorTransition } from "../Components/ProgressBar";
import { LEVEL_FINISHING_TEXT } from "../Components/Level";
import { categoryMappings, targetWordLengthMappings } from "../Data/WordArrayMappings";
import { DEFAULT_FIT_RESTRICTION } from "../Data/DefaultGamemodeSettings";
import { getWordRowStatusSummary, WordRowStatusChecks } from "../Helpers/getWordRowStatusSummary";
import { shuffleArray } from "../Helpers/shuffleArray";
import { getGamemodeDefaultTimerValue } from "../Helpers/getGamemodeDefaultTimerValue";
import { getNewGamemodeSettingValue } from "../Helpers/getGamemodeSettingsNewValue";
import WingoInterlinkedGamemodeSettings from "../Components/GamemodeSettingsOptions/WingoInterlinkedGamemodeSettings";
import { useLocation } from "react-router-dom";
import { PagePath } from "../Data/PageNames";
import { SettingsData } from "../Data/SaveData/Settings";
import { setMostRecentWingoInterlinkedGamemodeSettings } from "../Data/SaveData/MostRecentGamemodeSettings";
import { useCountdown } from "usehooks-ts";
import { useCorrectChime, useFailureChime, useLightPingChime, useClickChime } from "../Data/Sounds";

type Orientation = "vertical" | "horizontal";

type GridConfig = {
  width: number;
  height: number;
  words: { word: string; orientation: Orientation; startingXPos: number; startingYPos: number }[];
};

export type CrosswordTileStatus = {
  x: number;
  y: number;
  status: TileStatus;
};

export interface WingoInterlinkedProps {
  wordArrayConfig:
    | { type: "custom"; array: string[]; useExact: boolean; canRestart: boolean }
    | { type: "category" }
    | { type: "length" };

  // Are the words of the crossword given to the player (in other words, is this crossword fit mode?)
  provideWords: boolean;

  gamemodeSettings: {
    numWords: number;
    minWordLength: number;
    maxWordLength: number;

    /*
    Fit Restriction
    Not specified - the crossword's height and width is not restricted
    Value specified - the value is the additional units allowed in grid height or width (in addition to maxWordLength)
    */
    fitRestrictionConfig: { isRestricted: true; fitRestriction: number } | { isRestricted: false };

    startingNumWordGuesses: number;
    startingNumGridGuesses: number;
    isFirstLetterProvided: boolean;
    isHintShown: boolean;
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  };

  initialConfig?: {
    words: string[];
    inProgress: boolean;
    tileStatuses: CrosswordTileStatus[];
    currentWords: string[];
    currentWordIndex: number;
    remainingGridGuesses: number;
    remainingWordGuesses?: number;
  };
}

interface Props extends WingoInterlinkedProps {
  isCampaignLevel: boolean;
  theme?: Theme;
  settings: SettingsData;
  addGold: (gold: number) => void;
  setTheme: (theme: Theme) => void;
  onSave?: (
    words: string[],
    inProgress: boolean,
    tileStatuses: CrosswordTileStatus[],
    currentWords: string[],
    currentWordIndex: number,
    remainingGridGuesses: number,
    remainingWordGuesses?: number
  ) => void;
  onComplete: (wasCorrect: boolean) => void;
}

export const WingoInterlinked = (props: Props) => {
  const location = useLocation().pathname as PagePath;

  const [keyboardDisabled, setKeyboardDisabled] = useState(false);

  const [inProgress, setInProgress] = useState(props.initialConfig?.inProgress ?? true);
  const [allowSpaces, setAllowSpaces] = useState(false);

  const [gamemodeSettings, setGamemodeSettings] = useState<WingoInterlinkedProps["gamemodeSettings"]>(
    props.gamemodeSettings
  );

  // Crossword configuration generated when provided with an array of words
  const [categoryName, setCategoryName] = useState("");
  const [gridConfig, setGridConfig] = useState<GridConfig>(generateGridConfig(getTargetWordArray()));
  const [correctGrid, setCorrectGrid] = useState<{ x: number; y: number; letter: string; wordIndex?: number }[]>(
    getCorrectLetterGrid()
  );

  // The entered words of the crossword
  const [currentWords, setCurrentWords] = useState<string[]>(
    props.initialConfig?.currentWords ?? Array.from({ length: gamemodeSettings.numWords }).map((x) => "")
  );

  const [tileStatuses, setTileStatuses] = useState<CrosswordTileStatus[]>(
    props.initialConfig?.tileStatuses ??
      getCorrectLetterGrid().map((position) => {
        return { x: position.x, y: position.y, status: "not set" };
      })
  );

  const [currentWordIndex, setCurrentWordIndex] = useState<number>(props.initialConfig?.currentWordIndex ?? 0);

  const [mostRecentFitRestriction, setMostRecentFitRestriction] = useState(
    props.gamemodeSettings?.fitRestrictionConfig?.isRestricted === true
      ? props.gamemodeSettings?.fitRestrictionConfig?.fitRestriction
      : DEFAULT_FIT_RESTRICTION
  );

  const [remainingWordGuesses, setRemainingWordGuesses] = useState(
    props.initialConfig?.remainingWordGuesses ?? props.gamemodeSettings.startingNumWordGuesses
  );
  const [remainingGridGuesses, setRemainingGridGuesses] = useState(
    props.initialConfig?.remainingGridGuesses ?? props.gamemodeSettings.startingNumGridGuesses
  );

  // The starting/total time of the timer
  const [totalSeconds, setTotalSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig?.seconds
      : getGamemodeDefaultTimerValue(location)
  );

  // How many seconds left on the timer?
  const [remainingSeconds, { startCountdown, stopCountdown, resetCountdown }] = useCountdown({
    countStart: totalSeconds,
    intervalMs: 1000,
  });

  // Sounds
  const [playCorrectChimeSoundEffect] = useCorrectChime(props.settings);
  const [playFailureChimeSoundEffect] = useFailureChime(props.settings);
  const [playLightPingSoundEffect] = useLightPingChime(props.settings);
  const [playClickSoundEffect] = useClickChime(props.settings);

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
    switch (props.wordArrayConfig.type) {
      case "custom": {
        // Use the custom array provided
        return props.wordArrayConfig.array;
      }

      case "category": {
        const availableCategories =
          categoryMappings.filter((mapping) => mapping.array.length >= gamemodeSettings.numWords) ?? categoryMappings;

        const chosenCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];

        //setCategoryName(chosenCategory.name)

        return (
          chosenCategory.array
            .map((mapping) => mapping.word)
            // Return words between minimum and maximum length
            .filter(
              (word) => word.length >= gamemodeSettings.minWordLength && word.length <= gamemodeSettings.maxWordLength
            )
        );
      }

      default:
        // Combine all length word arrays between minimum and maximum length
        return targetWordLengthMappings
          .filter(
            (mapping) =>
              mapping.value >= gamemodeSettings.minWordLength && mapping.value <= gamemodeSettings.maxWordLength
          )
          .flatMap((lengthMappings) => lengthMappings.array);
    }
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

  // Reset game after change of settings (stops cheating by changing settings partway through a game)
  React.useEffect(() => {
    if (props.isCampaignLevel) {
      return;
    }

    if (props.initialConfig) {
      // If an initialConfig was specified, do not (re)set the game,
      // instead the words have been loaded from config (#304, #305)
      return;
    }

    ResetGame();

    // Save the latest gamemode settings for this mode
    setMostRecentWingoInterlinkedGamemodeSettings(location, gamemodeSettings);
  }, [gamemodeSettings]);

  // Validate the value of props.gamemodeSettings.startingNumGridGuesses
  React.useEffect(() => {
    // The game has been loaded using an initialConfig, don't change any settings
    if (props.initialConfig?.remainingGridGuesses !== undefined) {
      return;
    }

    const newGamemodeSettings = {
      ...gamemodeSettings,
      startingNumGridGuesses: props.gamemodeSettings.startingNumGridGuesses,
    };

    setGamemodeSettings(newGamemodeSettings);
  }, [props.gamemodeSettings.startingNumGridGuesses]);

  // Validate the value of props.gamemodeSettings.startingNumWordGuesses
  React.useEffect(() => {
    // The game has been loaded using an initialConfig, don't change any settings
    if (props.initialConfig?.remainingWordGuesses !== undefined) {
      return;
    }

    const newGamemodeSettings = {
      ...gamemodeSettings,
      startingNumWordGuesses: props.gamemodeSettings.startingNumWordGuesses,
    };

    setGamemodeSettings(newGamemodeSettings);
  }, [props.gamemodeSettings.startingNumWordGuesses]);

  React.useEffect(() => {
    // Update information about which letters should be at which grid positions
    const correctLetterGrid = getCorrectLetterGrid();
    setCorrectGrid(correctLetterGrid);

    if (props.initialConfig?.tileStatuses.length || props.initialConfig?.currentWords.length) {
      // If an initialConfig.tileStatuses or initialConfig.currentWords were specified, do not
      // (re)set the words, instead the words have been loaded from config (#304, #305)
      return;
    }

    // Reset all tile statuses to not set
    setTileStatuses(
      correctLetterGrid.map((position) => {
        return { x: position.x, y: position.y, status: "not set" };
      })
    );

    if (gamemodeSettings.isFirstLetterProvided) {
      // All words become the first letter of their respective correct word
      const firstLetterOfWords = gridConfig.words.map((wordInfo) => wordInfo.word.charAt(0));
      setCurrentWords(firstLetterOfWords);
    } else {
      // Nothing is provided (all words start empty)
      const emptyWords = gridConfig.words.map((wordInfo) => "");
      setCurrentWords(emptyWords);
    }
  }, [gridConfig]);

  // Each time a word is highlighted/picked
  React.useEffect(() => {
    if (!inProgress) {
      return;
    }

    if (props.initialConfig?.tileStatuses.length) {
      // If an initialConfig.tileStatuses was specified, do not (re)set the words,
      // instead the words have been loaded from config (#304, #305)
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

    if (props.initialConfig?.inProgress !== undefined) {
      // If an initialConfig.inProgress was specified, do not (re)set the words,
      // instead the words have been loaded from config (#304, #305)
      return;
    }

    const gridCompleted = tileStatuses.every((tile) => tile.status === "correct");

    if (gridCompleted) {
      setInProgress(false);
    }
  }, [tileStatuses]);

  // Start timer (any time the toggle is enabled or the totalSeconds is changed)
  React.useEffect(() => {
    if (!inProgress) {
      return;
    }

    if (!gamemodeSettings.timerConfig.isTimed) {
      return;
    }

    startCountdown();
  }, [inProgress, gamemodeSettings.timerConfig.isTimed, totalSeconds]);

  // Check remaining seconds on timer
  React.useEffect(() => {
    if (!inProgress) {
      return;
    }

    if (!gamemodeSettings.timerConfig.isTimed) {
      return;
    }

    if (remainingSeconds <= 0) {
      stopCountdown();
      playFailureChimeSoundEffect();
      setInProgress(false);
    }
  }, [inProgress, gamemodeSettings.timerConfig.isTimed, remainingSeconds]);

  /**
   * Generates the crossword grid from the target word array.
   * If `useExact` is set true on the "custom" type, the exact target word array, without shuffling or slicing will be used.
   * @param targetWordArray Target word array.
   * @returns Generated grid config.
   */
  function generateGridConfig(targetWordArray: string[]): GridConfig {
    let targetWordArraySliced = shuffleArray(targetWordArray).slice(0, gamemodeSettings.numWords);
    let result: CrosswordGenerationResult | null = null;

    // Any word with spaces, return true
    if (targetWordArraySliced.filter((word) => word.indexOf(" ") >= 0).length > 0) {
      // Adds space to keyboard
      setAllowSpaces(true);
    }

    if (props.wordArrayConfig.type === "custom" && props.wordArrayConfig.useExact) {
      result = crosswordGenerator(targetWordArray);

      if (!result) {
        throw new Error("The specified targetWordArray could not generate a crossword");
      }
    } else if (gamemodeSettings.fitRestrictionConfig?.isRestricted) {
      // Height and width can't exceed this value (to begin with)
      const MAX_GRID_DIMENSION = gamemodeSettings.maxWordLength + gamemodeSettings.fitRestrictionConfig.fitRestriction;
      // Try to find smallest fit restriction possible but allow additional leeway up to this amount
      const MAX_LEEWAY_INCREMENT = 10;

      // Start with DEFAULT_MAX_GRID_DIMENSION and slowly increment until a result is found
      for (
        let maxGridDimension = MAX_GRID_DIMENSION;
        maxGridDimension < MAX_GRID_DIMENSION + MAX_LEEWAY_INCREMENT;
        maxGridDimension++
      ) {
        // Define the maximum number of times to find a gridConfig result with the current maxGridDimension
        const MAX_ATTEMPTS_BEFORE_TRYING_LOWER_NUM = 15;

        // For this number of max attempts
        for (let attemptNo = 1; attemptNo <= MAX_ATTEMPTS_BEFORE_TRYING_LOWER_NUM; attemptNo++) {
          // Try generate a crossword result
          result = crosswordGenerator(targetWordArraySliced);

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
        result = crosswordGenerator(targetWordArraySliced);

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

    return horizontalCondition || verticalCondition;
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
      const guess = currentWordsOrdered[i];
      const targetWordInfo = gridWordsOrdered[i];

      const statusChecks: WordRowStatusChecks = {
        isReadOnly: false,
        page: location,
        word: guess,
        targetWord: targetWordInfo.word,
        inDictionary: true,
        wordArray: [],
      };

      // Returns summary of each letter's status in the guess
      const guessSummary = getWordRowStatusSummary(statusChecks);

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
        else if (guess === "") {
          return position;
        } else if (targetWordInfo.orientation === "horizontal") {
          const xOffset = position.x - targetWordInfo.startingXPos;
          position.status = guessSummary[xOffset]?.status;
        } else if (targetWordInfo.orientation === "vertical") {
          const yOffset = position.y - targetWordInfo.startingYPos;
          position.status = guessSummary[yOffset]?.status;
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

    const correctWordInfo = gridConfig.words[currentWordIndex];

    // Get the current status of the first tile in the 'focussed' word
    const startingTileStatus = tileStatuses.find(
      (tileStatus) => tileStatus.x === correctWordInfo.startingXPos && tileStatus.y === correctWordInfo.startingYPos
    )?.status;

    const newCurrentWords = currentWords.map((word, i) => {
      // If this is not the currently 'focussed' word
      if (i !== currentWordIndex) {
        // Leave word unmodified
        return word;
      }

      /*
        The word is to be updated, meaning the current statuses of the tiles are no longer valid (but will still be shown)
        Therefore, update the status of all tiles of the word to "not set"
        The player must use another guess to check the status of the new word
      */
      const newTileStatuses = tileStatuses.map((position) => {
        if (isWordAtPosition(correctWordInfo, position)) {
          position.status = "not set";
        }
        return position;
      });

      setTileStatuses(newTileStatuses);

      // If the 'focussed' word is already of full length (and has been previously checked), overwrite with letter
      if (Boolean(word.length >= correctWordInfo.word.length && startingTileStatus !== "not set")) {
        return letter;
      }

      // Otherwise, add the letter to the word
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

      // If the 'focussed' word is empty
      if (word.length === 0) {
        // Don't remove any more characters
        return word;
      }

      // Information about the correct word (that the removed tile should be one of the letters of)
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

          const displayedLetter = (() => {
            if (inProgress) {
              return letter === "?" ? "" : letter;
            }

            return matchingGridEntry?.letter || "?";
          })();

          return (
            <div
              key={x}
              className="letter-tile-wrapper"
              data-is-focussed={matchingGridEntry?.wordIndex === currentWordIndex}
            >
              <LetterTile
                key={x}
                letter={displayedLetter}
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

  const Grid = () => {
    const Grid = Array.from({ length: gridConfig.height }).map((_, index) => populateRow(index));
    return <div className="word_grid">{Grid}</div>;
  };

  const Outcome = () => {
    if (inProgress) {
      return null;
    }

    // Is the grid completed (all correct words entered?)
    const gridCompleted = tileStatuses.every((tile) => {
      if (tile.status === "correct") {
        return true;
      }
      return false;
    });

    return (
      <>
        <MessageNotification type={gridCompleted ? "success" : "error"}>
          <strong>{gridCompleted ? "Correct!" : "Incorrect"}</strong>
          {!gridCompleted && (
            <>
              <br />
              <>The correct answers were:</>
              <br />
              <>{gridConfig.words.map((x) => x.word.toUpperCase()).join(", ")}</>
            </>
          )}
        </MessageNotification>

        {(props.wordArrayConfig.type !== "custom" || props.wordArrayConfig.canRestart) && (
          <>
            <br />
            <Button mode="accept" settings={props.settings} onClick={() => ResetGame()}>
              {props.isCampaignLevel ? LEVEL_FINISHING_TEXT : "Restart"}
            </Button>
          </>
        )}
      </>
    );
  };

  function ResetGame() {
    if (!inProgress) {
      // Every tile where a letter should be, has the correct status
      const wasCorrect = tileStatuses.every((tile) => tile.status === "correct");
      props.onComplete(wasCorrect);
    }

    setInProgress(true);

    setGridConfig(generateGridConfig(getTargetWordArray()));

    setRemainingWordGuesses(props.initialConfig?.remainingWordGuesses ?? gamemodeSettings.startingNumWordGuesses);
    setRemainingGridGuesses(props.initialConfig?.remainingGridGuesses ?? gamemodeSettings.startingNumGridGuesses);
    setCurrentWordIndex(0);

    if (gamemodeSettings.timerConfig.isTimed) {
      // Reset the timer if it is enabled in the game options
      resetCountdown();
    }
  }

  const hint = wordHints?.find((x) => x.word === gridConfig.words[currentWordIndex].word)?.hint;

  const handleFitRestrictionToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGamemodeSettings: WingoInterlinkedProps["gamemodeSettings"] = {
      ...gamemodeSettings,
      fitRestrictionConfig: e.target.checked
        ? { isRestricted: true, fitRestriction: mostRecentFitRestriction }
        : { isRestricted: false },
    };

    setGamemodeSettings(newGamemodeSettings);
  };

  const handleTimerToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGamemodeSettings: WingoInterlinkedProps["gamemodeSettings"] = {
      ...gamemodeSettings,
      timerConfig: e.target.checked ? { isTimed: true, seconds: totalSeconds } : { isTimed: false },
    };

    setGamemodeSettings(newGamemodeSettings);
  };

  const handleSimpleGamemodeSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGamemodeSettings: WingoInterlinkedProps["gamemodeSettings"] = {
      ...gamemodeSettings,
      [e.target.name]: getNewGamemodeSettingValue(e),
    };

    setGamemodeSettings(newGamemodeSettings);
  };

  return (
    <div
      className="App wingo_interlinked"
      style={{ backgroundImage: props.theme && `url(${props.theme.backgroundImageSrc})` }}
    >
      {!props.isCampaignLevel && (
        <div className="gamemodeSettings">
          <WingoInterlinkedGamemodeSettings
            gamemodeSettings={gamemodeSettings}
            provideWords={props.provideWords}
            handleFitRestrictionToggle={handleFitRestrictionToggle}
            handleSimpleGamemodeSettingsChange={handleSimpleGamemodeSettingsChange}
            handleTimerToggle={handleTimerToggle}
            setMostRecentFitRestriction={setMostRecentFitRestriction}
            resetCountdown={resetCountdown}
            setTotalSeconds={setTotalSeconds}
            onLoadPresetGamemodeSettings={setGamemodeSettings}
            onShowOfAddPresetModal={() => setKeyboardDisabled(true)}
            onHideOfAddPresetModal={() => setKeyboardDisabled(false)}
          />
        </div>
      )}

      <Outcome />

      {inProgress && props.wordArrayConfig.type === "category" && categoryName !== "" && (
        <MessageNotification type="info">
          <strong>Current category:</strong>
          <br />
          {categoryName}
        </MessageNotification>
      )}

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
          <br />
          Word guesses left: <strong>{remainingWordGuesses}</strong>
        </MessageNotification>
      )}

      {Boolean(inProgress && gamemodeSettings.isHintShown && hint) && (
        <MessageNotification type="info">
          <strong>Hint:</strong> {hint}
        </MessageNotification>
      )}

      <Grid />

      {inProgress && (
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

      <Keyboard
        onEnter={onEnter}
        onSubmitLetter={onSubmitLetter}
        onBackspace={onBackspace}
        guesses={[]}
        targetWord={""}
        inDictionary={true}
        letterStatuses={[]}
        settings={props.settings}
        disabled={keyboardDisabled || !inProgress}
        hasSpaces={allowSpaces}
        hasBackspace={true}
        hasEnter={true}
      />

      <div>
        {gamemodeSettings.timerConfig.isTimed && (
          <ProgressBar
            progress={remainingSeconds}
            total={gamemodeSettings.timerConfig.seconds}
            display={{ type: "transition", colorTransition: GreenToRedColorTransition }}
          />
        )}
      </div>
    </div>
  );
};
