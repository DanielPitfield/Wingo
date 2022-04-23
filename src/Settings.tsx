import { useState } from "react";
import { Button } from "./Button";
import { SettingsData } from "./SaveData";
import { StudioLogo } from "./StudioLogo";
import { VERSION } from "./version";

interface Props {
  settings: SettingsData;
  onSettingsChange: (settings: SettingsData) => void;
}

// All the possible setting areas
type SettingArea = "Sound" | "Video" | "Gameplay" | "About";

// Individual setting
type Setting =
  | { type: "decimal"; name: string; value: number; onChange: (value: number) => SettingsData }
  | { type: "boolean"; name: string; value: boolean; onChange: (value: boolean) => SettingsData };

export const Settings: React.FC<Props> = (props) => {
  const [selectedSettingAreaName, setSelectedSettingAreaName] = useState<SettingArea>("Sound");
  const { settings } = props;

  // All the setting areas and their settings
  const SETTINGS: (
    | {
        type: "settings";
        name: SettingArea;
        settings: Setting[];
      }
    | {
        type: "custom";
        name: SettingArea;
        component: React.ReactNode;
      }
  )[] = [
    {
      name: "Sound",
      type: "settings",
      settings: [
        {
          name: "Master",
          type: "decimal",
          value: props.settings.sound.masterVolume,
          onChange: (masterVolume) => ({ ...settings, sound: { ...settings.sound, masterVolume } }),
        },
        {
          name: "Background",
          type: "decimal",
          value: props.settings.sound.backgroundVolume,
          onChange: (backgroundVolume) => ({
            ...settings,
            sound: { ...settings.sound, backgroundVolume },
          }),
        },
        {
          name: "Effects",
          type: "decimal",
          value: props.settings.sound.effectsVolume,
          onChange: (effectsVolume) => ({ ...settings, sound: { ...settings.sound, effectsVolume } }),
        },
      ],
    },
    {
      name: "Video",
      type: "settings",
      settings: [
        {
          name: "Animation",
          type: "boolean",
          value: props.settings.video.animation,
          onChange: (animation) => ({ ...settings, video: { ...settings.sound, animation } }),
        },
      ],
    },
    {
      name: "Gameplay",
      type: "settings",
      settings: [],
    },
    {
      name: "About",
      type: "custom",
      component: (
        <>
          <div>
            <strong>Version:</strong> {VERSION}
          </div>
          <StudioLogo />
        </>
      ),
    },
  ];

  /**
   * Renders a setting control.
   * @param setting Setting to render.
   * @returns Element to render.
   */
  function renderSettingControl(setting: Setting) {
    switch (setting.type) {
      // Slider 0.0 to 1.0 control
      case "decimal": {
        const MAX = 100;
        const MIN = 0;

        return (
          <input
            type="range"
            min={MIN}
            max={MAX}
            onChange={(e) => props.onSettingsChange(setting.onChange(Math.min(MAX, e.target.valueAsNumber / MAX)))}
            value={Math.min(MAX, setting.value * 100)}
          />
        );
      }

      // Checkbox Yes/No control
      case "boolean": {
        return (
          <input
            type="checkbox"
            onChange={(e) => props.onSettingsChange(setting.onChange(e.target.checked))}
            checked={setting.value}
          />
        );
      }
    }
  }

  const selectedSettingArea = SETTINGS.find((x) => x.name === selectedSettingAreaName)!;

  return (
    <div className="settings">
      <div className="setting-section-links">
        {SETTINGS.map((settingSection, i) => (
          <>
            {i === SETTINGS.length - 1 && <div className="setting-section-link-spacer"></div>}
            <Button
              mode="default"
              key={settingSection.name}
              settings={props.settings}
              className="setting-section-link"
              onClick={() => setSelectedSettingAreaName(settingSection.name)}
            >
              {settingSection.name}
            </Button>
          </>
        ))}
      </div>
      <section className="settings-section">
        <h3 className="settings-section-title">{selectedSettingArea.name}</h3>
        <div className="selected-setting">
          {selectedSettingArea.type === "custom"
            ? selectedSettingArea.component
            : selectedSettingArea.settings.map((setting) => (
                <label key={setting.name} className="setting">
                  <span className="setting-name">{setting.name}</span>
                  <div className="setting-control">{renderSettingControl(setting)}</div>
                </label>
              ))}
        </div>
      </section>
    </div>
  );
};
