import React, { useState } from "react";
import "./index.scss";

interface Props {
  letter: string;
  status: "incorrect" | "contains" | "correct" | "not set" | "not in word";
  indexInWord?: number;
}

const LetterTile: React.FC<Props> = (props) => {
  const DELAY_BETWEEN_TILE_REVEAL_SECONDS = 0.4;
  const delayForThisLetterSeconds =
    props.indexInWord !== undefined ? props.indexInWord * DELAY_BETWEEN_TILE_REVEAL_SECONDS : undefined;

  const [delayedStatus, setDelayedStatus] = useState<Props["status"]>("not set");

  React.useEffect(() => {
    if (props.status === "not set") {
      return;
    }

    const timeoutId = setTimeout(() => setDelayedStatus(props.status), (delayForThisLetterSeconds || 0) * 1000);

    return () => clearTimeout(timeoutId);
  }, [props.status]);

  return (
    <div
      className="letter_tile"
      data-status={delayedStatus}
      style={delayForThisLetterSeconds ? { animationDelay: `${delayForThisLetterSeconds}s` } : undefined}
    >
      {props.letter}
    </div>
  );
};

export default LetterTile;
