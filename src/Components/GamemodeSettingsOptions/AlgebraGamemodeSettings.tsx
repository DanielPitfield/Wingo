import { difficultyOptions } from "../../Data/DefaultGamemodeSettings";
import { AlgebraProps } from "../../Pages/Algebra";
import GamemodeSettingsMenu from "../GamemodeSettingsMenu";

interface Props {
  gamemodeSettings: AlgebraProps["gamemodeSettings"];

  handleDifficultyChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleTimerToggle: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSimpleGamemodeSettingsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  setRemainingSeconds: (numSeconds: number) => void;
  setMostRecentTotalSeconds: (numSeconds: number) => void;
}

const AlgebraGamemodeSettings = (props: Props) => {
  return (
    <GamemodeSettingsMenu>
      <>
        <label>
          <select
            onChange={props.handleDifficultyChange}
            className="difficulty_input"
            name="difficulty"
            value={props.gamemodeSettings.difficulty}
          >
            {difficultyOptions.map((difficultyOption) => (
              <option key={difficultyOption} value={difficultyOption}>
                {difficultyOption}
              </option>
            ))}
          </select>
          Difficulty
        </label>

        <label>
          <input
            checked={props.gamemodeSettings.timerConfig.isTimed}
            type="checkbox"
            onChange={props.handleTimerToggle}
          ></input>
          Timer
        </label>
        
        {props.gamemodeSettings.timerConfig.isTimed && (
          <label>
            <input
              type="number"
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
    </GamemodeSettingsMenu>
  );
};

export default AlgebraGamemodeSettings;
