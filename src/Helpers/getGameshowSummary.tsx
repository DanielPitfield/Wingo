import { ChallengeReward } from "../Components/Challenge";
import Success from "../Data/Images/success.svg";
import Error from "../Data/Images/error.svg";
import { SettingsData } from "../Data/SaveData/Settings";

type RoundInfo = {
  score: number;
  roundNumber: number;
  mode: string;
  wasCorrect: boolean;
  guess: string;
  correctAnswer: string;
};

export function displayGameshowSummary(summary: RoundInfo[], settings: SettingsData): React.ReactNode {
  return (
    <section className="gameshow-summary-info">
      <h2 className="gameshow-summary-info-title">Summary</h2>
      <p className="total-acheived">
        Total Acheived <br />
        <strong>
          {summary.reduce((total, round) => (total += round.score > 0 ? 1 : 0), 0)} / {summary.length} (
          {Math.round((summary.reduce((total, round) => (total += round.score > 0 ? 1 : 0), 0) / summary.length) * 100)}
          %)
        </strong>
      </p>
      <p className="total-gold-coins">
        Total score: <br />
        <ChallengeReward goldCoins={summary.reduce((total, x) => (total += x.score), 0)} />
      </p>
      <div className="gameshow-summary-groups">
        {summary
          .reduce<
            {
              mode: string;
              rounds: RoundInfo[];
            }[]
          >((all, round, i) => {
            if (summary[i - 1]?.mode === round.mode) {
              all[all.length - 1].rounds.push(round);
            } else {
              all.push({
                mode: round.mode,
                rounds: [round],
              });
            }

            return all;
          }, [])
          .map((group) => (
            <div key={group.mode} className="gameshow-group" data-category-name={group.mode}>
              <div className="gameshow-group-heading">
                <h2 className="gameshow-group-title">{group.mode}</h2>
                <p className="total-acheived">
                  Total Acheived <br />
                  <strong>
                    {group.rounds.reduce((total, round) => (total += round.score > 0 ? 1 : 0), 0)} /{" "}
                    {group.rounds.length} (
                    {Math.round(
                      (group.rounds.reduce((total, round) => (total += round.score > 0 ? 1 : 0), 0) /
                        group.rounds.length) *
                        100
                    )}
                    %)
                  </strong>
                </p>
                <p className="total-gold-coins">
                  Total score: <br />
                  <ChallengeReward goldCoins={group.rounds.reduce((total, x) => (total += x.score), 0)} />
                </p>
              </div>
              <div className="gameshow-round-summaries">
                {group.rounds.map((round, i) => (
                  <>
                    <div
                      key={round.roundNumber}
                      className="gameshow-round-summary"
                      data-correct={round.score > 0}
                      data-animation-setting={settings.graphics.animation}
                    >
                      <img
                        className="gameshow-round-summary-icon"
                        src={round.score > 0 ? Success : Error}
                        width={26}
                        height={26}
                        alt=""
                      />
                      <h3 className="gameshow-round-summary-title">Round {round.roundNumber + 1}</h3>
                      <p className="gameshow-round-summary-description">
                        <p className="guess">
                          <strong>Mode:</strong> {round.mode}
                        </p>
                        <p className="guess">
                          <strong>Guess:</strong> {round.guess ? round.guess.toUpperCase() : "-"}
                        </p>
                        {round.correctAnswer.length > 0 && (
                          <p className="answer">
                            <strong>Answer:</strong> {round.correctAnswer.toUpperCase()}
                          </p>
                        )}
                      </p>
                      <ChallengeReward goldCoins={round.score} />
                    </div>
                    {summary[i + 1]?.mode[0] !== round.mode[0] && <div className="break"></div>}
                  </>
                ))}
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}
