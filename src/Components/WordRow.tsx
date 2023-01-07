import LetterTile, { TileStatus } from "./LetterTile";
import { getWordRowStatusSummary, WordRowStatusChecks, WordRowStatusSummary } from "../Helpers/getWordRowStatusSummary";
import { useLocation } from "react-router-dom";
import { PagePath } from "../Data/PageNames";
import { SettingsData } from "../Data/SaveData/Settings";

interface WordRowProps {
  isReadOnly: boolean;
  inProgress?: boolean;
  length: number;
  word: string;
  targetWord: string;
  settings: SettingsData;
  targetArray?: string[];
  revealedLetterIndexes?: number[];
  hasSubmit: boolean;
  inDictionary: boolean;
  isIncompleteWord?: boolean;
  applyAnimation?: boolean;
}

const WordRow = (props: WordRowProps) => {
  const location = useLocation().pathname as PagePath;

  const isAnimationEnabled = (letterIndex: number): boolean => {
    if (location === "/Wingo/Daily") {
      const hasEnded = !props.inProgress && props.word && props.hasSubmit;
      // Game has ended (true) then animation is disabled (false) and vice versa
      return !hasEnded;
    }

    if (location === "/LettersGame") {
      return false;
    }

    return true;
  };

  const getGuessSummary = (): WordRowStatusSummary => {
    const statusChecks: WordRowStatusChecks = {
      isReadOnly: props.isReadOnly,
      page: location,
      word: props.word,
      targetWord: props.targetWord,
      inDictionary: props.inDictionary,
      wordArray: props.targetArray ?? [],
    };

    // Array of (letter, status) for every letter
    return getWordRowStatusSummary(statusChecks);
  };

  const areAllStatusesCorrect = (): boolean => {
    return getGuessSummary().every((letter) => letter.status === "correct");
  };

  const getFinalTileStatus = (index: number): TileStatus => {
    const guessSummary = getGuessSummary();

    if (!guessSummary) {
      return "not set";
    }

    // No word has been submitted for this WordRow yet
    if (!props.hasSubmit || !props.word) {
      return "not set";
    }

    // Unrevealed letters of the display row in Puzzle mode
    if (location === "/Wingo/Puzzle" && props.isReadOnly && guessSummary[index]?.letter === " ") {
      return "not set";
    }

    // Otherwise, return the status at that index in the guessSummary
    return guessSummary[index]?.status ?? "not set";
  };

  function CreateRow() {
    let tileArray = [];

    for (let i = 0; i < props.length; i++) {
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
          animationDelayMultiplier={props.revealedLetterIndexes ? 0 : areAllStatusesCorrect() ? 0.3 : undefined}
          settings={props.settings}
          status={getFinalTileStatus(i)}
        />
      );
    }

    return tileArray;
  }

  return (
    // [data-apply-animation="false"] - No animations are applied to WordRow
    // [data-invalid-word-submitted="true"] - Shake animation is applied to WordRow
    // [data-correct-word-submitted="true"] - Jump animation is applied to WordRow
    <div
      className="word_row"
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

export default WordRow;
