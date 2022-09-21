export const getNewGamemodeSettingValue = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { type, name } = e.target;

  if (name === "puzzleRevealMs") {
    // Look for a return value using the name first
    return e.target.valueAsNumber * 1000;
  }

  if (name === "maxLivesConfig" && type === "number") {
    return { isLimited: true, maxLives: e.target.valueAsNumber };
  }


  if (name === "timerConfig" && type === "number") {
    return { isTimed: true, seconds: e.target.valueAsNumber };
  }
  

  // Now look by type
  switch (type) {
    case "number":
      return e.target.valueAsNumber;

    case "checkbox":
      return e.target.checked;

    // Default
    default:
      return e.target.value;
  }
};
