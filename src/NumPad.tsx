import React from "react";
import "./index.scss";
import { Button } from "./Button";

interface Props {
  onSubmitNumber: (number: number) => void;
  onEnter: () => void;
  onBackspace: () => void;
}

export const Numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export const NumPad: React.FC<Props> = (props) => {
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const input_key = event.key.toString().toLowerCase();

      if (input_key === "enter") {
        props.onEnter();
        return;
      }

      if (input_key === "backspace") {
        props.onBackspace();
        return;
      }

      const keyAsInt = parseInt(input_key);

      if (Numbers.includes(keyAsInt)) {
        props.onSubmitNumber(keyAsInt);
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [props.onEnter, props.onBackspace, props.onSubmitNumber]);

  function populateNumpad(numbers: number[]) {
    return numbers.map((number) => (
      <Button key={number} mode="default" onClick={() => props.onSubmitNumber(number)}>
        {number}
      </Button>
    ));
  }

  return (
    <div className="keyboard_wrapper">
      <div className="keyboard_row_top">
        <>{populateNumpad([7, 8, 9])}</>
      </div>
      <div className="keyboard_row_middle">
        <>{populateNumpad([4, 5, 6])}</>
      </div>
      <div className="keyboard_row_bottom">
        <>{populateNumpad([1, 2, 3])}</>
      </div>
      <div className="keyboard_row_bottom">
        <>{populateNumpad([0])}</>
        <Button mode="destructive" onClick={props.onBackspace}>
          &lt;
        </Button>
      </div>
      <div className="keyboard_enter">
        <Button mode="accept" onClick={props.onEnter}>
          Enter
        </Button>
      </div>
    </div>
  );
};
