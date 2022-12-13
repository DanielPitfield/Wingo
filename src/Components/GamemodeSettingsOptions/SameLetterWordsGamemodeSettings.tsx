import { useLocation } from "react-router-dom";
import { PagePath } from "../../Data/PageNames";
import { getGamemodeSettingsPresets } from "../../Data/SaveData/Presets";
import { SameLetterWordsProps } from "../../Pages/SameLetterWords";
import GamemodeSettingsMenu from "../GamemodeSettingsMenu";
import LoadGamemodePresetModal from "../LoadGamemodePresetModal";
import SaveGamemodePresetModal from "../SaveGamemodePresetModal";

interface SameLetterWordsGamemodeSettingsProps {
  gamemodeSettings: SameLetterWordsProps["gamemodeSettings"];

  handleTimerToggle: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSimpleGamemodeSettingsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  setRemainingGuesses: (newGuesses: number) => void;

  resetCountdown: () => void;
  setTotalSeconds: (numSeconds: number) => void;

  onLoadPresetGamemodeSettings: (gamemodeSettings: SameLetterWordsProps["gamemodeSettings"]) => void;
  onShowOfAddPresetModal: () => void;
  onHideOfAddPresetModal: () => void;
}

export const MIN_NUM_SAME_LETTER_TOTAL_WORDS = 4;
const MAX_NUM_TOTAL_WORDS = 20;

export const MIN_NUM_SAME_LETTER_MATCHING_WORDS = 2;
const MAX_NUM_MATCHING_WORDS = 10;

const MIN_NUM_GUESSES = 1;
const MAX_NUM_GUESSES = 100;

const SameLetterWordsGamemodeSettings = (props: SameLetterWordsGamemodeSettingsProps) => {
  const location = useLocation().pathname as PagePath;

  return (
    <GamemodeSettingsMenu>
      <>
        <LoadGamemodePresetModal
          getPresets={() => getGamemodeSettingsPresets<SameLetterWordsProps["gamemodeSettings"]>(location)}
          onSelectPreset={(preset) => props.onLoadPresetGamemodeSettings(preset.gamemodeSettings)}
        />

        <label>
          <input
            type="number"
            name="numMatchingWords"
            value={props.gamemodeSettings.numMatchingWords}
            min={MIN_NUM_SAME_LETTER_MATCHING_WORDS}
            max={Math.min(MAX_NUM_MATCHING_WORDS, props.gamemodeSettings.numTotalWords - 1)}
            onChange={props.handleSimpleGamemodeSettingsChange}
          />
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
          />
          Number of total words
        </label>

        <label>
          <input
            type="number"
            name="startingNumGuesses"
            value={props.gamemodeSettings.startingNumGuesses}
            min={MIN_NUM_GUESSES}
            max={MAX_NUM_GUESSES}
            onChange={(e) => {
              props.setRemainingGuesses(e.target.valueAsNumber);
              props.handleSimpleGamemodeSettingsChange(e);
            }}
          />
          Number of guesses
        </label>

        <>
          <label>
            <input
              checked={props.gamemodeSettings.timerConfig.isTimed}
              type="checkbox"
              name="timerConfig"
              onChange={props.handleTimerToggle}
            />
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
                  props.resetCountdown();
                  props.setTotalSeconds(e.target.valueAsNumber);
                  props.handleSimpleGamemodeSettingsChange(e);
                }}
              />
              Seconds
            </label>
          )}
        </>

        <SaveGamemodePresetModal
          currentGamemodeSettings={props.gamemodeSettings}
          existingPresets={getGamemodeSettingsPresets<SameLetterWordsProps["gamemodeSettings"]>(location)}
          onHide={props.onHideOfAddPresetModal}
          onShow={props.onShowOfAddPresetModal}
        />
      </>
    </GamemodeSettingsMenu>
  );
};

export default SameLetterWordsGamemodeSettings;
