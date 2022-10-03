import { MAX_TARGET_WORD_LENGTH, MIN_TARGET_WORD_LENGTH } from "../../Data/GamemodeSettingsInputLimits";
import { WingoInterlinkedProps } from "../../Pages/WingoInterlinked";
import GamemodeSettingsMenu from "../GamemodeSettingsMenu";

interface Props {
  gamemodeSettings: WingoInterlinkedProps["gamemodeSettings"];
  provideWords: boolean;

  handleFitRestrictionToggle: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleTimerToggle: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSimpleGamemodeSettingsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  setMostRecentFitRestriction: (newFitRestrcition: number) => void;
  setRemainingSeconds: (newSeconds: number) => void;
  setMostRecentTotalSeconds: (numSeconds: number) => void;
}

const WingoInterlinkedGamemodeSettings = (props: Props) => {
  // Started with more than 2 words (so not basic WingoInterlinked of two interlinked words but a fully fledged crossword)
  const IS_CROSSWORD = props.gamemodeSettings.numWords > 2;

  return (
    <GamemodeSettingsMenu>
      <>
        {IS_CROSSWORD && (
          <label>
            <input
              type="number"
              name="numWords"
              value={props.gamemodeSettings.numWords}
              min={2}
              max={10}
              onChange={props.handleSimpleGamemodeSettingsChange}
            ></input>
            Number of words
          </label>
        )}

        <label>
          <input
            type="number"
            name="minWordLength"
            value={props.gamemodeSettings.minWordLength}
            min={MIN_TARGET_WORD_LENGTH}
            // Can't go above maximum word length
            // TODO: Should all words be the same length for crossword fit mode?
            max={Math.min(props.gamemodeSettings.maxWordLength, MAX_TARGET_WORD_LENGTH)}
            onChange={props.handleSimpleGamemodeSettingsChange}
          ></input>
          Minimum Word Length
        </label>

        <label>
          <input
            type="number"
            name="maxWordLength"
            value={props.gamemodeSettings.maxWordLength}
            // Can't go below the minimum word length
            min={Math.max(props.gamemodeSettings.minWordLength, MIN_TARGET_WORD_LENGTH)}
            max={MAX_TARGET_WORD_LENGTH}
            onChange={props.handleSimpleGamemodeSettingsChange}
          ></input>
          Maximum Word Length
        </label>

        {!props.provideWords && (
          <>
            <label>
              <input
                checked={props.gamemodeSettings.fitRestrictionConfig.isRestricted}
                type="checkbox"
                name="fitRestrictionConfig"
                onChange={props.handleFitRestrictionToggle}
              ></input>
              Fit Restriction
            </label>

            {props.gamemodeSettings.fitRestrictionConfig.isRestricted && (
              <label>
                <input
                  type="number"
                  name="fitRestrictionConfig"
                  value={props.gamemodeSettings.fitRestrictionConfig.fitRestriction}
                  min={0}
                  max={50}
                  onChange={(e) => {
                    props.setMostRecentFitRestriction(e.target.valueAsNumber);
                    props.handleSimpleGamemodeSettingsChange(e);
                  }}
                ></input>
                Fit Restriction Amount
              </label>
            )}
          </>
        )}

        <label>
          <input
            checked={props.gamemodeSettings.isFirstLetterProvided}
            type="checkbox"
            name="isFirstLetterProvided"
            onChange={props.handleSimpleGamemodeSettingsChange}
          ></input>
          First Letter Provided
        </label>

        <label>
          <input
            checked={props.gamemodeSettings.isHintShown}
            type="checkbox"
            name="isHintShown"
            onChange={props.handleSimpleGamemodeSettingsChange}
          ></input>
          Hints
        </label>

        <label>
          <input
            type="number"
            name="numWordGuesses"
            value={props.gamemodeSettings.numWordGuesses}
            min={0}
            max={100}
            onChange={props.handleSimpleGamemodeSettingsChange}
          ></input>
          Number of word guesses
        </label>

        <label>
          <input
            type="number"
            name="numGridGuesses"
            value={props.gamemodeSettings.numGridGuesses}
            min={0}
            max={20}
            onChange={props.handleSimpleGamemodeSettingsChange}
          ></input>
          Number of grid guesses
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

export default WingoInterlinkedGamemodeSettings;