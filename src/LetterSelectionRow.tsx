import React from "react";
import LetterTile from "./Components/LetterTile";
import { SettingsData } from "./Data/SaveData";

interface Props {
  onClick: (value: string | null, index: number) => void;
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

    for (const [index, letterTileStatus] of props.letterTileStatuses.entries()) {
      tileArray.push(
        <LetterTile
          key={`${letterTileStatus.letter} - ${index}`}
          letter={letterTileStatus.letter ?? ""}
          status={"not set"}
          settings={props.settings}
          disabled={props.disabled || letterTileStatus.picked}
          onClick={() => props.onClick(letterTileStatus.letter, index)}
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
