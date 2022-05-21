import React from "react";
import "./index.scss";
import { Button } from "./Button";
import { SettingsData } from "./SaveData";
import { useClickChime } from "./Sounds";
import { FiChevronLeft, FiCornerDownLeft } from "react-icons/fi";

interface Props {
  settings: SettingsData;
  onSubmitNumber: (number: number) => void;
  onEnter: () => void;
  onBackspace: () => void;
  disabled?: boolean;
}

export const Numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

export const NumPad: React.FC<Props> = (props) => {
  const [playClickSoundEffect] = useClickChime(props.settings);

  React.useEffect(() => {
    if (props.disabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const input_key = event.key.toString().toLowerCase();

      if (["f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "f10", "f11", "f12"].includes(input_key)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (input_key === "enter") {
        props.onEnter();
        return;
      }

      if (input_key === "backspace") {
        props.onBackspace();
        playClickSoundEffect();
        return;
      }

      const keyAsInt = parseInt(input_key);

      if (Numbers.includes(keyAsInt)) {
        props.onSubmitNumber(keyAsInt);
        playClickSoundEffect();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [props.onEnter, props.onBackspace, props.onSubmitNumber]);

  function populateNumpad(numbers: number[]) {
    return numbers.map((number) => (
      <Button
        key={number}
        mode="default"
        settings={props.settings}
        onClick={() => props.onSubmitNumber(number)}
        disabled={props.disabled}
      >
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
        <Button mode="destructive" settings={props.settings} onClick={props.onBackspace} disabled={props.disabled}>
          <FiChevronLeft />
        </Button>
      </div>
      <div className="keyboard_enter">
        <Button mode="accept" settings={props.settings} onClick={props.onEnter} disabled={props.disabled}>
          <FiCornerDownLeft /> Enter
        </Button>
      </div>
    </div>
  );
};
