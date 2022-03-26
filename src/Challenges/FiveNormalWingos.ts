import { HistorySaveData } from "../SaveData";
import { BaseChallenge } from "./BaseChallenge";

/** Completion of the 5 'Standard/Normal' Wingos */
export class FiveNormalWingos extends BaseChallenge {
  /** @inheritdoc */
  public title = "Wingo Standard/Normal x5";

  /** @inheritdoc */
  public description = "Complete 5 Wingo 'Standard/Normal' games";

  /** @inheritdoc */
  public currentProgress(history: HistorySaveData): number {
    // Return the count of 'wingo/repeat' games completed successfully
    return history.games.filter(
      (game) => game.page === "wingo/repeat" && game.completedRounds.at(-1)?.outcome === "success"
    ).length;
  }

  /** @inheritdoc */
  public target = 5;
}
