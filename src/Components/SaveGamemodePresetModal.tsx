import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { PagePath } from "../Data/PageNames";
import { addGamemodeSettingsPreset } from "../Data/SaveData/Presets";
import Button from "./Button";
import MessageNotification from "./MessageNotification";
import Modal from "./Modal";

interface Props<TGamemodeSettingsPreset, TGamemodeSettings> {
  existingPresets: TGamemodeSettingsPreset[];
  currentGamemodeSettings: TGamemodeSettings;
  onShow: () => void;
  onHide: () => void;
}

function SaveGamemodePresetModal<
  TGamemodeSettingsPreset extends { name: string; timestamp: string },
  TGamemodeSettings
>(props: Props<TGamemodeSettingsPreset, TGamemodeSettings>) {
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

              addGamemodeSettingsPreset(location, {
                name: presetName,
                timestamp: new Date().toISOString(),
                gamemodeSettings: props.currentGamemodeSettings as TGamemodeSettings,
                /* 
                When the preset is retrieved, a preview <span> element is created
                This method adds the preset to localStorage which can only store string-based values
                The generic type TGamemodeSettingsPreset has the property of preview, just use an empty string here?
                */
                preview: "",
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
}

export default SaveGamemodePresetModal;
