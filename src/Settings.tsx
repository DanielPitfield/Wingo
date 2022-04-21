import { SettingsData } from "./SaveData";

interface Props {
  settings: SettingsData;
  onSettingsChange: (settings: SettingsData) => void;
}

export const Settings: React.FC<Props> = (props) => {
  /**
   * Renders a setting control for a 0.0 to 1.0 value.
   * @param decimal Current value.
   * @param onChange On change of the value.
   * @returns Element to render.
   */
  function decimalSettingControl(decimal: number, onChange: (decimal: number) => void) {
    const MAX = 100;
    const MIN = 0;

    return (
      <input
        type="number"
        min={MIN}
        max={MAX}
        onChange={(e) => onChange(Math.min(MAX, e.target.valueAsNumber / MAX))}
        value={Math.min(MAX, decimal * 100)}
      />
    );
  }

  return (
    <div className="settings">
      <section className="settings-section">
        <h3 className="settings-section-title">Sound</h3>
        <label className="setting">
          Master Volume:
          {decimalSettingControl(props.settings.sound.masterVolume, (masterVolume) =>
            props.onSettingsChange({ sound: { ...props.settings.sound, masterVolume } })
          )}
        </label>
        <label className="setting">
          Background Volume:
          {decimalSettingControl(props.settings.sound.backgroundVolume, (backgroundVolume) =>
            props.onSettingsChange({ sound: { ...props.settings.sound, masterVolume: backgroundVolume } })
          )}
        </label>
        <label className="setting">
          Effects Volume:
          {decimalSettingControl(props.settings.sound.effectsVolume, (effectsVolume) =>
            props.onSettingsChange({ sound: { ...props.settings.sound, masterVolume: effectsVolume } })
          )}
        </label>
      </section>
    </div>
  );
};
