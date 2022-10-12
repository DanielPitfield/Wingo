import { useLocation } from "react-router-dom";
import { PagePath } from "../../Data/PageNames";
import { getGamemodeSettingsPresets } from "../../Data/SaveData/Presets";
import { ArithmeticDragProps, arithmeticNumberSizes } from "../../Pages/ArithmeticDrag";
import GamemodeSettingsMenu from "../GamemodeSettingsMenu";
import SaveGamemodePresetModal from "../SaveGamemodePresetModal";

interface Props {
  gamemodeSettings: ArithmeticDragProps["gamemodeSettings"];

  handleNumberSizeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleTimerToggle: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSimpleGamemodeSettingsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  setRemainingSeconds: (numSeconds: number) => void;
  setMostRecentTotalSeconds: (numSeconds: number) => void;

  onLoadPresetGamemodeSettings: (gamemodeSettings: ArithmeticDragProps["gamemodeSettings"]) => void;
  onShowOfAddPresetModal: () => void;
  onHideOfAddPresetModal: () => void;
}

const MIN_NUM_TILES = 2;
const MAX_NUM_TILES = 10;

const MIN_NUM_OPERANDS = 2;
const MAX_NUM_OPERANDS = 3;

const ArithmeticDragGamemodeSettings = (props: Props) => {
  const location = useLocation().pathname as PagePath;

  return (
    <GamemodeSettingsMenu>
      <>
        <label>
          <input
            type="number"
            name="numTiles"
            value={props.gamemodeSettings.numTiles}
            min={MIN_NUM_TILES}
            max={MAX_NUM_TILES}
            onChange={props.handleSimpleGamemodeSettingsChange}
          ></input>
          Number of expressions
        </label>

        <label>
          <input
            type="number"
            name="numOperands"
            value={props.gamemodeSettings.numOperands}
            min={MIN_NUM_OPERANDS}
            max={MAX_NUM_OPERANDS}
            onChange={props.handleSimpleGamemodeSettingsChange}
          ></input>
          Number of operands
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
            name="numGuesses"
            value={props.gamemodeSettings.numGuesses}
            min={1}
            max={10}
            onChange={props.handleSimpleGamemodeSettingsChange}
          ></input>
          Number of guesses
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
                  props.setRemainingSeconds(e.target.valueAsNumber);
                  props.setMostRecentTotalSeconds(e.target.valueAsNumber);
                  props.handleSimpleGamemodeSettingsChange(e);
                }}
              ></input>
              Seconds
            </label>
          )}
        </>

        <SaveGamemodePresetModal
          currentGamemodeSettings={props.gamemodeSettings}
          existingPresets={getGamemodeSettingsPresets<ArithmeticDragProps["gamemodeSettings"]>(location)}
          onHide={props.onHideOfAddPresetModal}
          onShow={props.onShowOfAddPresetModal}
        ></SaveGamemodePresetModal>
      </>
    </GamemodeSettingsMenu>
  );
};

export default ArithmeticDragGamemodeSettings;
