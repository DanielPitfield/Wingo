import { AiFillCloseSquare } from "react-icons/ai";
import { pageDescription } from "../Data/PageDescriptions";
import { getGamemodeSettingsPresets } from "../Data/SaveData/Presets";
import { Button } from "./Button";
import { DraggableItem } from "./DraggableItem";

interface Props {
  id: number;
  gameshowMode: pageDescription;
  onClick: (id: number) => void;
}

export const GameshowOrderItem = (props: Props) => {
  const presets = getGamemodeSettingsPresets(props.gameshowMode.path);

  // TODO: onChange and value of preset select
  // TODO: Remove/close button can't be clicked

  return (
    <DraggableItem id={props.id}>
      <div className="gameshow-queued-gamemode-tile">{props.gameshowMode.title}</div>

      <label>
        <select onChange={() => {}} className="gameshow-queued-gamemode-preset-select" name="preset" value={""}>
          {presets.map((preset) => (
            <option key={preset.name} value={preset.name}>
              {preset.name}
            </option>
          ))}
        </select>
        Preset
      </label>

      <Button
        className="gameshow-queued-gamemode-close"
        mode={"default"}
        onClick={() => {
          props.onClick(props.id);
        }}
      >
        <AiFillCloseSquare />
      </Button>
    </DraggableItem>
  );
};
