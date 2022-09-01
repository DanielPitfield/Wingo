import { AllChallenges } from "../Data/Challenges/AllChallenges";
import { SaveData, SettingsData } from "../Data/SaveData";
import { Challenge, ChallengeReward } from "./Challenge";
import { useState } from "react";
import { BaseChallenge } from "../Data/Challenges/BaseChallenge";

interface ChallengesInfoProps {
  settings: SettingsData;
  addGold: (gold: number) => void;
};

export const ChallengesInfo = (props: ChallengesInfoProps) => {
  const history = SaveData.getHistory();
  const [selectedChallenge, setSelectedChallenge] = useState<BaseChallenge | null>();

  const acheivedChallenges = AllChallenges.filter((challenge) => challenge.isAcheived(history));
  const totalChallengesAcheived = acheivedChallenges.length;

  return (
    <section className="challenges-info">
      <h2 className="challenges-info-title">Challenges</h2>
      <p className="total-acheived">
        Total Acheived <br />
        <strong>
          {totalChallengesAcheived} / {AllChallenges.length} (
          {Math.round((totalChallengesAcheived / AllChallenges.length) * 100)}%)
        </strong>
      </p>
      <p className="total-gold-coins">
        Total coins won: <br />
        <ChallengeReward goldCoins={acheivedChallenges.reduce((total, x) => (total += x.reward().goldCoins), 0)} />
      </p>
      <div className="challenges-info-categories">
        {AllChallenges.reduce<{ categoryInternalClassName: string; challenges: BaseChallenge[] }[]>(
          (all, challenge) => {
            const category = all.find((x) => x.categoryInternalClassName === challenge.internalClassName);

            if (!category) {
              all.push({
                categoryInternalClassName: challenge.internalClassName,
                challenges: [challenge],
              });
            } else {
              category.challenges.push(challenge);
              all = all.filter((x) => x.categoryInternalClassName !== challenge.internalClassName).concat([category]);
            }

            return all;
          },
          []
        ).map(({ categoryInternalClassName, challenges }) => {
          const acheivedChallenges = challenges.filter((challenge) => challenge.isAcheived(history));
          const totalChallengesAcheived = acheivedChallenges.length;

          return (
            <div
              key={categoryInternalClassName}
              className="challenges-info-category"
              data-category-name={categoryInternalClassName}
            >
              <div className="challenges-info-category-heading">
                <h2 className="challenges-info-category-title">{challenges[0].userFacingTitle}</h2>
                <p className="total-acheived">
                  Total Acheived <br />
                  <strong>
                    {totalChallengesAcheived} / {challenges.length} (
                    {Math.round((totalChallengesAcheived / challenges.length) * 100)}%)
                  </strong>
                </p>
                <p className="total-gold-coins">
                  Total coins won: <br />
                  <ChallengeReward
                    goldCoins={acheivedChallenges.reduce((total, x) => (total += x.reward().goldCoins), 0)}
                  />
                </p>
              </div>
              <div className="challenges-info-category-challenges">
                {challenges.map((challenge) => (
                  <Challenge
                    key={challenge.id()}
                    mode={selectedChallenge?.id() === challenge.id() ? "enhanced" : "default"}
                    challenge={challenge}
                    settings={props.settings}
                    onClick={() => setSelectedChallenge(challenge)}
                    addGold={props.addGold}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
