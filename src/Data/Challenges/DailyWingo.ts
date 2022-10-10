import { HistorySaveData } from "../SaveData/GameHistory";
import { BaseChallenge } from "./BaseChallenge";

/** Completion of the Daily Wingo */
export class DailyWingo extends BaseChallenge {
  /** @inheritdoc */
  public internalClassName = "DailyWingo";

  /** @inheritdoc */
  public userFacingTitle = "Daily Wingo";

  /** @inheritdoc */
  public description = () => "Complete today's Daily Wingo";

  /** @inheritdoc */
  public unit = "";

  /** @inheritdoc */
  public reward = () => ({ goldCoins: 500, xp: 0 });

  /** @inheritdoc */
  public id(): string {
    return `${this.internalClassName}-${new Date().toLocaleDateString()}`;
  }

  /** @inheritdoc */
  public currentProgress(history: HistorySaveData): number {
    const today = new Date();

    // Return the count of 'wingo/daily' games started today
    return history.games.filter(
      (game) =>
        game.page === "/Wingo/Daily" &&
        new Date(game.configAtStartOfGame.timestamp).getDate() === today.getDate() &&
        game.completedRounds.at(-1)?.outcome === "success"
    ).length;
  }

  /** @inheritdoc */
  public target = () => 1;
}
