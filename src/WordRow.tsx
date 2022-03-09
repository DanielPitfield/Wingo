import React from "react";
import LetterTile from "./LetterTile";

interface Props {
  length: number;
  word: string;
  isVertical: boolean;
  targetWord: string;
  hasSubmit: boolean;
  inDictionary: boolean;
  getLetterStatus: (
    letter: string,
    index: number
  ) => "incorrect" | "contains" | "correct" | "not set" | "not in word";
}


export const WordRow: React.FC<Props> = (props) => {
  /*
  // Checks whether the letter will already have status 'correct' at some index
  function isGreenLetterAlready(letter: string) {
    for (let i = 0; i < wordLength; i++) {
      if (targetWord?.[i]?.toUpperCase() === letter?.toUpperCase()) {
        return true;
      }
    }
    return false;
  }

  function isOrangeLetterAlready(letter: string) {
    for (let i = 0; i < wordLength; i++) {
      if (targetWord?.toUpperCase().includes(letter?.toUpperCase())) {
        return true;
      }
    }
    return false;
  }
  */

  function CreateRow() {
    var TileArray = [];
    for (let i = 0; i < props.length; i++) {
      TileArray.push(
        <LetterTile
          key={i}
          letter={props.word?.[i]}
          status={
            !props.hasSubmit
              ? "not set"
              : props.getLetterStatus(props.word?.[i], i)
            // TODO:
          }
        ></LetterTile>
      );
    }

    return TileArray;
  }

  return (
    <div className={props.isVertical ? "word_row_vertical" : "word_row"}>
      <>{CreateRow()}</>
    </div>
  );
};
