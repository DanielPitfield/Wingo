import { SettingsData } from "../Data/SaveData/Settings";
import { LettersGameTileStatus } from "../Pages/LettersGameConfig";
import LetterTile from "./LetterTile";

interface Props {
  onClick: (value: string | null, index: number) => void;
  disabled: boolean;

  letterTileStatuses: LettersGameTileStatus[];

  settings: SettingsData;
}

export const LetterSelectionRow = (props: Props) => {
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
