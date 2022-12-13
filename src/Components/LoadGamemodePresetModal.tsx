import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { PagePath } from "../Data/PageNames";
import { removeGamemodeSettingPreset } from "../Data/SaveData/Presets";
import Button from "./Button";
import Modal from "./Modal";

interface Props<TGamemodeSettingsPreset> {
  getPresets: () => TGamemodeSettingsPreset[];
  onSelectPreset: (preset: TGamemodeSettingsPreset) => void;
}

function LoadGamemodePresetModal<
  TGamemodeSettingsPreset extends { name: string; timestamp: string; preview: React.ReactNode }
>(props: Props<TGamemodeSettingsPreset>) {
  const location = useLocation().pathname as PagePath;

  const [presets, setPresets] = useState<TGamemodeSettingsPreset[]>(props.getPresets());
  const [isModalShown, setIsModalShown] = useState(false);

  // Define a function to call to re-retrieve the presets
  // Note: `useCallback` prevents infinite loop
  const updatePresets = useCallback(() => {
    const presets = props.getPresets();
    setPresets(presets);
  }, [setPresets, props]);

  // (Re)retrieve the presets when the preset modal is loaded (e.g. one may have been recently added)
  useEffect(() => {
    updatePresets();
  }, [isModalShown, updatePresets]);

  return (
    <>
      <Button mode="default" onClick={() => setIsModalShown(true)}>
        Presets
      </Button>

      {isModalShown && (
        <Modal mode="default" name="Load preset" title="Presets" onClose={() => setIsModalShown(false)}>
          {presets.length > 0 ? (
            <table className="presets">
              <tbody>
                {presets
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((preset) => (
                    <tr key={preset.name} className="preset">
                      <td className="preset-name">{preset.name}</td>
                      <td className="preset-date">{new Date(preset.timestamp).toLocaleDateString()}</td>
                      <td className="preset-info">{preset.preview}</td>
                      <td className="preset-load">
                        <Button
                          mode="default"
                          onClick={() => {
                            props.onSelectPreset(preset);
                            setIsModalShown(false);
                          }}
                        >
                          Load
                        </Button>
                      </td>
                      <td className="preset-delete">
                        <Button
                          mode="destructive"
                          onClick={() => {
                            removeGamemodeSettingPreset(location, preset.name);

                            // Update list
                            updatePresets();
                          }}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : (
            <>No presets saved</>
          )}
        </Modal>
      )}
    </>
  );
}

export default LoadGamemodePresetModal;
