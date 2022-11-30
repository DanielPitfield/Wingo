import { SettingsData } from "../Data/SaveData/Settings";
import LetterTile from "./LetterTile";

interface LogoProps {
  settings: SettingsData;
}

export const Logo = (props: LogoProps) => {
  return (
    <div className="logo" data-automation-id="logo">
      <LetterTile letter={"W"} status={"not set"} settings={props.settings} applyAnimation={false} />
      <LetterTile letter={"I"} status={"contains"} settings={props.settings} applyAnimation={false} />
      <LetterTile letter={"N"} status={"correct"} settings={props.settings} applyAnimation={false} />
      <LetterTile letter={"G"} status={"incorrect"} settings={props.settings} applyAnimation={false} />
      <LetterTile letter={"O"} status={"contains"} settings={props.settings} applyAnimation={false} />
    </div>
  );
};
