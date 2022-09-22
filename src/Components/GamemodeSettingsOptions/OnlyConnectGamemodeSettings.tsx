import { OnlyConnectProps } from "../../Pages/OnlyConnect";
import GamemodeSettingsMenu from "../GamemodeSettingsMenu";

interface Props {
  gamemodeSettings: OnlyConnectProps["gamemodeSettings"];

  handleTimerToggle: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSimpleGamemodeSettingsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  setRemainingSeconds: (newSeconds: number) => void;
  setMostRecentTotalSeconds: (numSeconds: number) => void;
}

const MIN_NUM_GROUPS = 2;
const MAX_NUM_GROUPS = 10;

const MIN_GROUP_SIZE = 2;
const MAX_GROUP_SIZE = 10;

const OnlyConnectGamemodeSettings = (props: Props) => {
  return (
    <GamemodeSettingsMenu>
      <>
        <label>
          <input
            type="number"
            name="numGroups"
            value={props.gamemodeSettings.numGroups}
            min={MIN_NUM_GROUPS}
            max={MAX_NUM_GROUPS}
            onChange={props.handleSimpleGamemodeSettingsChange}
          ></input>
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
          ></input>
          Group size
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
    </GamemodeSettingsMenu>
  );
};

export default OnlyConnectGamemodeSettings;
