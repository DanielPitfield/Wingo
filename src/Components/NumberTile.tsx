import React from "react";

interface Props {
  onClick?: () => void;
  isReadOnly?: boolean;
  number: number | null;
  disabled: boolean;
}

const NumberTile = (props: Props) => {
  return (
    <div
      className="number_tile"
      data-disabled={props.disabled}
      data-is-readonly={props.isReadOnly || false}
      onClick={props.onClick}
    >
      {props.number}
    </div>
  );
};

export default NumberTile;
