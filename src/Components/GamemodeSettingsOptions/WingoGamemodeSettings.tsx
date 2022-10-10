import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  MAX_TARGET_WORD_LENGTH,
  MIN_PUZZLE_WORD_LENGTH,
  MAX_PUZZLE_WORD_LENGTH,
  MIN_TARGET_WORD_LENGTH,
} from "../../Data/GamemodeSettingsInputLimits";
import { PagePath } from "../../Data/PageNames";
import { addWingoConfigGamemodeSettingsPreset, getWingoConfigGamemodeSettingsPresets, removeWingoConfigGamemodeSettingPreset } from "../../Data/SaveData/Presets";
import { WingoConfigProps, WingoMode } from "../../Pages/WingoConfig";
import { Button } from "../Button";
import GamemodeSettingsMenu from "../GamemodeSettingsMenu";
import { MessageNotification } from "../MessageNotification";
import { Modal } from "../Modal";

interface Props {
  mode: WingoMode;
  gamemodeSettings: WingoConfigProps["gamemodeSettings"];

  handleMaxLivesToggle: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleTimerToggle: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSimpleGamemodeSettingsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  setMostRecentMaxLives: (numLives: number) => void;
  setMostRecentTotalSeconds: (numSeconds: number) => void;
  onLoadGamemodeSettingsPreset: (gamemodeSettings: WingoConfigProps["gamemodeSettings"]) => void;
}

const MIN_PUZZLE_REVEAL_INTERVAL_SECONDS = 1;
const MAX_PUZZLE_REVEAL_INTERVAL_SECONDS = 10;

// Must be atleast 1 letter blank (otherwise entire word is revealed)
const MIN_PUZZLE_LEAVE_NUM_BLANKS = 1;

const WingoGamemodeSettings = (props: Props) => {
  const location = useLocation();

  const [showLoadPresetModal, setShowLoadPresetModal] = useState(false);
  const [showSavePresetModal, setShowSavePresetModal] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [savePresetModalErrorMessage, setPresetModalErrorMessage] = useState("");

  const presets = useMemo(() => {
    return getWingoConfigGamemodeSettingsPresets(location.pathname as PagePath);
  }, [showLoadPresetModal, showSavePresetModal]);

  if (props.mode === "puzzle") {
    return (
      <GamemodeSettingsMenu>
        <>
          {presets.length > 0 && (
            <>
              <Button mode="default" onClick={() => setShowLoadPresetModal(true)}>
                Presets
              </Button>

              {showLoadPresetModal && (
                <Modal mode="default" name="Load preset" title="Presets" onClose={() => setShowLoadPresetModal(false)}>
                  <table className="presets">
                    <tbody>
                      {presets
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((preset) => (
                          <tr key={preset.name} className="preset">
                            <td className="preset-name">{preset.name}</td>
                            <td className="preset-date">{new Date(preset.timestamp).toLocaleDateString()}</td>
                            <td className="preset-info">
                              <span title={JSON.stringify(preset.gameSettings, undefined, 4)}>Info</span>
                            </td>
                            <td className="preset-load">
                              <Button
                                mode="default"
                                onClick={() => {
                                  props.onLoadGamemodeSettingsPreset(preset.gameSettings);
                                  setShowLoadPresetModal(false);
                                }}
                              >
                                Load
                              </Button>
                            </td>
                            <td className="preset-delete">
                              <Button
                                mode="destructive"
                                onClick={() => {
                                  console.log("Delete location: " + location.pathname.toString());

                                  removeWingoConfigGamemodeSettingPreset(
                                    // TODO: Can't use location of WingoGamemodeSettings, has to be the mode location
                                    location.pathname as PagePath,
                                    preset.name
                                  );
                                }}
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </Modal>
              )}
            </>
          )}

          <label>
            <input
              type="number"
              name="wordLength"
              value={props.gamemodeSettings.wordLength}
              min={MIN_PUZZLE_WORD_LENGTH}
              max={MAX_PUZZLE_WORD_LENGTH}
              onChange={props.handleSimpleGamemodeSettingsChange}
            ></input>
            Word Length
          </label>

          <label>
            <input
              type="number"
              name="puzzleRevealSeconds"
              value={props.gamemodeSettings.puzzleRevealSeconds}
              min={MIN_PUZZLE_REVEAL_INTERVAL_SECONDS}
              max={MAX_PUZZLE_REVEAL_INTERVAL_SECONDS}
              onChange={props.handleSimpleGamemodeSettingsChange}
            ></input>
            Reveal Interval (seconds)
          </label>

          <label>
            <input
              type="number"
              name="puzzleLeaveNumBlanks"
              value={props.gamemodeSettings.puzzleLeaveNumBlanks}
              min={MIN_PUZZLE_LEAVE_NUM_BLANKS}
              // Show atleast 1 letter (can't all be blank!)
              max={props.gamemodeSettings.wordLength - 1}
              onChange={props.handleSimpleGamemodeSettingsChange}
            ></input>
            Number of letters left blank
          </label>

          <Button mode="accept" onClick={() => setShowSavePresetModal(true)}>
            Save as preset
          </Button>

          {showSavePresetModal && (
            <Modal
              mode="default"
              name="Save preset"
              title="Save preset"
              onClose={() => {
                setShowSavePresetModal(false);
              }}
            >
              {savePresetModalErrorMessage && (
                <MessageNotification type="error">{savePresetModalErrorMessage}</MessageNotification>
              )}

              <label>
                Name
                <input
                  type="text"
                  onChange={(e) => setPresetName(e.target.value)}
                  value={presetName}
                  placeholder="Name"
                />
              </label>

              <Button
                mode="accept"
                onClick={() => {
                  setPresetModalErrorMessage("");

                  if (!presetName) {
                    setPresetModalErrorMessage(`Provide a name for the preset`);
                    return;
                  }

                  if (presets.some((preset) => preset.name.toLowerCase() === presetName.toLowerCase())) {
                    setPresetModalErrorMessage(`Name '${presetName}' has already been used`);
                    return;
                  }

                  addWingoConfigGamemodeSettingsPreset(location.pathname as PagePath, {
                    name: presetName,
                    timestamp: new Date().toISOString(),
                    gameSettings: props.gamemodeSettings,
                  });

                  setShowSavePresetModal(false);
                  setPresetName("");
                }}
              >
                Save
              </Button>
            </Modal>
          )}
        </>
      </GamemodeSettingsMenu>
    );
  }

  const isContinuationMode = () => {
    // The modes which can be continued (they aren't always just reset)
    const continuationModes: WingoMode[] = ["increasing", "limitless"];
    return continuationModes.includes(props.mode);
  };

  const MIN_WORD_LENGTH_LABEL = isContinuationMode() ? "Starting Word Length" : "Word Length";

  // The starting word length must be atleast one below the maximum target word length (for 'increasing' mode), otherwise it would just be a mode of guessing one long word
  const MIN_WORD_LENGTH_MAX_BOUNDARY =
    props.mode === "increasing" ? MAX_TARGET_WORD_LENGTH - 1 : MAX_TARGET_WORD_LENGTH;

  return (
    <GamemodeSettingsMenu>
      <>
        <label>
          <input
            type="number"
            name="wordLength"
            value={props.gamemodeSettings.wordLength}
            min={MIN_TARGET_WORD_LENGTH}
            max={MIN_WORD_LENGTH_MAX_BOUNDARY}
            onChange={props.handleSimpleGamemodeSettingsChange}
          ></input>
          {MIN_WORD_LENGTH_LABEL}
        </label>

        {isContinuationMode() && (
          <label>
            <input
              type="number"
              name="wordLengthMaxLimit"
              value={props.gamemodeSettings.wordLengthMaxLimit}
              min={props.gamemodeSettings.wordLength + 1}
              max={MAX_TARGET_WORD_LENGTH}
              onChange={props.handleSimpleGamemodeSettingsChange}
            ></input>
            Ending Word Length
          </label>
        )}

        {props.mode === "limitless" && (
          <>
            <label>
              <input
                checked={props.gamemodeSettings.maxLivesConfig.isLimited}
                type="checkbox"
                name="maxLivesConfig"
                onChange={props.handleMaxLivesToggle}
              ></input>
              Cap max number of extra lives
            </label>
            {props.gamemodeSettings.maxLivesConfig.isLimited && (
              <label>
                <input
                  type="number"
                  name="maxLivesConfig"
                  value={props.gamemodeSettings.maxLivesConfig.maxLives}
                  min={1}
                  max={50}
                  onChange={(e) => {
                    props.setMostRecentMaxLives(e.target.valueAsNumber);
                    props.handleSimpleGamemodeSettingsChange(e);
                  }}
                ></input>
                Max number of extra lives
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

export default WingoGamemodeSettings;
