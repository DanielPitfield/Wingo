import { HistorySaveData } from "../SaveData";
import { BaseChallenge, ChallengeReward } from "./BaseChallenge";

/** Completion of the x 'Standard/Normal' Wingos */
export class XNormalWingos extends BaseChallenge {
  /** @inheritdoc */
  public internalClassName = "XNormalWingos";

  /** @inheritdoc */
  public userFacingTitle = "The Wingo Way";

  /** @inheritdoc */
  public description = () => `Complete ${this.config.numberOfGames} Wingo 'Standard/Normal' games`;

  /** @inheritdoc */
  public reward = () => this.config.reward;

  /** @inheritdoc */
  public id(): string {
    return `${this.internalClassName}-${this.config.numberOfGames}`;
  }

  /** Config for a specific version of the challenge. */
  private config: { numberOfGames: number; reward: ChallengeReward };

  /**
   * Initialises a new instance.
   * @param config Config for a specific version of the challenge.
   */
  constructor(config: XNormalWingos["config"]) {
    super();

    this.config = config;
  }

  /** @inheritdoc */
  public currentProgress(history: HistorySaveData): number {
    // Return the count of 'wingo/repeat' games completed successfully
    return history.games.filter(
      (game) => game.page === "wingo/repeat" && game.completedRounds.at(-1)?.outcome === "success"
    ).length;
  }

  /** @inheritdoc */
  public target = () => this.config.numberOfGames;
}
