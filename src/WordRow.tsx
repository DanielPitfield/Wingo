import React from "react";
import LetterTile from "./LetterTile";
import { SettingsData } from "./SaveData";
import { getWordSummary } from "./WordleConfig";

interface Props {
  mode: string;
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

  // NOTE: The targetWord will be "" (empty string) with the WordRow that handles guessed words during the 'Countdown Letters' mode

  // Array of (character, status) for every letter
  wordSummary = getWordSummary(props.mode, props.word, props.targetWord, props.inDictionary);

  // Overwrite wordSummary if LettersCategories mode
  if (props.mode === "letters_categories" && props.targetArray) {
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

  // Don't show status if read only (overwrite to not set)
  if (props.isReadOnly) {
    wordSummary.map((x) => {
      x.status = "not set";
      return x;
    });
  }

  function isAnimationEnabled(letterIndex: number) {
    // Minimum set of criteria that must be satisfied for animation to be applied
    const animation_criteria =
      props.hasSubmit && props.word !== undefined && props.word?.[letterIndex] !== undefined && props.inDictionary;
    // Don't apply animation for LetterTiles in Countdown Letters mode
    if (props.mode === "countdown_letters_casual" || props.mode === "countdown_letters_realistic") {
      return false;
    }
    // Don't apply animation for LetterTiles in daily mode, when the game reports as having ended
    else if (props.mode === "daily" && !props.inProgress && props.word && props.hasSubmit) {
      return false;
    }
    // Apply animation only to LetterTiles which have been revealed in Puzzle or Conundrum modes
    else if (props.mode === "puzzle" || props.mode === "conundrum") {
      if (
        props.revealedLetterIndexes &&
        props.revealedLetterIndexes.length > 0 &&
        props.revealedLetterIndexes.includes(letterIndex)
      ) {
        return true;
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
      const allCorrect = wordSummary.every((letter) => letter.status === "correct");

      TileArray.push(
        <LetterTile
          key={i}
          indexInWord={props.revealedLetterIndexes ? props.revealedLetterIndexes.length : i}
          letter={props.word?.[i]}
          // Use props.applyAnimation or otherwise determine if animation is enabled
          applyAnimation={props.applyAnimation !== undefined ? props.applyAnimation : isAnimationEnabled(i)}
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

    return TileArray;
  }

  return (
    // [data-apply-animation="false"] - No animations are applied to WordRow
    // [data-invalid-word-submitted="true"] - Shake animation is applied to WordRow
    // [data-correct-word-submitted="true"] - Jump animation is applied to WordRow
    <div
      className={props.isVertical ? "word_row_vertical" : "word_row"}
      data-animation-setting={props.settings.graphics.animation}
      data-apply-animation={props.applyAnimation}
      data-invalid-word-submitted={Boolean(
        (props.word && props.hasSubmit && !props.inDictionary) || (props.isIncompleteWord && props.word)
      )}
      data-correct-word-submitted={Boolean(props.hasSubmit && props.word === props.targetWord)}
    >
      <>{CreateRow()}</>
    </div>
  );
};
