import React from "react";
import { PageName } from "../PageNames";
import LetterTile from "./LetterTile";
import { SettingsData } from "../Data/SaveData";
import { getWordSummary } from "../Pages/WingoConfig";

interface Props {
  page: PageName;
  isReadOnly: boolean;
  inProgress?: boolean;
  length: number;
  word: string;
  isVertical: boolean;
  targetWord: string;
  settings: SettingsData;
  targetArray?: string[];
  revealedLetterIndexes?: number[];
  hasSubmit: boolean;
  inDictionary: boolean;
  isIncompleteWord?: boolean;
  applyAnimation?: boolean;
}

export const WordRow: React.FC<Props> = (props) => {
  let wordSummary: {
    character: string;
    status: "incorrect" | "contains" | "correct" | "not set" | "not in word";
  }[] = [];

  // NOTE: The targetWord will be "" (empty string) with the WordRow that handles guessed words during the 'Letters Game' mode

  // Array of (character, status) for every letter
  wordSummary = getWordSummary(props.page, props.word, props.targetWord, props.inDictionary);

  // Overwrite wordSummary if LettersCategories mode
  if (props.page === "LettersCategories" && props.targetArray) {
    if (props.targetArray.includes(props.word)) {
      wordSummary.map((x) => {
        x.status = "correct";
        return x;
      });
    } else {
      wordSummary.map((x) => {
        x.status = "incorrect";
        return x;
      });
    }
  }

  // Tile status for read only WordRows
  if (props.isReadOnly) {
    wordSummary.map((x) => {
      // There is a letter
      if (x.character !== undefined && x.character !== "" && x.character !== " ") {
        x.status = "correct";
      } else {
        x.status = "not set";
      }

      return x;
    });
  }

  function isAnimationEnabled(letterIndex: number): boolean {
    // Puzzle and conundrum read only WordRows
    if (props.revealedLetterIndexes !== undefined && props.isReadOnly) {
      // The letter is revealed
      if (props.revealedLetterIndexes.includes(letterIndex)) {
        return true;
      } else {
        return false;
      }
    }
    // Don't apply animation for LetterTiles in Letters Game mode
    else if (props.page === "LettersGame") {
      return false;
    }
    // Don't apply animation for LetterTiles in daily mode, when the game reports as having ended
    else if (props.page === "wingo/daily" && !props.inProgress && props.word && props.hasSubmit) {
      return false;
    }
    // Other modes and everything is suitable for animation
    else {
      return true;
    }
  }

  function CreateRow() {
    let tileArray = [];
    
    for (let i = 0; i < props.length; i++) {
      const allCorrect = wordSummary.every((letter) => letter.status === "correct");

      tileArray.push(
        <LetterTile
          key={i}
          indexInWord={props.revealedLetterIndexes ? props.revealedLetterIndexes.length : i}
          letter={props.word?.[i]}
          // Should the LetterTile pop/reveal in this gamemode?
          applyAnimation={isAnimationEnabled(i)}
          /*
          When props.revealedLetterIndexes is specified, there is no delay with revealing letters because
          animation will only be applied starting from when the there is at least one index (and also when the tile is given a letter)

          If the word is correct, show a faster animation
          */
          animationDelayMultiplier={props.revealedLetterIndexes ? 0 : allCorrect ? 0.3 : undefined}
          settings={props.settings}
          status={!props.hasSubmit || !props.word ? "not set" : wordSummary[i]?.status}
        ></LetterTile>
      );
    }

    return tileArray;
  }

  return (
    // [data-apply-animation="false"] - No animations are applied to WordRow
    // [data-invalid-word-submitted="true"] - Shake animation is applied to WordRow
    // [data-correct-word-submitted="true"] - Jump animation is applied to WordRow
    <div
      className={props.isVertical ? "word_row_vertical" : "word_row"}
      data-animation-setting={props.settings.graphics.animation}
      // Only false if directly specified as false with props.applyAnimation (defaults to true)
      data-apply-animation={props.applyAnimation === undefined || props.applyAnimation}
      data-invalid-word-submitted={Boolean(
        (props.word && props.hasSubmit && !props.inDictionary) || (props.isIncompleteWord && props.word)
      )}
      data-correct-word-submitted={Boolean(props.hasSubmit && props.word === props.targetWord)}
    >
      <>{CreateRow()}</>
    </div>
  );
};
