import React from "react";
import './index.css';

interface Props {
  letter: string
  status: "incorrect" | "contains" | "correct" | "not set" | "not in word"
}

const LetterTile: React.FC<Props> = (props) => {
  return (
    <div className="letter_tile" data-status={props.status}>
      {props.letter}
    </div>
  );
}

export default LetterTile;