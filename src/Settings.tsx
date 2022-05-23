import { useState } from "react";
import { IconType } from "react-icons";
import { FiCompass, FiHeadphones, FiInfo, FiMonitor } from "react-icons/fi";
import { Button } from "./Button";
import { SettingsData } from "./SaveData";
import { StudioLogo } from "./StudioLogo";
import { Themes } from "./Themes";
import { VERSION } from "./version";

interface Props {
  settings: SettingsData;
  onSettingsChange: (settings: SettingsData) => void;
}

// All the possible setting areas
type SettingArea = "Sound" | "Video" | "Gameplay" | "About";

// Individual setting
type Setting =
  | {
      type: "option";
      name: string;
      value: string | null;
      values: string[];
      onChange: (value: string | null) => SettingsData;
    }
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
        icon: IconType;
        settings: Setting[];
      }
    | {
        type: "custom";
        name: SettingArea;
        icon: IconType;
        component: React.ReactNode;
      }
  )[] = [
    {
      name: "Sound",
      type: "settings",
      icon: FiHeadphones,
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
      icon: FiMonitor,
      settings: [
        {
          name: "Preferred Theme",
          type: "option",
          value: props.settings.graphics.preferredTheme,
          values: Object.keys(Themes)
            .filter((key) => Themes[key as keyof typeof Themes]?.isSelectable)
            .sort((a, b) => a.localeCompare(b)),
          onChange: (preferredTheme) => ({
            ...settings,
            graphics: { ...settings.graphics, preferredTheme: preferredTheme as keyof typeof Themes | null },
          }),
        },
        {
          name: "Animation",
          type: "boolean",
          value: props.settings.graphics.animation,
          onChange: (animation) => ({ ...settings, graphics: { ...settings.graphics, animation } }),
        },
      ],
    },
    {
      name: "Gameplay",
      type: "settings",
      icon: FiCompass,
      settings: [
        {
          name: "Display on-screen keyboard",
          type: "boolean",
          value: props.settings.gameplay.keyboard,
          onChange: (keyboard) => ({ ...settings, gameplay: { ...settings.gameplay, keyboard } }),
        },
      ],
    },
    {
      name: "About",
      type: "custom",
      icon: FiInfo,
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
  function renderSettingControl(setting: Setting): React.ReactNode {
    switch (setting.type) {
      // Option control
      case "option": {
        return (
          <select
            onChange={(e) =>
              props.onSettingsChange(
                setting.onChange(
                  e.target.selectedOptions[0]?.value === "null" ? null : e.target.selectedOptions[0]?.value ?? null
                )
              )
            }
            value={setting.value || "null"}
          >
            <option value="null">No preference (default)</option>
            {setting.values.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        );
      }

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
              <settingSection.icon />
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
