import React, { useState } from "react";
import "./index.scss";

interface Props {
  letter: string;
  status: "incorrect" | "contains" | "correct" | "not set" | "not in word";
  indexInWord?: number;
  animationDelayMultiplier?: number;
  applyAnimation?: boolean;
}

const LetterTile: React.FC<Props> = (props) => {
  const DELAY_BETWEEN_TILE_REVEAL_SECONDS = 0.4;

  /**
   * Calculates the delay to apply to the letter animation.
   * @returns Delay in seconds, or undefined if not applicable.
   */
  function delayForThisLetterSeconds(): number | undefined {
    if (props.indexInWord === undefined) {
      return undefined;
    }

    if (props.status === "incorrect") {
      return undefined;
    }

    if (!props.letter) {
      return undefined;
    }

    if (!props.applyAnimation) {
      return undefined;
    }

    // Determine the delay for this index in the word
    const delayForIndexSeconds = props.indexInWord * DELAY_BETWEEN_TILE_REVEAL_SECONDS;

    // Determine the multiplier (if any)
    const delayMultipler = props.animationDelayMultiplier !== undefined ? props.animationDelayMultiplier : 1;

    // Take the delay, multiply by multipler
    return delayForIndexSeconds * delayMultipler;
  }

  const [delayedStatus, setDelayedStatus] = useState<Props["status"]>("not set");

  React.useEffect(() => {
    if (props.status === "not set") {
      setDelayedStatus(props.status);
      return;
    }

    const timeoutId = setTimeout(() => setDelayedStatus(props.status), (delayForThisLetterSeconds() || 0) * 1000);

    return () => clearTimeout(timeoutId);
  }, [props.status]);

  return (
    // [data-apply-animation="false"] - No animations are applied to WordRow
    // [data-new-letter-added="true"] - Pop animation is applied to LetterTile
    // [data-has-been-submitted="true"] - Reveal animation is applied to LetterTile
    <div
      className="letter_tile"
      data-apply-animation={props.applyAnimation !== false}
      data-new-letter-added={Boolean(props.status === "not set" && props.letter)}
      data-has-been-submitted={props.applyAnimation}
      data-status={delayedStatus}
      style={delayForThisLetterSeconds ? { animationDelay: `${delayForThisLetterSeconds()}s` } : undefined}
    >
      {props.letter}
    </div>
  );
};

export default LetterTile;
