import { HistorySaveData } from "../SaveData";
import { BaseChallenge, ChallengeReward } from "./BaseChallenge";

/** Completion an x letter limitless wingo */
export class XLetterLimitlessWingo extends BaseChallenge {
  /** @inheritdoc */
  public internalClassName = "XLetterLimitlessWingo";

  /** @inheritdoc */
  public userFacingTitle = "Limitless Letters";

  /** @inheritdoc */
  public description = () => `Complete a ${this.config.numberOfLetters}-letter word in Limitless Wingo`;

  /** @inheritdoc */
  public reward = () => this.config.reward;

  /** @inheritdoc */
  public id(): string {
    return `${this.internalClassName}-${this.config.numberOfLetters}`;
  }

  /** Config for a specific version of the challenge. */
  private config: { numberOfLetters: number; reward: ChallengeReward };

  /**
   * Initialises a new instance.
   * @param config Config for a specific version of the challenge.
   */
  constructor(config: XLetterLimitlessWingo["config"]) {
    super();

    this.config = config;
  }

  /** @inheritdoc */
  public currentProgress(history: HistorySaveData): number {
    // Return the count of 'wingo/repeat' games completed successfully
    return history.games.filter(
      (game) =>
        game.page === "wingo/limitless" &&
        game.completedRounds.some(
          (round) => round.currentWord.length >= this.config.numberOfLetters && round.outcome === "success"
        )
    ).length;
  }

  /** @inheritdoc */
  public target = () => 1;
}
