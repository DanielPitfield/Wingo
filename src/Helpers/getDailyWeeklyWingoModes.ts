import { wingoModes } from "../Pages/WingoConfig";

export function getDailyWeeklyWingoModes() {
  return wingoModes.filter((mode) => mode.includes("daily") || mode.includes("weekly"));
}
