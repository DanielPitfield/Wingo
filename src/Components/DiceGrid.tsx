import React from "react";
import { SettingsData } from "../Data/SaveData/Settings";
import Button from "./Button";
import Dice from "./Dice";

interface DiceGridProps {
  children?: React.ReactNode;
  diceValues: number[];
  rollDice: () => void;
  settings: SettingsData;
  disabled: boolean;
}

const DiceGrid = (props: DiceGridProps) => {
  const numDice = props.diceValues.length;
  const isEvenNumDice = numDice % 2 === 0;

  const rollDiceButton = (
    <div className="dice_row">
      <Button
        className="roll_dice"
        mode={"default"}
        onClick={props.rollDice}
        settings={props.settings}
        disabled={props.disabled}
      >
        {props.children}
      </Button>
    </div>
  );

  if (isEvenNumDice) {
    const halfwayIndex = Math.ceil(numDice / 2);
    const firstDiceRow = props.diceValues.slice(0, halfwayIndex);
    const secondDiceRow = props.diceValues.slice(halfwayIndex);

    // Two rows of dice
    return (
      <div className="dice_wrapper">
        <div className="dice_row">
          {firstDiceRow.map((diceValue, i) => (
            <Dice key={i} value={diceValue} settings={props.settings} />
          ))}
        </div>
        <div className="dice_row">
          {secondDiceRow.map((diceValue, i) => (
            <Dice key={i} value={diceValue} settings={props.settings} />
          ))}
        </div>
        {rollDiceButton}
      </div>
    );
  }

  return (
    <div className="dice_wrapper">
      <div className="dice_row">
        {props.diceValues.map((diceValue, i) => (
          <Dice key={i} value={diceValue} settings={props.settings} />
        ))}
      </div>
      {rollDiceButton}
    </div>
  );
};

export default DiceGrid;
