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
  let wordSummary: {
    character: string;
    status: "incorrect" | "contains" | "correct" | "not set" | "not in word";
  }[] = [];

  // NOTE: The targetWord will be "" (empty string) with the WordRow that handles guessed words during the 'Countdown Letters' mode

  // Array of (character, status) for every letter
  wordSummary = getWordSummary(
    props.word,
    props.targetWord,
    props.inDictionary
  );

  function CreateRow() {
    var TileArray = [];
    for (let i = 0; i < props.length; i++) {
      TileArray.push(
        <LetterTile
          key={i}
          indexInWord={i}
          letter={props.word?.[i]}
          status={!props.hasSubmit || !props.word ? "not set" : wordSummary[i]?.status}
        ></LetterTile>
      );
    }

    return TileArray;
  }

  return (
    <div className={props.isVertical ? "word_row_vertical" : "word_row"} data-has-been-submitted={props.word && props.hasSubmit}>
      <>{CreateRow()}</>
    </div>
  );
};
