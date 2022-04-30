import React from "react";
import { Button } from "../Button";
import "../index.scss";
import { SettingsData } from "../SaveData";
import Dice from "./Dice";

interface Props {
  diceValues: number[];
  rollDice: () => void;
  settings: SettingsData;
  disabled: boolean;
}

const DiceGrid: React.FC<Props> = (props) => {
  return (
    <div className="dice_wrapper">
      <div className="dice_row">
        {props.diceValues.map((diceValue, i) => (
          <Dice key={i} value={diceValue} settings={props.settings} />
        ))}
      </div>
      <Button mode={"default"} onClick={props.rollDice} settings={props.settings} disabled={props.disabled}>
        {props.children}
      </Button>
    </div>
  );
};

export default DiceGrid;
