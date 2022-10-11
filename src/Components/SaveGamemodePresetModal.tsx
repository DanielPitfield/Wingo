import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { PagePath } from "../Data/PageNames";
import { addWingoConfigGamemodeSettingsPreset, GamemodeSettingsPreset } from "../Data/SaveData/Presets";
import { WingoConfigProps } from "../Pages/WingoConfig";
import { Button } from "./Button";
import { MessageNotification } from "./MessageNotification";
import { Modal } from "./Modal";

interface Props {
  existingPresets: GamemodeSettingsPreset[];
  // TODO: Generic type
  currentGamemodeSettings: WingoConfigProps["gamemodeSettings"];
  onShow: () => void;
  onHide: () => void;
}

const SaveGamemodePresetModal = (props: Props) => {
  const location = useLocation().pathname as PagePath;

  const [isModalShown, setIsModalShown] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [presetName, setPresetName] = useState("");

  // Call the `onSettingsModalShown` or `onSettingsModalHide` callback when the save modal is displayed
  useEffect(() => {
    if (isModalShown) {
      props.onShow();
    } else {
      props.onHide();
    }
  }, [isModalShown, props]);

  return (
    <>
      <Button mode="accept" onClick={() => setIsModalShown(true)}>
        Save as preset
      </Button>

      {isModalShown && (
        <Modal
          mode="default"
          name="Save preset"
          title="Save preset"
          onClose={() => {
            setIsModalShown(false);
          }}
        >
          {errorMessage && <MessageNotification type="error">{errorMessage}</MessageNotification>}

          <label>
            Name
            <input type="text" onChange={(e) => setPresetName(e.target.value)} value={presetName} placeholder="Name" />
          </label>

          <Button
            mode="accept"
            onClick={() => {
              setErrorMessage("");

              if (!presetName) {
                setErrorMessage(`Provide a name for the preset`);
                return;
              }

              if (props.existingPresets.some((preset) => preset.name.toLowerCase() === presetName.toLowerCase())) {
                setErrorMessage(`Name '${presetName}' has already been used`);
                return;
              }

              addWingoConfigGamemodeSettingsPreset(location, {
                name: presetName,
                timestamp: new Date().toISOString(),
                gamemodeSettings: props.currentGamemodeSettings,
              });

              setIsModalShown(false);
              setPresetName("");
            }}
          >
            Save
          </Button>
        </Modal>
      )}
    </>
  );
};

export default SaveGamemodePresetModal;
