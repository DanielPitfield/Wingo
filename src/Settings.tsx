import { useState } from "react";
import { IconType } from "react-icons";
import { FiCompass, FiHeadphones, FiInfo, FiMonitor } from "react-icons/fi";
import { Page, pages } from "./App";
import { Button } from "./Button";
import { SettingsData } from "./SaveData";
import { Setting, SettingInfo } from "./Setting";
import { StudioLogo } from "./StudioLogo";
import { Themes } from "./Themes";
import { VERSION } from "./version";

interface Props {
  settings: SettingsData;
  onSettingsChange: (settings: SettingsData) => void;
}

// All the possible setting areas
type SettingArea = "Sound" | "Video" | "Gameplay" | "About";

export const Settings: React.FC<Props> = (props) => {
  const [selectedSettingAreaName, setSelectedSettingAreaName] = useState<SettingArea>("Sound");
  const { settings } = props;

  // The available choices for which page is loaded on launch
  const entryPages: Page[] = ["title-page", "campaign", "wingo/daily"];
  // More user friendly to use title values (for dropdown in settings)
  const entryPageValues = pages.filter((page) => entryPages.includes(page.page))?.map((page) => page.title);

  // All the setting areas and their settings
  const SETTINGS: (
    | {
        type: "settings";
        name: SettingArea;
        icon: IconType;
        settings: SettingInfo[];
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
        {
          name: "Skip splashscreen",
          type: "boolean",
          value: props.settings.gameplay.skipSplashscreen,
          onChange: (skipSplashscreen) => ({ ...settings, gameplay: { ...settings.gameplay, skipSplashscreen } }),
        },
        {
          name: "Entry page",
          type: "option",
          value: props.settings.gameplay.entryPage,
          values: entryPageValues,
          onChange: (entryPage) => ({ ...settings, gameplay: { ...settings.gameplay, entryPage } }),
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
            : selectedSettingArea.settings.map((setting) => <Setting key={setting.name} setting={setting} />)}
        </div>
      </section>
    </div>
  );
};
