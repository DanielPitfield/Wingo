import { useLocation } from "react-router";
import { MAX_NUM_CATEGORIES } from "../../Data/GamemodeSettingsInputLimits";
import { PagePath } from "../../Data/PageNames";
import { getGamemodeSettingsPresets } from "../../Data/SaveData/Presets";
import { LetterCategoriesConfigProps } from "../../Pages/LetterCategoriesConfig";
import GamemodeSettingsMenu from "../GamemodeSettingsMenu";
import LoadGamemodePresetModal from "../LoadGamemodePresetModal";
import SaveGamemodePresetModal from "../SaveGamemodePresetModal";

interface LetterCategoriesGamemodeSettingsProps {
  gamemodeSettings: LetterCategoriesConfigProps["gamemodeSettings"];

  handleTimerToggle: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSimpleGamemodeSettingsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  resetCountdown: () => void;
  setTotalSeconds: (numSeconds: number) => void;

  onLoadPresetGamemodeSettings: (gamemodeSettings: LetterCategoriesConfigProps["gamemodeSettings"]) => void;
  onShowOfAddPresetModal: () => void;
  onHideOfAddPresetModal: () => void;
}

const LetterCategoriesGamemodeSettings = (props: LetterCategoriesGamemodeSettingsProps) => {
  const location = useLocation().pathname as PagePath;

  return (
    <GamemodeSettingsMenu>
      <>
        <LoadGamemodePresetModal
          getPresets={() => getGamemodeSettingsPresets<LetterCategoriesConfigProps["gamemodeSettings"]>(location)}
          onSelectPreset={(preset) => props.onLoadPresetGamemodeSettings(preset.gamemodeSettings)}
        />

        <label>
          <input
            type="number"
            name="numCategories"
            value={props.gamemodeSettings.numCategories}
            min={2}
            max={MAX_NUM_CATEGORIES}
            onChange={props.handleSimpleGamemodeSettingsChange}
          />
          Number of categories
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
          existingPresets={getGamemodeSettingsPresets<LetterCategoriesConfigProps["gamemodeSettings"]>(location)}
          onHide={props.onHideOfAddPresetModal}
          onShow={props.onShowOfAddPresetModal}
        />
      </>
    </GamemodeSettingsMenu>
  );
};

export default LetterCategoriesGamemodeSettings;
