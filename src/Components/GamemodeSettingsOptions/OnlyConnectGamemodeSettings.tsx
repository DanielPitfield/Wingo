import { useLocation } from "react-router-dom";
import { PagePath } from "../../Data/PageNames";
import { getGamemodeSettingsPresets } from "../../Data/SaveData/Presets";
import { OnlyConnectProps } from "../../Pages/OnlyConnect";
import GamemodeSettingsMenu from "../GamemodeSettingsMenu";
import LoadGamemodePresetModal from "../LoadGamemodePresetModal";
import SaveGamemodePresetModal from "../SaveGamemodePresetModal";

interface Props {
  gamemodeSettings: OnlyConnectProps["gamemodeSettings"];

  handleTimerToggle: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSimpleGamemodeSettingsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  resetCountdown: () => void;
  setTotalSeconds: (numSeconds: number) => void;

  onLoadPresetGamemodeSettings: (gamemodeSettings: OnlyConnectProps["gamemodeSettings"]) => void;
  onShowOfAddPresetModal: () => void;
  onHideOfAddPresetModal: () => void;
}

const MIN_NUM_GROUPS = 2;
const MAX_NUM_GROUPS = 10;

const MIN_GROUP_SIZE = 2;
const MAX_GROUP_SIZE = 10;

const OnlyConnectGamemodeSettings = (props: Props) => {
  const location = useLocation().pathname as PagePath;

  return (
    <GamemodeSettingsMenu>
      <>
        <LoadGamemodePresetModal
          getPresets={() => getGamemodeSettingsPresets<OnlyConnectProps["gamemodeSettings"]>(location)}
          onSelectPreset={(preset) => props.onLoadPresetGamemodeSettings(preset.gamemodeSettings)}
        />

        <label>
          <input
            type="number"
            name="numGroups"
            value={props.gamemodeSettings.numGroups}
            min={MIN_NUM_GROUPS}
            max={MAX_NUM_GROUPS}
            onChange={props.handleSimpleGamemodeSettingsChange}
          />
          Number of groups
        </label>

        <label>
          <input
            type="number"
            name="groupSize"
            value={props.gamemodeSettings.groupSize}
            min={MIN_GROUP_SIZE}
            max={MAX_GROUP_SIZE}
            onChange={props.handleSimpleGamemodeSettingsChange}
          />
          Group size
        </label>

        <label>
          <input
            type="number"
            name="startingNumGuesses"
            value={props.gamemodeSettings.startingNumGuesses}
            min={1}
            max={10}
            onChange={props.handleSimpleGamemodeSettingsChange}
          />
          Number of guesses
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
          existingPresets={getGamemodeSettingsPresets<OnlyConnectProps["gamemodeSettings"]>(location)}
          onHide={props.onHideOfAddPresetModal}
          onShow={props.onShowOfAddPresetModal}
        />
      </>
    </GamemodeSettingsMenu>
  );
};

export default OnlyConnectGamemodeSettings;
