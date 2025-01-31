import { useLocation } from "react-router";
import { PagePath } from "../../Data/PageNames";
import { getGamemodeSettingsPresets } from "../../Data/SaveData/Presets";
import { arithmeticNumberSizes } from "../../Pages/ArithmeticDrag";
import { ArithmeticRevealProps } from "../../Pages/ArithmeticReveal";
import GamemodeSettingsMenu from "../GamemodeSettingsMenu";
import LoadGamemodePresetModal from "../LoadGamemodePresetModal";
import SaveGamemodePresetModal from "../SaveGamemodePresetModal";

interface ArithmeticRevealGamemodeSettingsProps {
  gamemodeSettings: ArithmeticRevealProps["gamemodeSettings"];

  handleNumberSizeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleTimerToggle: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSimpleGamemodeSettingsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  resetCountdown: () => void;
  setTotalSeconds: (numSeconds: number) => void;

  onLoadPresetGamemodeSettings: (gamemodeSettings: ArithmeticRevealProps["gamemodeSettings"]) => void;
  onShowOfAddPresetModal: () => void;
  onHideOfAddPresetModal: () => void;
}

const MIN_NUM_TILES = 2;
const MAX_NUM_TILES = 10;

const MIN_NUM_CHECKPOINTS = 1;
const MAX_NUM_CHECKPOINTS = 10;

const MIN_REVEAL_INTERVAL = 1;
const MAX_REVEAL_INTERVAL = 5;

const ArithmeticRevealGamemodeSettings = (props: ArithmeticRevealGamemodeSettingsProps) => {
  const location = useLocation().pathname as PagePath;

  return (
    <GamemodeSettingsMenu>
      <>
        <LoadGamemodePresetModal
          getPresets={() => getGamemodeSettingsPresets<ArithmeticRevealProps["gamemodeSettings"]>(location)}
          onSelectPreset={(preset) => props.onLoadPresetGamemodeSettings(preset.gamemodeSettings)}
        />

        <label>
          <input
            type="number"
            name="numTiles"
            value={props.gamemodeSettings.numTiles}
            min={MIN_NUM_TILES}
            max={MAX_NUM_TILES}
            onChange={props.handleSimpleGamemodeSettingsChange}
          />
          Number of tiles
        </label>

        <label>
          <input
            type="number"
            name="numCheckpoints"
            value={props.gamemodeSettings.numCheckpoints}
            min={MIN_NUM_CHECKPOINTS}
            max={MAX_NUM_CHECKPOINTS}
            onChange={props.handleSimpleGamemodeSettingsChange}
          />
          Number of checkpoints
        </label>

        <label>
          <select
            onChange={props.handleNumberSizeChange}
            className="numberSize_input"
            name="numberSize"
            value={props.gamemodeSettings.numberSize}
          >
            {arithmeticNumberSizes.map((sizeOption) => (
              <option key={sizeOption} value={sizeOption}>
                {sizeOption}
              </option>
            ))}
          </select>
          Number size
        </label>

        <label>
          <input
            type="number"
            name="revealIntervalSeconds"
            value={props.gamemodeSettings.revealIntervalSeconds}
            min={MIN_REVEAL_INTERVAL}
            max={MAX_REVEAL_INTERVAL}
            onChange={props.handleSimpleGamemodeSettingsChange}
          />
          Reveal interval
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
          existingPresets={getGamemodeSettingsPresets<ArithmeticRevealProps["gamemodeSettings"]>(location)}
          onHide={props.onHideOfAddPresetModal}
          onShow={props.onShowOfAddPresetModal}
        />
      </>
    </GamemodeSettingsMenu>
  );
};

export default ArithmeticRevealGamemodeSettings;
