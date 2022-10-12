import { arithmeticNumberSizes } from "../../Pages/ArithmeticDrag";
import { ArithmeticRevealProps } from "../../Pages/ArithmeticReveal";
import GamemodeSettingsMenu from "../GamemodeSettingsMenu";

interface Props {
  gamemodeSettings: ArithmeticRevealProps["gamemodeSettings"];

  handleNumberSizeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleTimerToggle: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSimpleGamemodeSettingsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  setRemainingSeconds: (numSeconds: number) => void;
  setMostRecentTotalSeconds: (numSeconds: number) => void;

  onLoadPresetGamemodeSettings: (gamemodeSettings: ArithmeticRevealProps["gamemodeSettings"]) => void;
  onShowOfAddPresetModal: () => void;
  onHideOfAddPresetModal: () => void;
}

const ArithmeticRevealGamemodeSettings = (props: Props) => {
  const MIN_NUM_TILES = 2;
  const MAX_NUM_TILES = 10;

  const MIN_NUM_CHECKPOINTS = 1;
  const MAX_NUM_CHECKPOINTS = 10;

  const MIN_REVEAL_INTERVAL = 1;
  const MAX_REVEAL_INTERVAL = 5;

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
          ></input>
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
          ></input>
          Reveal interval
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
      </>
    </GamemodeSettingsMenu>
  );
};

export default ArithmeticRevealGamemodeSettings;
