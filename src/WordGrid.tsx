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

export const WordGrid: React.FC<Props> = (props) => {
  const [inProgress, setInProgress] = useState(true);
  const [gridConfig, setGridConfig] = useState<GridConfig>(generateGridConfig());
  const [currentGrid, setCurrentGrid] = useState<{ x: number; y: number; letter: string }[]>(
    getCorrectLetterGrid().map((position) => {
      position.letter = position.letter === "" ? "" : "?";
      return position;
    })
  );
  const [currentInputCoordinates, setCurrentInputCoordinates] = useState<{
    xPos: number;
    yPos: number;
    oreintation: Orientation;
  }>({ xPos: 0, yPos: 0, oreintation: "vertical" });

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
  function getCorrectLetterGrid(): { x: number; y: number; letter: string }[] {
    const grid = [];

    const gridWordCoordinates: { x: number; y: number; letter: string }[] = gridConfig.words.flatMap((configWord) => {
      const coords = [];

      // Add the first starting coordinate in the array
      coords.push({ x: configWord.startingXPos, y: configWord.startingYPos, letter: configWord.word.charAt(0) });

      // For the remaining length of the word
      for (let i = 1; i <= configWord.word.length; i++) {
        // Increment x co-ordinate
        if (configWord.orientation === "horizontal") {
          coords.push({
            x: configWord.startingXPos + i,
            y: configWord.startingYPos,
            letter: configWord.word.charAt(i),
          });
        }

        // Increment y co-ordinate
        if (configWord.orientation === "vertical") {
          coords.push({
            x: configWord.startingXPos,
            y: configWord.startingYPos + i,
            letter: configWord.word.charAt(i),
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
            }
          );
        }
      }
    }

    return grid;
  }

  function findClickedWord(xPos: number, yPos: number) {
    // The word which the LetterTile clicked is the first letter of
    const clickedWord = gridConfig.words.find((word) => word.startingXPos === xPos && word.startingYPos === yPos);

    // Not the first LetterTile of a word
    if (!clickedWord) {
      return;
    }

    // Keyboard input can now start at this location
    setCurrentInputCoordinates({
      xPos: clickedWord.startingXPos,
      yPos: clickedWord.startingYPos,
      oreintation: clickedWord.orientation,
    });
  }

  function onSubmitLetter(letter: string) {
    // Add letter to grid
    const newWordGrid = currentGrid.map((position) => {
      if (position.x === currentInputCoordinates.xPos && position.y === currentInputCoordinates.yPos) {
        position.letter = letter;
      }
      return position;
    });

    setCurrentGrid(newWordGrid);

    // Move input co-ordinates along
    if (currentInputCoordinates.oreintation === "horizontal") {
      setCurrentInputCoordinates({
        xPos: currentInputCoordinates.xPos + 1,
        yPos: currentInputCoordinates.yPos,
        oreintation: currentInputCoordinates.oreintation,
      });
    } else if (currentInputCoordinates.oreintation === "vertical") {
      setCurrentInputCoordinates({
        xPos: currentInputCoordinates.xPos,
        yPos: currentInputCoordinates.yPos + 1,
        oreintation: currentInputCoordinates.oreintation,
      });
    }
  }

  function onBackspace() {}

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
          const letter = currentGrid.find((letter) => letter.x === x && letter.y === y)?.letter || "";

          return (
            <LetterTile
              key={x}
              letter={letter}
              settings={props.settings}
              status="not set"
              onClick={() => findClickedWord(x, y)}
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
    <>
      <div
        className="App word_grid"
        style={{
          backgroundImage: props.theme && `url(${props.theme.backgroundImageSrc})`,
          backgroundSize: "100%",
          backgroundRepeat: "no-repeat",
        }}
      >
        {populateGrid()}
      </div>
      <div className="keyboard">
        {
          <Keyboard
            mode={"word_grid"}
            onEnter={() => onEnter()}
            onSubmitLetter={(letter) => {
              onSubmitLetter(letter);
            }}
            onBackspace={() => onBackspace()}
            guesses={[]}
            targetWord={""}
            inDictionary={true}
            letterStatuses={[]}
            settings={props.settings}
            disabled={inProgress}
            allowSpaces={allowSpaces()}
          ></Keyboard>
        }
      </div>
    </>
  );
};
