import React from "react";
import { Button } from "./Button";
import { useClickChime } from "../Data/Sounds";
import { FiChevronLeft, FiCornerDownLeft } from "react-icons/fi";
import { SettingsData } from "../Data/SaveData/Settings";

interface Props {
  settings: SettingsData;
  onSubmitNumber: (number: number) => void;
  onEnter: () => void;
  onBackspace: () => void;
  disabled: boolean;
  hasBackspace: boolean;
  hasEnter: boolean;
}

export const NumPad = (props: Props) => {
  // The numbers 0 through 9
  const Numbers = Array.from({ length: 10 }, (_, i) => i);

  const [playClickSoundEffect] = useClickChime(props.settings);

  React.useEffect(() => {
    if (props.disabled) {
      return;
    }

    if (!props.settings.gameplay.showKeyboardUi) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const inputKey = event.key.toString().toLowerCase();

      // Enter
      if (inputKey === "enter") {
        props.onEnter();
        return;
      }

      // Backsapce
      if (inputKey === "backspace") {
        props.onBackspace();
        playClickSoundEffect();
        return;
      }

      const keyAsInt = parseInt(inputKey);

      // Any number on the keyboard
      if (Numbers.includes(keyAsInt)) {
        props.onSubmitNumber(keyAsInt);
        playClickSoundEffect();
        return;
      }

      // Otherwise ignore
      return;
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [props.onEnter, props.onBackspace, props.onSubmitNumber]);

  function populateNumpad(numbers: number[]) {
    return numbers.map((number) => (
      <Button
        key={number}
        className="numPad_button"
        mode="default"
        settings={props.settings}
        onClick={() => props.onSubmitNumber(number)}
        disabled={props.disabled}
      >
        {number}
      </Button>
    ));
  }

  if (!props.settings.gameplay.showKeyboardUi) {
    return null;
  }

  return (
    <div className="numPad_wrapper">
      <div className="numPad_row">{populateNumpad([7, 8, 9])}</div>
      <div className="numPad_row">{populateNumpad([4, 5, 6])}</div>
      <div className="numPad_row">{populateNumpad([1, 2, 3])}</div>

      <div className="numPad_row">
        {populateNumpad([0])}

        {props.hasBackspace && (
          <Button mode="destructive" settings={props.settings} onClick={props.onBackspace} disabled={props.disabled}>
            <FiChevronLeft />
          </Button>
        )}
      </div>

      {props.hasEnter && (
        <Button mode="accept" settings={props.settings} onClick={props.onEnter} disabled={props.disabled}>
          <FiCornerDownLeft /> Enter
        </Button>
      )}
    </div>
  );
};
