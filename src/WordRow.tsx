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
  // Checks whether the letter will already have status 'correct' at any index
  function isGreenLetter(letter: string) {
    for (let i = 0; i < props.length; i++) {
      if (props.getLetterStatus(letter, i) === "correct") {
        return true;
      }
    }
    return false;
  }

  // Checks whether the letter will already have a status 'contains' tile up to the index
  function isOrangeLetterAlready(letter: string, index: number) {
    for (let i = 0; i < index; i++) {
      if (props.getLetterStatus(letter, i) === "contains") {
        return true;
      }
    }
    return false;
  }

  function getFinalLetterStatus(letter: string, index: number) {
    // If there is a green tile of that letter, don't show orange    
    if (isGreenLetter(letter) && props.getLetterStatus(letter, index) === "contains") {
      console.log("Green, no orange: " + letter);
      return "not in word"; 
    }
    // Only ever show 1 orange tile of each letter
    else if (isOrangeLetterAlready(letter, index) && props.getLetterStatus(letter, index) === "contains") {
      console.log("Orange, not 2nd orange: " + letter);
      return "not in word"; 
    }
    else {
      return props.getLetterStatus(letter, index); 
    }
  }

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
              : getFinalLetterStatus(props.word?.[i], i)! /*props.getLetterStatus(props.word?.[i], i)*/
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
