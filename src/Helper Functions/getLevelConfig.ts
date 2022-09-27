import { LevelConfig } from "../Components/Level";
import { getAreaConfig } from "./getAreaConfig";

export function getLevelConfig(areaName: string | undefined, levelNumber: string | undefined): LevelConfig | null {
  // TODO: Are these checks needed?
  if (!areaName) {
    return null;
  }

  if (!levelNumber) {
    return null;
  }

  // LevelNumber 1 will be the first index of levels
  const levelNumberIndex: number = parseInt(levelNumber) - 1;

  return getAreaConfig(areaName)?.levels[levelNumberIndex] ?? null;
};
