import LetterTile from "./LetterTile";
import { SettingsData } from "../Data/SaveData/SaveData";

interface LogoProps {
  settings: SettingsData;
}

export const Logo = (props: LogoProps) => {
  return (
    <div className="logo" data-automation-id="logo">
      <LetterTile letter={"W"} status={"not set"} settings={props.settings} applyAnimation={false}></LetterTile>
      <LetterTile letter={"I"} status={"contains"} settings={props.settings} applyAnimation={false}></LetterTile>
      <LetterTile letter={"N"} status={"correct"} settings={props.settings} applyAnimation={false}></LetterTile>
      <LetterTile letter={"G"} status={"incorrect"} settings={props.settings} applyAnimation={false}></LetterTile>
      <LetterTile letter={"O"} status={"contains"} settings={props.settings} applyAnimation={false}></LetterTile>
    </div>
  );
};
