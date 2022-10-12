import { useLocation } from "react-router-dom";
import { PagePath } from "../../Data/PageNames";
import { getGamemodeSettingsPresets } from "../../Data/SaveData/Presets";
import { NumbleConfigProps, numbleGridShapes, numbleGridSizes } from "../../Pages/NumbleConfig";
import GamemodeSettingsMenu from "../GamemodeSettingsMenu";
import SaveGamemodePresetModal from "../SaveGamemodePresetModal";

interface Props {
  gamemodeSettings: NumbleConfigProps["gamemodeSettings"];

  handleGridShapeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleGridSizeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleTeamTimersChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleGuessTimerChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePointsLostChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  handleGuessTimerToggle: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleGuessTimerBehaviourToggle: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleTimerToggle: (e: React.ChangeEvent<HTMLInputElement>) => void;

  handleSimpleGamemodeSettingsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  setMostRecentTotalSeconds: (numSeconds: number) => void;

  updateRemainingGuessTimerSeconds: (newSeconds: number) => void;
  setMostRecentGuessTimerTotalSeconds: (newSeconds: number) => void;

  onLoadPresetGamemodeSettings: (gamemodeSettings: NumbleConfigProps["gamemodeSettings"]) => void;
  onShowOfAddPresetModal: () => void;
  onHideOfAddPresetModal: () => void;
}

export const MAX_NUM_NUMBLE_TEAMS = 4;

const NumbleGamemodeSettings = (props: Props) => {
  const location = useLocation().pathname as PagePath;
  
  return (
    <GamemodeSettingsMenu>
      <>
        <label>
          <input
            type="number"
            name="numDice"
            value={props.gamemodeSettings.numDice}
            min={2}
            max={6}
            onChange={props.handleSimpleGamemodeSettingsChange}
          ></input>
          Number of dice
        </label>

        <label>
          <input
            type="number"
            name="diceMin"
            value={props.gamemodeSettings.diceMin}
            min={1}
            max={props.gamemodeSettings.diceMax}
            onChange={props.handleSimpleGamemodeSettingsChange}
          ></input>
          Minimum dice value
        </label>

        <label>
          <input
            type="number"
            name="diceMax"
            value={props.gamemodeSettings.diceMax}
            min={props.gamemodeSettings.diceMin}
            max={100}
            onChange={props.handleSimpleGamemodeSettingsChange}
          ></input>
          Maximum dice value
        </label>

        <label>
          <select
            onChange={props.handleGridShapeChange}
            className="numbleGridShape_input"
            name="gridShape"
            value={props.gamemodeSettings.gridShape}
          >
            {numbleGridShapes.map((numbleGridShape) => (
              <option key={numbleGridShape} value={numbleGridShape}>
                {numbleGridShape}
              </option>
            ))}
          </select>
          Grid Shape
        </label>

        <label>
          <select
            onChange={props.handleGridSizeChange}
            className="numbleGridSize_input"
            name="gidSize"
            value={props.gamemodeSettings.gridSize}
          >
            {numbleGridSizes.map((numbleGridSize) => (
              <option key={numbleGridSize} value={numbleGridSize}>
                {numbleGridSize}
              </option>
            ))}
          </select>
          Grid Size
        </label>

        <label>
          <input
            type="number"
            name="numTeams"
            value={props.gamemodeSettings.numTeams}
            min={1}
            max={MAX_NUM_NUMBLE_TEAMS}
            onChange={props.handleSimpleGamemodeSettingsChange}
          ></input>
          Number of teams
        </label>

        <label>
          <input
            checked={props.gamemodeSettings.isGameOverOnIncorrectPick}
            type="checkbox"
            name="isGameOverOnIncorrectPick"
            onChange={props.handleSimpleGamemodeSettingsChange}
          ></input>
          Incorrect pick ends game
        </label>

        <>
          <label>
            <input
              checked={props.gamemodeSettings.guessTimerConfig.isTimed}
              type="checkbox"
              name="guessTimerConfig"
              onChange={props.handleGuessTimerToggle}
            ></input>
            Guess Timer
          </label>

          {props.gamemodeSettings.guessTimerConfig.isTimed && (
            <>
              <label>
                <input
                  type="number"
                  name="guessTimerConfig"
                  value={props.gamemodeSettings.guessTimerConfig.seconds}
                  min={5}
                  max={120}
                  step={5}
                  onChange={(e) => {
                    props.updateRemainingGuessTimerSeconds(e.target.valueAsNumber);
                    props.setMostRecentGuessTimerTotalSeconds(e.target.valueAsNumber);
                    props.handleGuessTimerChange(e);
                  }}
                ></input>
                Seconds
              </label>

              <label>
                <input
                  checked={props.gamemodeSettings.guessTimerConfig.timerBehaviour.isGameOverWhenNoTimeLeft}
                  type="checkbox"
                  name="guessTimerConfig"
                  onChange={props.handleGuessTimerBehaviourToggle}
                ></input>
                Guess timer ends game
              </label>

              {!props.gamemodeSettings.guessTimerConfig.timerBehaviour.isGameOverWhenNoTimeLeft && (
                <label>
                  <input
                    type="number"
                    name="guessTimerConfig"
                    value={props.gamemodeSettings.guessTimerConfig.timerBehaviour.pointsLost}
                    min={0}
                    max={100}
                    step={5}
                    onChange={props.handlePointsLostChange}
                  ></input>
                  Points lost
                </label>
              )}
            </>
          )}
        </>

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
                min={30}
                max={1200}
                step={10}
                onChange={(e) => {
                  props.handleTeamTimersChange(e);
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
          existingPresets={getGamemodeSettingsPresets<NumbleConfigProps["gamemodeSettings"]>(location)}
          onHide={props.onHideOfAddPresetModal}
          onShow={props.onShowOfAddPresetModal}
        ></SaveGamemodePresetModal>
      </>
    </GamemodeSettingsMenu>
  );
};

export default NumbleGamemodeSettings;
