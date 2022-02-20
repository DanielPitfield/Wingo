import React from "react";
import "../index.css";
import DiceGrid from "./DiceGrid";
import Nubble from "./Nubble";

interface Props {
  numDice: number;
  /* Add props for the minimum and maximum value of the dice? */
  gridSize: number;
  numTeams: number;
  timeLengthMins: number;
}

const NubbleConfig: React.FC<Props> = (props) => {
  return (
    <div className="App">
      <DiceGrid numDice={props.numDice}></DiceGrid>
      <Nubble gridSize={props.gridSize}></Nubble>
    </div>
  );
};

export default NubbleConfig;
