import React from "react";
import { Button } from "../Button";
import "../index.css";

interface Props {
  gridSize: number;
}

const Nubble: React.FC<Props> = (props) => {
  function populateGrid() {
    var Grid = [];
    for (let i = 1; i <= props.gridSize; i++) {
      Grid.push(<Button mode={"default"}>{i}</Button>);
    }
    return Grid;
  }

  return (
    <div className="App">
      <div className="number_grid">{populateGrid()}</div>
    </div>
  );
};

export default Nubble;
