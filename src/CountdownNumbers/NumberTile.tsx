import React from "react";
import "../index.scss";

interface Props {
  onClick: () => void;
  onRightClick: () => void;
  isReadOnly: boolean;
  number: number | null;
  disabled: boolean;
}

const NumberTile: React.FC<Props> = (props) => {
  return (
    <div
      className="number_tile"
      onContextMenuCapture={() => false}
      data-disabled={props.disabled}
      onClick={props.onClick}
      onContextMenu={props.onRightClick}
    >
      {props.number}
    </div>
  );
};

export default NumberTile;
