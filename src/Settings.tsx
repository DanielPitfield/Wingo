import { SettingsData } from "./SaveData";

interface Props {
  settings: SettingsData;
  onSettingsChange: (settings: SettingsData) => void;
}

export const Settings: React.FC<Props> = (props) => {
  const { settings } = props;

  const SETTINGS: {
    name: string;
    settings: { name: string; value: number; onChange: (value: number) => SettingsData }[];
  }[] = [
    {
      name: "Sound",
      settings: [
        {
          name: "Master",
          value: props.settings.sound.masterVolume,
          onChange: (masterVolume) => ({ ...settings, sound: { ...settings.sound, masterVolume } }),
        },
        {
          name: "Background",
          value: props.settings.sound.backgroundVolume,
          onChange: (backgroundVolume) => ({
            ...settings,
            sound: { ...settings.sound, masterVolume: backgroundVolume },
          }),
        },
        {
          name: "Effects",
          value: props.settings.sound.effectsVolume,
          onChange: (effectsVolume) => ({ ...settings, sound: { ...settings.sound, masterVolume: effectsVolume } }),
        },
      ],
    },
  ];

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
      {SETTINGS.map((settingSection) => (
        <section key={settingSection.name} className="settings-section">
          <h3 className="settings-section-title">{settingSection.name}</h3>
          {settingSection.settings.map((setting) => (
            <label key={setting.name} className="setting">
              {setting.name}:{decimalSettingControl(setting.value, setting.onChange)}
            </label>
          ))}
        </section>
      ))}
    </div>
  );
};
