export function handleGamemodeSettingsChange<TGamemodeSettings>(
  e: React.ChangeEvent<HTMLInputElement>,
  currentGamemodeSettings: TGamemodeSettings,
  updateGamemodeSettings: (newGamemodeSettings: TGamemodeSettings) => void,
  optionalSettings: OptionalSettings
) {
  updateGamemodeSettings({
    ...currentGamemodeSettings,
    [e.target.name]: getNewGamemodeSettingValue(e, optionalSettings),
  });
}

export type OptionalSettings = { maxLives?: number; totalSeconds?: number };

export const getNewGamemodeSettingValue = (
  e: React.ChangeEvent<HTMLInputElement>,
  mostRecentValues?: OptionalSettings
) => {
  const { type, name } = e.target;

  if (!type) {
    return;
  }

  if (!name) {
    return;
  }

  // Look for a return value using the name first
  switch (name) {
    case "puzzleRevealMs":
      return e.target.valueAsNumber * 1000;
    case "maxLivesConfig":
      if (type === "checkbox" && mostRecentValues?.maxLives !== undefined) {
        return e.target.checked ? { isLimited: true, maxLives: mostRecentValues?.maxLives } : { isLimited: false };
      } else if (type === "number") {
        return { isLimited: true, maxLives: e.target.valueAsNumber };
      }
      break;

    case "timerConfig":
      if (type === "checkbox" && mostRecentValues?.totalSeconds !== undefined) {
        // If currently timed, on change, make the game not timed and vice versa
        return e.target.checked ? { isTimed: true, seconds: mostRecentValues?.totalSeconds } : { isTimed: false };
      } else if (type === "number") {
        return { isTimed: true, seconds: e.target.valueAsNumber };
      }
      break;

    // No case specified for the name, then look for a return value using type
    default:
      switch (type) {
        case "number":
          return e.target.valueAsNumber;

        case "checkbox":
          return e.target.checked;

        // Default
        default:
          return e.target.value;
      }
  }
};
