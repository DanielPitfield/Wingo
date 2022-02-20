import React, { useState } from "react";
import { Button } from "../Button";
import "../index.css";
import Dice from "./Dice";

interface Props {
  numDice: number;
}

function randomIntFromInterval(min: number, max: number) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function randomDiceNumber() {
  return randomIntFromInterval(1,6);
}

const DiceGrid: React.FC<Props> = (props) => {
  const [dice1_value, setdice1_value] = useState(randomDiceNumber);
  const [dice2_value, setdice2_value] = useState(randomDiceNumber);
  const [dice3_value, setdice3_value] = useState(randomDiceNumber);
  const [dice4_value, setdice4_value] = useState(randomDiceNumber);
  const [isRolling, setisRolling] = useState(false);

  function RollDice() {
    setdice1_value(randomDiceNumber());
    setdice2_value(randomDiceNumber());
    setdice3_value(randomDiceNumber());
    setdice4_value(randomDiceNumber());
    setisRolling(true);

    setTimeout(() => {
      setisRolling(false);
    }, 1000);
  }

  return (
    <div className="dice_wrapper">
      <div className="dice_row">
        <Dice value={dice1_value}></Dice>
        <Dice value={dice2_value}></Dice>
      </div>
      <div className="dice_row">
        <Dice value={dice3_value}></Dice>
        <Dice value={dice4_value}></Dice>
      </div>
      <div className="dice_row">
        <Button mode={"default"} onClick={RollDice}>
          {isRolling ? "Rolling" : "Roll Dice"}
        </Button>
      </div>
    </div>
  );
};

export default DiceGrid;
