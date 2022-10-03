import { SameLetterWordsProps } from "../../Pages/SameLetterWords";
import GamemodeSettingsMenu from "../GamemodeSettingsMenu";

interface Props {
  gamemodeSettings: SameLetterWordsProps["gamemodeSettings"];

  handleTimerToggle: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSimpleGamemodeSettingsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  setRemainingGuesses: (newGuesses: number) => void;
  setRemainingSeconds: (newSeconds: number) => void;
  setMostRecentTotalSeconds: (numSeconds: number) => void;
}

export const MIN_NUM_SAME_LETTER_TOTAL_WORDS = 4;
const MAX_NUM_TOTAL_WORDS = 20;

export const MIN_NUM_SAME_LETTER_MATCHING_WORDS = 2;
const MAX_NUM_MATCHING_WORDS = 10;

const MIN_NUM_GUESSES = 1;
const MAX_NUM_GUESSES = 100;

const SameLetterWordsGamemodeSettings = (props: Props) => {
  return (
    <GamemodeSettingsMenu>
      <>
        <label>
          <input
            type="number"
            name="numMatchingWords"
            value={props.gamemodeSettings.numMatchingWords}
            min={MIN_NUM_SAME_LETTER_MATCHING_WORDS}
            max={Math.min(MAX_NUM_MATCHING_WORDS, props.gamemodeSettings.numTotalWords - 1)}
            onChange={props.handleSimpleGamemodeSettingsChange}
          ></input>
          Number of matching words
        </label>

        <label>
          <input
            type="number"
            name="numTotalWords"
            value={props.gamemodeSettings.numTotalWords}
            min={Math.max(MIN_NUM_SAME_LETTER_TOTAL_WORDS, props.gamemodeSettings.numMatchingWords + 1)}
            max={MAX_NUM_TOTAL_WORDS}
            onChange={props.handleSimpleGamemodeSettingsChange}
          ></input>
          Number of total words
        </label>

        <label>
          <input
            type="number"
            name="numGuesses"
            value={props.gamemodeSettings.numGuesses}
            min={MIN_NUM_GUESSES}
            max={MAX_NUM_GUESSES}
            onChange={(e) => {
              props.setRemainingGuesses(e.target.valueAsNumber);
              props.handleSimpleGamemodeSettingsChange(e);
            }}
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
      </>
    </GamemodeSettingsMenu>
  );
};

export default SameLetterWordsGamemodeSettings;