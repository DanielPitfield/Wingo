import React from "react";
import LetterTile from "./LetterTile";

interface Props {
  length: number;
  word: string;
  targetWord: string;
  hasSubmit: boolean;
  inDictionary: boolean;
}

export const WordRow: React.FC<Props> = (props) => {

  function CreateRow() {
    var TileArray = [];
    for (let i = 0; i < props.length; i++) {
      var status: "incorrect" | "contains" | "correct" | "not set" | "not in word";

      if (!props.inDictionary) { // Red
        status = "incorrect";
      }
      else if (!props.hasSubmit) { // Empty/unused
        status = "not set";
      }
      else if (props.targetWord[i].toUpperCase() === props.word[i]?.toUpperCase()) { // Green
        status = "correct";
      }
      else if (props.targetWord.toUpperCase().includes(props.word[i]?.toUpperCase())) { // Yellow
        status = "contains";
      }
      else {
        status = "not in word"; // Another status for letter is not in word?
      }

      TileArray.push(<LetterTile key={i} letter={props.word[i]} status={status}></LetterTile>);
    }

    return TileArray;
  }

  return (
    <div className="word_row"><>{CreateRow()}</></div>
  );
};