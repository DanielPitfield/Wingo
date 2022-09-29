import LetterTile from "./LetterTile";
import { SettingsData } from "../Data/SaveData";
import { getWordRowStatusSummary, WordRowStatusChecks } from "../Helpers/getWordRowStatusSummary";
import { useLocation } from "react-router-dom";
import { PagePath } from "../Data/PageNames";

interface Props {
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

export const WordRow = (props: Props) => {
  const location = useLocation().pathname as PagePath;

  const statusChecks: WordRowStatusChecks = {
    isReadOnly: props.isReadOnly,
    page: location,
    word: props.word,
    targetWord: props.targetWord,
    inDictionary: props.inDictionary,
    wordArray: props.targetArray ?? [],
  };

  // Array of (character, status) for every letter
  const guessSummary = getWordRowStatusSummary(statusChecks);

  function isAnimationEnabled(letterIndex: number): boolean {
    if (location === "/LettersGame") {
      return false;
    }

    // Daily mode, when the game reports as having ended
    const dailyModeEnd = location === "/Wingo/Daily" && !props.inProgress && props.word && props.hasSubmit;

    if (dailyModeEnd) {
      return false;
    }

    const letterRevealed =
      props.revealedLetterIndexes !== undefined &&
      props.isReadOnly &&
      props.revealedLetterIndexes.includes(letterIndex);

    // Letter hasn't been revealed yet, only show animation when it does become revealed
    if (!letterRevealed) {
      return false;
    }

    return true;
  }

  function CreateRow() {
    let tileArray = [];

    for (let i = 0; i < props.length; i++) {
      const allCorrect = guessSummary.every((letter) => letter.status === "correct");

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
          status={!props.hasSubmit || !props.word ? "not set" : guessSummary[i]?.status}
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
