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
  function getWordSummary(word: string) {
    // Character and status array
    let defaultCharacterStatuses = word
      .split("")
      .map((character, index) => ({
        character: character,
        status: props.getLetterStatus(character, index),
      }));
    //
    let finalCharacterStatuses = defaultCharacterStatuses.map((x, index) => {
      // If there is a green tile of a letter, don't show any orange tiles
      if (
        x.status === "contains" &&
        defaultCharacterStatuses.some(
          (y) => y.character === x.character && y.status === "correct"
        )
      ) {
        x.status = "not in word";
      }
      // Only ever show 1 orange tile of each letter
      if (
        x.status === "contains" &&
        defaultCharacterStatuses.findIndex(
          (y) => y.character === x.character && y.status === "contains"
        ) != index
      ) {
        x.status = "not in word";
      }
      return x;
    });
    return finalCharacterStatuses;
  }

  const wordSummary = getWordSummary(props.word);

  function CreateRow() {
    var TileArray = [];
    for (let i = 0; i < props.length; i++) {
      TileArray.push(
        <LetterTile
          key={i}
          letter={props.word?.[i]}
          status={!props.hasSubmit ? "not set" : wordSummary[i]?.status}
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
