import { difficultyOptions } from "../../Data/DefaultGamemodeSettings";
import { AlgebraProps } from "../../Pages/Algebra";

interface Props {
  gamemodeSettings: AlgebraProps["gamemodeSettings"];
  handleGamemodeSettingsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setRemainingSeconds: (numSeconds: number) => void;
  setMostRecentTotalSeconds: (numSeconds: number) => void;
}

const AlgebraGamemodeSettingsOptions = (props: Props) => {
  return (
    <>
      <label>
        <select
          onChange={props.handleGamemodeSettingsChange}
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
          onChange={props.handleGamemodeSettingsChange}
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
              props.handleGamemodeSettingsChange(e);
            }}
          ></input>
          Seconds
        </label>
      )}
    </>
  );
};

export default AlgebraGamemodeSettingsOptions;
