import LetterTile from "./LetterTile";
import { SettingsData } from "./SaveData";
import crossWordGenerator from "cwg";
import { useState } from "react";
import { shuffleArray } from "./NumbersArithmetic/ArithmeticDrag";

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
}

export const WordGrid: React.FC<Props> = (props) => {
  const [gridConfig, setGridConfig] = useState<GridConfig>(generateGridConfig());

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
   *
   * @returns
   */
  function getLetterGrid(): { x: number; y: number; letter: string }[] {
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

  /**
   *
   * @param y
   * @param letterGrid
   * @returns
   */
  function populateRow(y: number, letterGrid: { x: number; y: number; letter: string }[]): JSX.Element {
    return (
      <div className="word-grid-row" key={y}>
        {Array.from({ length: gridConfig.width }).map((_, x) => {
          const letter = letterGrid.find((letter) => letter.x === x && letter.y === y)?.letter || "";

          return (
            <LetterTile
              key={x}
              letter={letter}
              settings={props.settings}
              status="not set"
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
    const letterGrid = getLetterGrid();
    const grid = [];

    for (let y = 0; y < gridConfig.height; y++) {
      grid.push(populateRow(y, letterGrid));
    }

    return grid;
  }

  return <div className="App word_grid">{populateGrid()}</div>;
};
