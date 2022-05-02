import LetterTile from "./LetterTile";
import { SettingsData } from "./SaveData";
import crossWordGenerator from "cwg";
import { useState } from "react";
import { shuffleArray } from "./NumbersArithmetic/ArithmeticDrag";
import { Theme } from "./Themes";
import { Keyboard } from "./Keyboard";

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
  const [currentWords, setCurrentWords] = useState<string[]>(Array.from({ length: props.numWords }).map((x) => ""));
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);

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

      // Remove ae letter from the word
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
    const grid = getCorrectLetterGrid();

    return (
      <div className="word-grid-row" key={y}>
        {Array.from({ length: gridConfig.width }).map((_, x) => {
          const matchingGridEntry = grid.find((letter) => letter.x === x && letter.y === y);
          const currentWord =
            matchingGridEntry?.wordIndex !== undefined ? currentWords[matchingGridEntry.wordIndex] : "";

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
            <LetterTile
              key={x}
              letter={letter}
              settings={props.settings}
              status={matchingGridEntry?.wordIndex === currentWordIndex ? "contains" : "not set"}
              onClick={
                matchingGridEntry?.wordIndex !== undefined
                  ? () => setCurrentWordIndex(matchingGridEntry.wordIndex!)
                  : undefined
              }
              additionalProps={letter ? undefined : { style: { visibility: "hidden" } }}
            ></LetterTile>
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
      <div className="keyboard">
        {
          <Keyboard
            mode={"word_grid"}
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
