import {
  MAX_NUM_CATEGORIES,
  MAX_TARGET_WORD_LENGTH,
  MIN_TARGET_WORD_LENGTH,
} from "../../Data/GamemodeSettingsInputLimits";
import { LettersGameConfigProps } from "../../Pages/LettersGameConfig";
import GamemodeSettingsMenu from "../GamemodeSettingsMenu";

interface Props {
  gamemodeSettings: LettersGameConfigProps["gamemodeSettings"];

  handleTimerToggle: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSimpleGamemodeSettingsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  updateRemainingSeconds: (newSeconds: number) => void;
  setMostRecentTotalSeconds: (numSeconds: number) => void;
}

const LettersGameGamemodeSettings = (props: Props) => {
  return (
    <GamemodeSettingsMenu>
      <>
        <label>
          <input
            type="number"
            name="numLetters"
            value={props.gamemodeSettings.numLetters}
            min={MIN_TARGET_WORD_LENGTH}
            max={MAX_TARGET_WORD_LENGTH}
            onChange={props.handleSimpleGamemodeSettingsChange}
          ></input>
          Number of Letters
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

export default LettersGameGamemodeSettings;
