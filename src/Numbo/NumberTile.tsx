import React from "react";
import '../index.css';

interface Props {

}

let smallNumbers: Array<number>;
smallNumbers = [1 , 1 , 2 , 2 , 3 , 3 , 4 , 4 , 5 , 5 , 6 , 6 , 7 , 7 , 8 , 8 , 9 , 9 , 10 , 10];

let LargeNumbers: Array<number>;
LargeNumbers = [25, 50, 75, 100];

const NumberTile: React.FC<Props> = () => {
  return (
    <div className="number_tile">
      {smallNumbers[Math.floor(Math.random() * smallNumbers.length)]}
    </div>
  );
}

export default NumberTile;