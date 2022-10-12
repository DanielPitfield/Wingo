import { MAX_NUM_CATEGORIES } from "../../Data/GamemodeSettingsInputLimits";
import { LetterCategoriesConfigProps } from "../../Pages/LetterCategoriesConfig";
import GamemodeSettingsMenu from "../GamemodeSettingsMenu";

interface Props {
  gamemodeSettings: LetterCategoriesConfigProps["gamemodeSettings"];

  handleTimerToggle: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSimpleGamemodeSettingsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  updateRemainingSeconds: (newSeconds: number) => void;
  setMostRecentTotalSeconds: (numSeconds: number) => void;

  onLoadPresetGamemodeSettings: (gamemodeSettings: LetterCategoriesConfigProps["gamemodeSettings"]) => void;
  onShowOfAddPresetModal: () => void;
  onHideOfAddPresetModal: () => void;
}

const LetterCategoriesGamemodeSettings = (props: Props) => {
  return (
    <GamemodeSettingsMenu>
      <>
        <label>
          <input
            type="number"
            name="numCategories"
            value={props.gamemodeSettings.numCategories}
            min={2}
            max={MAX_NUM_CATEGORIES}
            onChange={props.handleSimpleGamemodeSettingsChange}
          ></input>
          Number of categories
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

export default LetterCategoriesGamemodeSettings;
