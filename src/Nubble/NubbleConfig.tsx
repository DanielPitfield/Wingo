import React from "react";
import "../index.css";
import Nubble from "./Nubble";

interface Props {
  numDice: number;
  diceMin: number;
  diceMax: number;
  gridSize: 25 | 64 | 100;
  numTeams: number;
  timeLengthMins: number;
}

const NubbleConfig: React.FC<Props> = (props) => {
  /* Just passes all props through, twss */
  return (
    <div className="App">
      <Nubble
        numDice={props.numDice}
        diceMin={props.diceMin}
        diceMax={props.diceMax}
        gridSize={props.gridSize}
        numTeams={props.numTeams}
        timeLengthMins={props.timeLengthMins}
      ></Nubble>
    </div>
  );
};

export default NubbleConfig;
