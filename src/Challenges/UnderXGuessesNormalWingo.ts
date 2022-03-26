import { HistorySaveData } from "../SaveData";
import { BaseChallenge, ChallengeReward } from "./BaseChallenge";

/** Completion of a round of Standard/Normal in x guesses */
export class UnderXGuessesNormalWingo extends BaseChallenge {
  /** @inheritdoc */
  public internalClassName = "UnderXGuessesNormalWingo";

  /** @inheritdoc */
  public userFacingTitle = "Wingo Warrior";

  /** @inheritdoc */
  public description = () => `Complete a 'Standard/Normal' Wingo round within ${this.config.numberOfGuesses} guesses`;

  /** @inheritdoc */
  public unit = "";

  /** @inheritdoc */
  public reward = () => this.config.reward;

  /** @inheritdoc */
  public id(): string {
    return `${this.internalClassName}-${this.config.numberOfGuesses}`;
  }

  /** Config for a specific version of the challenge. */
  private config: { numberOfGuesses: number; reward: ChallengeReward };

  /**
   * Initialises a new instance.
   * @param config Config for a specific version of the challenge.
   */
  constructor(config: UnderXGuessesNormalWingo["config"]) {
    super();

    this.config = config;
  }

  /** @inheritdoc */
  public currentProgress(history: HistorySaveData): number {
    // Return the count of 'wingo/repeat' games completed successfully
    return history.games.filter(
      (game) =>
        game.page === "wingo/repeat" &&
        game.completedRounds.some((x) => x.guesses.length <= this.config.numberOfGuesses && x.outcome === "success")
    ).length;
  }

  /** @inheritdoc */
  public target = () => 1;
}
