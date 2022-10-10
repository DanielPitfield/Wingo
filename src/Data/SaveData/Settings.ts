import { Themes } from "../Themes";

export type SettingsData = {
  sound: {
    masterVolume: number;
    backgroundVolume: number;
    effectsVolume: number;
  };
  graphics: {
    darkMode: boolean;
    preferredTheme: keyof typeof Themes | null;
    animation: boolean;
  };
  gameplay: {
    keyboard: boolean;
    skipSplashscreen: boolean;
    entryPage: string | null;
  };
};

/** Settings with everything disabled */
export const DISABLED_SETTINGS: SettingsData = {
  sound: { masterVolume: 0, effectsVolume: 0, backgroundVolume: 0 },
  graphics: { darkMode: false, preferredTheme: null, animation: false },
  gameplay: { keyboard: false, skipSplashscreen: true, entryPage: "Home" },
};

/** Default settings */
const DEFAULT_SETTINGS: SettingsData = {
  sound: { masterVolume: 0.5, effectsVolume: 0.5, backgroundVolume: 0.35 },
  graphics: { darkMode: false, preferredTheme: null, animation: true },
  gameplay: { keyboard: true, skipSplashscreen: false, entryPage: "Home" },
};

/**
 * Gets saved settings.
 * @returns Saved settings, or a default settings object if no saved settings found.
 */
export function getSettings(): SettingsData {
  const settings = localStorage.getItem("settings");

  if (settings) {
    return JSON.parse(settings) as SettingsData;
  }

  return DEFAULT_SETTINGS;
}

/**
 * Sets saved settings.
 * @param updatedSettings Settings to update.
 */
export function setSettings(updatedSettings: Partial<SettingsData>) {
  const currentSettings = getSettings();

  const settings = { ...currentSettings, ...updatedSettings };

  localStorage.setItem("settings", JSON.stringify(settings));
}
