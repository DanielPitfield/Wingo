import { SettingsData } from "./SaveData";

interface Props {
  settings: SettingsData;
  onSettingsChange: (settings: SettingsData) => void;
}

export const Settings: React.FC<Props> = (props) => {
  return (
    <div className="settings">
      <section className="settings-section">
        <h3 className="settings-section-title">Sound</h3>
        <label className="setting">
          Enabled:
          <input
            type="checkbox"
            onChange={(e) =>
              props.onSettingsChange({
                ...props.settings,
                sound: { ...props.settings.sound, soundEnabled: e.target.checked },
              })
            }
            checked={props.settings.sound.soundEnabled}
          />
        </label>
        <label className="setting">
          Volume:
          <input
            type="number"
            min="0"
            max="100"
            onChange={(e) =>
              props.onSettingsChange({
                ...props.settings,
                sound: { ...props.settings.sound, volume: e.target.valueAsNumber / 100 },
              })
            }
            value={props.settings.sound.volume * 100}
          />
        </label>
      </section>
    </div>
  );
};
