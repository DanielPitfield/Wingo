import React from "react";
import { Button } from "../Button";
import "../index.scss";
import { SettingsData } from "../SaveData";
import Dice from "./Dice";

interface Props {
  diceValues: number[];
  numDice: number;
  rollDice: () => void;
  settings: SettingsData;
  disabled: boolean;
}

const DiceGrid: React.FC<Props> = (props) => {
  function populateGrid() {
    var Grid = [];
    for (let i = 0; i < props.numDice; i++) {
      Grid.push(<Dice key={i} value={props.diceValues[i]}></Dice>);
    }
    return Grid;
  }

  return (
    <div className="dice_wrapper">
      <div className="dice_row">{populateGrid()}</div>
      <Button mode={"default"} onClick={props.rollDice} settings={props.settings} disabled={props.disabled}>
        {props.children}
      </Button>
    </div>
  );
};

export default DiceGrid;
