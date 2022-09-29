import { LevelConfig } from "../Components/Level";
import { getAreaConfig } from "./getAreaConfig";

export function getLevelConfig(areaName: string | undefined, levelNumber: string | undefined): LevelConfig | null {
  if (areaName === undefined) {
    return null;
  }

  if (levelNumber === undefined) {
    return null;
  }

  const areaConfig = getAreaConfig(areaName);

  if (areaConfig === null) {
    return null;
  }

  if (parseInt(levelNumber) === 0) {
    return areaConfig.unlock_level;
  }

  // levelNumber 1 will be the first index of levels
  const levelNumberIndex: number = parseInt(levelNumber) - 1;

  return areaConfig.levels[levelNumberIndex] ?? null;
};
