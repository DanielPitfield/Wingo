import { NumbersGameConfigProps } from "../../Pages/NumbersGameConfig";
import GamemodeSettingsMenu from "../GamemodeSettingsMenu";

interface Props {
  gamemodeSettings: NumbersGameConfigProps["gamemodeSettings"];

  handleTimerToggle: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSimpleGamemodeSettingsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  updateRemainingSeconds: (newSeconds: number) => void;
  setMostRecentTotalSeconds: (numSeconds: number) => void;

  onLoadPresetGamemodeSettings: (gamemodeSettings: NumbersGameConfigProps["gamemodeSettings"]) => void;
  onShowOfAddPresetModal: () => void;
  onHideOfAddPresetModal: () => void;
}

const NumbersGameGamemodeSettings = (props: Props) => {
  return (
    <GamemodeSettingsMenu>
      <>
        <label>
          <input
            type="number"
            name="numOperands"
            value={props.gamemodeSettings.numOperands}
            min={4}
            max={10}
            onChange={props.handleSimpleGamemodeSettingsChange}
          ></input>
          Numbers in selection
        </label>

        <label>
          <input
            checked={props.gamemodeSettings.hasScaryNumbers}
            type="checkbox"
            name="hasScaryNumbers"
            onChange={props.handleSimpleGamemodeSettingsChange}
          ></input>
          Scary Big Numbers
        </label>

        <>
          <label>
            <input
              checked={props.gamemodeSettings.timerConfig.isTimed}
              type="checkbox"
              name="timerConfig"
              onChange={props.handleTimerToggle}
            ></input>
            Timer
          </label>

          {props.gamemodeSettings.timerConfig.isTimed && (
            <label>
              <input
                type="number"
                name="timerConfig"
                value={props.gamemodeSettings.timerConfig.seconds}
                min={10}
                max={120}
                step={5}
                onChange={(e) => {
                  props.updateRemainingSeconds(e.target.valueAsNumber);
                  props.setMostRecentTotalSeconds(e.target.valueAsNumber);
                  props.handleSimpleGamemodeSettingsChange(e);
                }}
              ></input>
              Seconds
            </label>
          )}
        </>
      </>
    </GamemodeSettingsMenu>
  );
};

export default NumbersGameGamemodeSettings;
