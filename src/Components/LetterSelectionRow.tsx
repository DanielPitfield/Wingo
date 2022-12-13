import { SettingsData } from "../Data/SaveData/Settings";
import { LettersGameTileStatus } from "../Pages/LettersGameConfig";
import LetterTile from "./LetterTile";

interface LetterSelectionRowProps {
  onClick: (value: string | null, index: number) => void;
  disabled: boolean;
  letterTileStatuses: LettersGameTileStatus[];
  settings: SettingsData;
}

const LetterSelectionRow = (props: LetterSelectionRowProps) => {
  return (
    <div className="letter_row">
      {props.letterTileStatuses.map((letterTileStatus, index) => {
        return (
          <LetterTile
            key={`${letterTileStatus.letter} - ${index}`}
            letter={letterTileStatus.letter ?? ""}
            status={"not set"}
            settings={props.settings}
            disabled={props.disabled || letterTileStatus.picked}
            onClick={() => props.onClick(letterTileStatus.letter, index)}
          />
        );
      })}
    </div>
  );
};

export default LetterSelectionRow;
