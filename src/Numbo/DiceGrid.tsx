import React from "react";
import "../index.css";
import Dice from "./Dice";

function getRandomDiceNumber() {
  const diceNumber = Math.round(Math.random() * 6);
  return diceNumber;
}

const DiceGrid: React.FC = (props) => {
  return (
    <div className="dice_wrapper">
      <div className="dice_top">
        <Dice value={getRandomDiceNumber()}></Dice>
        <Dice value={getRandomDiceNumber()}></Dice>
      </div>
      <div className="dice_bottom">
        <Dice value={getRandomDiceNumber()}></Dice>
        <Dice value={getRandomDiceNumber()}></Dice>
      </div>
    </div>
  );
};

export default DiceGrid;
