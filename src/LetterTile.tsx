import React from "react";
import "./index.scss";

interface Props {
  letter: string;
  status: "incorrect" | "contains" | "correct" | "not set" | "not in word";
  indexInWord?: number;
}

const LetterTile: React.FC<Props> = (props) => {
  const DELAY_BETWEEN_TILE_REVEAL_SECONDS = 0.4;

  return (
    <div
      className="letter_tile"
      data-status={props.status}
      style={
        props.indexInWord !== undefined
          ? { animationDelay: `${props.indexInWord * DELAY_BETWEEN_TILE_REVEAL_SECONDS}s` }
          : undefined
      }
    >
      {props.letter}
    </div>
  );
};

export default LetterTile;
