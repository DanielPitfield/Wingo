import { wordCodesMode, WordCodesProps } from "../../Pages/WordCodes";
import GamemodeSettingsMenu from "../GamemodeSettingsMenu";

interface Props {
  mode: wordCodesMode;
  gamemodeSettings: WordCodesProps["gamemodeSettings"];

  handleTimerToggle: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSimpleGamemodeSettingsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  setRemainingGuesses: (newGuesses: number) => void;
  setRemainingSeconds: (newSeconds: number) => void;
  setMostRecentTotalSeconds: (numSeconds: number) => void;
}

const WordCodesGamemodeSettings = (props: Props) => {
  const MIN_NUM_DISPLAY_WORDS = Math.max(2, props.gamemodeSettings.numDisplayCodes + 1);
  const MAX_NUM_DISPLAY_WORDS = 10;
  const MIN_NUMBER_DISPLAY_CODES = 2;
  const MAX_NUM_DISPLAY_CODES = props.gamemodeSettings.numDisplayWords - 1;

  return (
    <GamemodeSettingsMenu>
      <>
        {props.mode !== "match" && (
          <>
            <label>
              <input
                type="number"
                name="numDisplayWords"
                value={props.gamemodeSettings.numDisplayWords}
                min={MIN_NUM_DISPLAY_WORDS}
                max={MAX_NUM_DISPLAY_WORDS}
                onChange={props.handleSimpleGamemodeSettingsChange}
              ></input>
              Number of display words
            </label>

            <label>
              <input
                type="number"
                name="numDisplayCodes"
                value={props.gamemodeSettings.numDisplayCodes}
                min={MIN_NUMBER_DISPLAY_CODES}
                max={MAX_NUM_DISPLAY_CODES}
                onChange={props.handleSimpleGamemodeSettingsChange}
              ></input>
              Number of display codes
            </label>

            <label>
              <input
                type="number"
                name="numWordToCodeQuestions"
                value={props.gamemodeSettings.numWordToCodeQuestions}
                min={1}
                max={10}
                onChange={props.handleSimpleGamemodeSettingsChange}
              ></input>
              Number of word to code questions
            </label>

            <label>
              <input
                type="number"
                name="numCodeToWordQuestions"
                value={props.gamemodeSettings.numCodeToWordQuestions}
                min={1}
                max={10}
                onChange={props.handleSimpleGamemodeSettingsChange}
              ></input>
              Number of code to word questions
            </label>
          </>
        )}

        <label>
          <input
            type="number"
            name="codeLength"
            value={props.gamemodeSettings.codeLength}
            min={2}
            max={10}
            onChange={props.handleSimpleGamemodeSettingsChange}
          ></input>
          Code Length
        </label>

        <label>
          <input
            type="number"
            name="numCodesToMatch"
            value={props.gamemodeSettings.numCodesToMatch}
            min={1}
            max={10}
            onChange={props.handleSimpleGamemodeSettingsChange}
          ></input>
          Number of codes
        </label>

        <label>
          <input
            type="number"
            name="numAdditionalLetters"
            value={props.gamemodeSettings.numAdditionalLetters}
            min={1}
            max={10}
            onChange={props.handleSimpleGamemodeSettingsChange}
          ></input>
          Number of additional letters
        </label>

        <label>
          <input
            type="number"
            name="numGuesses"
            value={props.gamemodeSettings.numGuesses}
            min={1}
            max={10}
            onChange={(e) => {
              props.setRemainingGuesses(e.target.valueAsNumber);
              props.handleSimpleGamemodeSettingsChange(e);
            }}
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

export default WordCodesGamemodeSettings;