import { HistorySaveData, SaveData } from "../SaveData";

export type ChallengeReward = { goldCoins: number; xp: number };

/** */
export abstract class BaseChallenge {
  /** Name of the class of the challenge (non user-facing) */
  public abstract internalClassName: string;

  /** Title of the challenge (user-facing) */
  public abstract userFacingTitle: string;

  /** Description of the challenge */
  public abstract description(): string;

  /** Progress towards the @see target */
  public abstract currentProgress(history: HistorySaveData): number;

  /** Unit to describe the current progression to the target i.e. 1 / 5 units */
  public abstract unit: string;

  /** Target to reach */
  public abstract target(): number;

  /** Description of the reward of the challenge */
  public abstract reward(): ChallengeReward;

  /**
   * Gets a unique identifer for this challenge
   * NOTE: This is important for determining if a challenge has been completed/redeemed;
   * two challenges with the same ID are assumed to be the same challenge.
   */
  public abstract id(): string;

  /** Description of the reward of the challenge */
  public get isRedeemed(): boolean {
    const redeemdedChallenges = SaveData.getRedeemedChallenges() || [];

    // Find a corresponding challenge in the save data
    return redeemdedChallenges.some((redeemedChallenge) => redeemedChallenge.id === this.id());
  }

  /**
   * Sets the challenge as redeemed.
   * @param isRedeemed Whether the challenge has been redeemed.
   */
  public set isRedeemed(isRedeemed: boolean) {
    if (!isRedeemed) {
      throw new Error(`Setting isRedeemed to false is not yet implemented`);
    }

    SaveData.addRedeemedChallenge(this);
  }

  /**
   * Returns the current percentage completion of the challenge (capped to 100%).
   * @param history Current save data history.
   * @returns Current percentage completion of the challenge (capped to 100%).
   */
  public getProgressPercentage(history: HistorySaveData): number {
    const percent = (this.currentProgress(history) / this.target()) * 100;

    return Math.min(Math.round(percent), 100);
  }

  /**
   * Returns whether the challenge has been achieved.
   * @param history Current save data history.
   * @returns Whether the challenge has been achieved.
   */
  public isAcheived(history: HistorySaveData): boolean {
    return this.getProgressPercentage(history) >= 100;
  }
}
