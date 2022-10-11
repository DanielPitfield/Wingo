import { getLocalStorageItemName } from "../../Helpers/getLocalStorageItemName";
import { WingoConfigProps } from "../../Pages/WingoConfig";
import { PagePath } from "../PageNames";

export type GamemodeSettingsPreset<TGamemodeSettings> = {
  name: string;
  timestamp: string;
  // TODO: Generic type
  gamemodeSettings: TGamemodeSettings;
};

/**
 * Saves the gamemode settings preset for Wingo Config.
 * @param page Page.
 * @param preset The gamemode setting preset for Wingo Config to save.
 */
export function addGamemodeSettingsPreset<TGamemodeSettings>(page: PagePath, preset: GamemodeSettingsPreset<TGamemodeSettings>) {
  const itemName = `${getLocalStorageItemName(page)}-preset-${preset.name}`;

  if (itemName) {
    localStorage.setItem(itemName, JSON.stringify(preset));
  }
}

/**
 * Gets the saved gamemode settings presets for Wingo Config, or null if no saved gamemode settings were found.
 * @returns The saved gamemode settings presets for Wingo Config to save.
 */
export function getGamemodeSettingsPresets<TGamemodeSettings>(page: PagePath): GamemodeSettingsPreset<TGamemodeSettings>[] {
  const gamemodeSettingPresets = Object.entries(localStorage)
    .filter(([key, _]) => key.startsWith(`${getLocalStorageItemName(page)}-preset-`))
    .map(([_, value]) => JSON.parse(value));

  return gamemodeSettingPresets;
}

/**
 * Removes the saved gamemode settings preset for Wingo Config, or null if no saved gamemode settings were found.
 * @param page Page.
 * @param presetName The gamemode setting preset name for Wingo Config to save.
 */
export function removeGamemodeSettingPreset(page: PagePath, presetName: string) {
  const itemNamePagePrefix = getLocalStorageItemName(page);

  if (itemNamePagePrefix && presetName) {
    const itemName = `${itemNamePagePrefix}-preset-${presetName}`;
    localStorage.removeItem(itemName);
  }
}
