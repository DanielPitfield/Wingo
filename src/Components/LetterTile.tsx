import React, { useState } from "react";
import { SettingsData } from "../Data/SaveData/SaveData";

export type LetterStatus = "incorrect" | "contains" | "correct" | "not set" | "not in word";

interface Props {
  letter: string;
  status: LetterStatus;
  settings: SettingsData;
  onClick?: () => void;
  disabled?: boolean;
  indexInWord?: number;
  animationDelayMultiplier?: number;
  applyAnimation?: boolean;
  additionalProps?: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
}

const LetterTile = (props: Props) => {
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

    // No animation delay for pop animation (when tile statuses are not set)
    if (props.status === "not set") {
      return undefined;
    }

    if (!props.letter) {
      return undefined;
    }

    if (!props.applyAnimation) {
      return undefined;
    }

    if (!props.settings.graphics.animation) {
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
    // [data-apply-animation="false"] - No animations are applied to LetterTile
    // [data-new-letter-added="true"] - Pop animation is applied to LetterTile
    // [data-has-been-submitted="true"] - Reveal animation is applied to LetterTile
    <div
      className="letter_tile"
      onClick={props.onClick}
      data-animation-setting={props.settings.graphics.animation}
      data-apply-animation={props.applyAnimation}
      data-new-letter-added={props.status === "not set" && props.letter !== undefined}
      data-has-been-submitted={props.status !== "not set" && props.status !== "incorrect" && props.letter !== undefined}
      data-status={delayedStatus}
      data-disabled={props.disabled || props.onClick === undefined}
      style={
        delayForThisLetterSeconds() !== undefined ? { animationDelay: `${delayForThisLetterSeconds()}s` } : undefined
      }
      {...props.additionalProps}
    >
      {props.letter}
    </div>
  );
};

export default LetterTile;
