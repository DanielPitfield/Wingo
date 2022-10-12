import { getLocalStorageItemName } from "../../Helpers/getLocalStorageItemName";
import { PagePath } from "../PageNames";

export type GamemodeSettingsPreset<TGamemodeSettings> = {
  name: string;
  timestamp: string;
  gamemodeSettings: TGamemodeSettings;
  preview: React.ReactNode;
};

/**
 * Saves the gamemode settings preset for Wingo Config.
 * @param page Page.
 * @param preset The gamemode setting preset for Wingo Config to save.
 */
export function addGamemodeSettingsPreset<TGamemodeSettings>(
  page: PagePath,
  preset: GamemodeSettingsPreset<TGamemodeSettings>
) {
  const itemName = `${getLocalStorageItemName(page)}-preset-${preset.name}`;

  if (itemName) {
    localStorage.setItem(itemName, JSON.stringify(preset));
  }
}

/**
 * Gets the saved gamemode settings presets for Wingo Config, or null if no saved gamemode settings were found.
 * @returns The saved gamemode settings presets for Wingo Config to save.
 */
export function getGamemodeSettingsPresets<TGamemodeSettings>(
  page: PagePath
): GamemodeSettingsPreset<TGamemodeSettings>[] {
  const gamemodeSettingPresets = Object.entries(localStorage)
    // Only the presets for this page
    .filter(([key, _]) => key.startsWith(`${getLocalStorageItemName(page)}-preset-`))
    // TODO: Please explain (key, value) as opposed to (value, index)
    .map(([_, value]) => JSON.parse(value))
    // Create a preview for the preset
    .map((preset) => ({
      ...preset,
      preview: <span title={JSON.stringify(preset.gamemodeSettings, undefined, 4)}>Info</span>,
    }));

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
