import React from "react";
import LetterTile from "./LetterTile";

interface Props {
  length: number;
  word: string;
  targetWord: string;
  hasSubmit: boolean;
}

export const WordRow: React.FC<Props> = (props) => {

  function CreateRow() {
    var TileArray = [];
    for(let i = 0; i < props.length; i++) {
      var status : "incorrect" | "contains" | "correct" | "not set";
      if (!props.hasSubmit) {
        status = "not set";
      }
      else if (props.targetWord[i].toUpperCase() === props.word[i]?.toUpperCase()) {
        status = "correct";
      }
      else if (props.targetWord.toUpperCase().includes(props.word[i]?.toUpperCase())) {
        status = "contains";
      }
      else {
        status = "incorrect";
      }

      TileArray.push(<LetterTile key={i} letter={props.word[i]} status={status}></LetterTile>);
    }

    return TileArray;
  }

  return (
    <div className="word_row"><>{CreateRow()}</></div>    
  );
};