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
  public unit = "letters (best)";

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
    // Get the word length of successfully completed 'wingo/repeat' games
    const gameWordLengths = history.games
      .filter(
        (game) =>
          game.page === "wingo/limitless" &&
          game.completedRounds.some(
            (round) =>
              (round.gameCategory === "wingo"
                ? round.levelProps.targetWord?.length ?? 0 >= this.config.numberOfLetters
                : false) && round.outcome === "success"
          )
      )
      .map((game) =>
        Math.max.apply(
          undefined,
          game.completedRounds.flatMap((round) =>
            round.gameCategory === "wingo" ? round.levelProps.targetWord?.length ?? 0 : 0
          )
        )
      );

    // Get the highest word length successfully completed so far (defaulting to 0)
    return gameWordLengths.length === 0 ? 0 : Math.max.apply(undefined, gameWordLengths);
  }

  /** @inheritdoc */
  public target = () => this.config.numberOfLetters;
}
