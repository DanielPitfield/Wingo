import React from "react";
import LetterTile from "./LetterTile";
import { getWordSummary } from "./WordleConfig";

interface Props {
  mode: string;
  length: number;
  word: string;
  isVertical: boolean;
  targetWord: string;
  revealedLetterIndexes?: number[];
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
  wordSummary = getWordSummary(props.word, props.targetWord, props.inDictionary);

  function isAnimationEnabled(letterIndex: number) {
    // Minimum set of criteria that must be satisfied for animation to be applied
    const animation_criteria =
      props.hasSubmit && props.word !== undefined && props.word?.[letterIndex] !== undefined && props.inDictionary;
      // Don't apply animation for WordRows in Countdown Letters mode
    if (props.mode === "countdown_letters_casual" || props.mode === "countdown_letters_realistic") {
      return false;
    } 
    // Apply animation only to LetterTiles which have been revealed in Puzzle mode
    else if (props.mode === "puzzle") {
      if (animation_criteria && props.revealedLetterIndexes && props.revealedLetterIndexes.includes(letterIndex)) {
        return false;
      }
    } 
    // Apply animation to LetterTiles if the minimum criteria is met (in any other mode)
    else if (!props.revealedLetterIndexes && animation_criteria) {
      return true;
    }
  }

  function CreateRow() {
    var TileArray = [];
    for (let i = 0; i < props.length; i++) {
      TileArray.push(
        <LetterTile
          key={i}
          indexInWord={props.revealedLetterIndexes ? props.revealedLetterIndexes.length : i}
          letter={props.word?.[i]}
          applyAnimation={isAnimationEnabled(i)}
          status={!props.hasSubmit || !props.word ? "not set" : wordSummary[i]?.status}
        ></LetterTile>
      );
    }

    return TileArray;
  }

  return (
    // [data-invalid-word-submitted="true"] - Shake animation is applied to WordRow
    <div
      className={props.isVertical ? "word_row_vertical" : "word_row"}
      data-invalid-word-submitted={props.word && props.hasSubmit && !props.inDictionary}
    >
      <>{CreateRow()}</>
    </div>
  );
};
