import React from "react";
import LetterTile from "./LetterTile";
import { getWordSummary } from "./WordleConfig";

interface Props {
  length: number;
  word: string;
  isVertical: boolean;
  targetWord: string;
  hasSubmit: boolean;
  inDictionary: boolean;
}

export const WordRow: React.FC<Props> = (props) => {
  // TODO: Is there a better way of doing this?  
  let wordSummary: any = [];
  // Only get wordSummary if word and targetWord are defined
  if (props.word && props.targetWord) {
    // Array of (character, status) for every letter
    wordSummary = getWordSummary(
      props.word,
      props.targetWord,
      props.inDictionary
    );
  }

  function CreateRow() {
    var TileArray = [];
    for (let i = 0; i < props.length; i++) {
      TileArray.push(
        <LetterTile
          key={i}
          letter={props.word?.[i]}
          status={
            !props.hasSubmit || !props.word || !props.targetWord ? "not set" : wordSummary[i]?.status
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
