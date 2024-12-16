import { useLocation } from "react-router";
import { PagePath } from "../../Data/PageNames";
import { getGamemodeSettingsPresets } from "../../Data/SaveData/Presets";
import { NumbersGameConfigProps } from "../../Pages/NumbersGameConfig";
import GamemodeSettingsMenu from "../GamemodeSettingsMenu";
import LoadGamemodePresetModal from "../LoadGamemodePresetModal";
import SaveGamemodePresetModal from "../SaveGamemodePresetModal";

interface NumbersGameGamemodeSettingsProps {
  gamemodeSettings: NumbersGameConfigProps["gamemodeSettings"];

  handleTimerToggle: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSimpleGamemodeSettingsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  resetCountdown: () => void;
  setTotalSeconds: (numSeconds: number) => void;

  onLoadPresetGamemodeSettings: (gamemodeSettings: NumbersGameConfigProps["gamemodeSettings"]) => void;
  onShowOfAddPresetModal: () => void;
  onHideOfAddPresetModal: () => void;
}

const NumbersGameGamemodeSettings = (props: NumbersGameGamemodeSettingsProps) => {
  const location = useLocation().pathname as PagePath;

  return (
    <GamemodeSettingsMenu>
      <>
        <LoadGamemodePresetModal
          getPresets={() => getGamemodeSettingsPresets<NumbersGameConfigProps["gamemodeSettings"]>(location)}
          onSelectPreset={(preset) => props.onLoadPresetGamemodeSettings(preset.gamemodeSettings)}
        />

        <label>
          <input
            type="number"
            name="numOperands"
            value={props.gamemodeSettings.numOperands}
            min={4}
            max={10}
            onChange={props.handleSimpleGamemodeSettingsChange}
          />
          Numbers in selection
        </label>

        <label>
          <input
            checked={props.gamemodeSettings.hasScaryNumbers}
            type="checkbox"
            name="hasScaryNumbers"
            onChange={props.handleSimpleGamemodeSettingsChange}
          />
          Scary Big Numbers
        </label>

        <>
          <label>
            <input
              checked={props.gamemodeSettings.timerConfig.isTimed}
              type="checkbox"
              name="timerConfig"
              onChange={props.handleTimerToggle}
            />
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
                  props.resetCountdown();
                  props.setTotalSeconds(e.target.valueAsNumber);
                  props.handleSimpleGamemodeSettingsChange(e);
                }}
              />
              Seconds
            </label>
          )}
        </>

        <SaveGamemodePresetModal
          currentGamemodeSettings={props.gamemodeSettings}
          existingPresets={getGamemodeSettingsPresets<NumbersGameConfigProps["gamemodeSettings"]>(location)}
          onHide={props.onHideOfAddPresetModal}
          onShow={props.onShowOfAddPresetModal}
        />
      </>
    </GamemodeSettingsMenu>
  );
};

export default NumbersGameGamemodeSettings;
