import { HistorySaveData } from "../SaveData";
import { BaseChallenge } from "./BaseChallenge";

/** Completion of the Daily Wingo */
export class DailyWingo extends BaseChallenge {
  /** @inheritdoc */
  public title = "Daily Wingo";

  /** @inheritdoc */
  public description = "Complete today's Daily Wingo";

  /** @inheritdoc */
  public currentProgress(history: HistorySaveData): number {
    const today = new Date();

    // Return the count of 'wingo/daily' games started today
    return history.games.filter(
      (game) =>
        game.page === "wingo/daily" &&
        new Date(game.configAtStartOfGame.timestamp).getDate() === today.getDate() &&
        game.completedRounds.at(-1)?.outcome === "success"
    ).length;
  }

  /** @inheritdoc */
  public target = 1;
}
