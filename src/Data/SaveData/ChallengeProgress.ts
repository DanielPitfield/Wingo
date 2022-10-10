import { BaseChallenge } from "../Challenges/BaseChallenge";

export type RedeemedChallengesData = {
  id: BaseChallenge["userFacingTitle"];
  redeemedTimestamp: string;
}[];

  /**
   * Gets the redeemed challenges, or null if not yet played.
   */
  export function getRedeemedChallenges(): RedeemedChallengesData | null {
    const redeemedChallenges = localStorage.getItem("redeemedChallenges");

    if (redeemedChallenges) {
      return JSON.parse(redeemedChallenges) as RedeemedChallengesData;
    }

    return null;
  }
  
  /**
   * Adds a redeemed challenge.
   * @param challege Redeemed challenge.
   */
  export function addRedeemedChallenge(challenge: BaseChallenge) {
    const redeemedChallenges = getRedeemedChallenges() ?? [];

    redeemedChallenges.push({
      id: challenge.id(),
      redeemedTimestamp: new Date().toISOString(),
    });

    localStorage.setItem("redeemedChallenges", JSON.stringify(redeemedChallenges));
  }