import React from "react";
import LetterTile from "./LetterTile";

export const Logo: React.FC = (props) => {
  return (
    <div className="logo">
      <LetterTile letter={"W"} status={"not set"} applyAnimation={false}></LetterTile>
      <LetterTile letter={"I"} status={"contains"} applyAnimation={false}></LetterTile>
      <LetterTile letter={"N"} status={"correct"} applyAnimation={false}></LetterTile>
      <LetterTile letter={"G"} status={"incorrect"} applyAnimation={false}></LetterTile>
      <LetterTile letter={"O"} status={"contains"} applyAnimation={false}></LetterTile>
    </div>
  );
};
