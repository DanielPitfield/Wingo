import { WingoMode } from "../Pages/WingoConfig";

export function isModeWithDisplayRow(mode: WingoMode): boolean {
  const modesWithDisplayRow: typeof mode[] = ["puzzle", "conundrum"];

  return modesWithDisplayRow.includes(mode);
}
