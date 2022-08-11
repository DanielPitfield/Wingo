import React from "react";
import LetterTile from "./Components/LetterTile";
import { SettingsData } from "./Data/SaveData";

interface Props {
  onClick: (value: string | null) => void;
  disabled: boolean;

  letterTileStatuses: {
    letter: string | null;
    picked: boolean;
  }[];

  settings: SettingsData;
}

export const LetterSelectionRow: React.FC<Props> = (props) => {
  function CreateRow() {
    let tileArray = [];

    // TODO: Disabled CSS

    for (let i = 0; i < props.letterTileStatuses.length; i++) {
      tileArray.push(
        <LetterTile
          key={`${props.letterTileStatuses[i].letter} - ${i}`}
          letter={props.letterTileStatuses[i].letter ?? ""}
          status={"not set"}
          settings={props.settings}
          disabled={props.disabled || props.letterTileStatuses[i].picked}
          onClick={() => props.onClick(props.letterTileStatuses[i].letter)}
        />
      );
    }

    return tileArray;
  }

  return (
    <div className="letter_row">
      <>{CreateRow()}</>
    </div>
  );
};
