import React, { useState } from "react";
import { SettingsData } from "../Data/SaveData";
import { PageName } from "../PageNames";
import { Theme } from "../Data/Themes";
import WingoConfig from "./WingoConfig";
import { Button } from "../Components/Button";
import { ChallengeReward } from "../Components/Challenge";
import Success from "../Data/Images/success.svg";
import Error from "../Data/Images/error.svg";

interface Props {
  firstRoundConfig: { numWingos: number; numPuzzles: number };
  secondRoundConfig: { numWingos: number; numPuzzles: number };
  thirdRoundConfig: {
    numFourLengthWingos: number;
    numPuzzles: number;
    numFiveLengthWingos: number;
    numberPuzzles: number;
  };
  hasFinalRound: boolean;
  defaultnumGuesses: number;

  isCampaignLevel: boolean;
  page: PageName;
  theme: Theme;
  settings: SettingsData;
  setPage: (page: PageName) => void;
  setTheme: (theme: Theme) => void;
  addGold: (gold: number) => void;
  onComplete: (wasCorrect: boolean) => void;
}

type RoundInfo = {
  score: number;
  roundNumber: number;
  mode: string;
  wasCorrect: boolean;
  guess: string;
  correctAnswer: string;
};

export function displayGameshowSummary(summary: RoundInfo[], settings: SettingsData, onBackToHome: () => void) {
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
      <Button mode="accept" onClick={() => onBackToHome()} settings={settings} additionalProps={{ autoFocus: true }}>
        Back to Home
      </Button>
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

export const WingoGameshow: React.FC<Props> = (props) => {
  const [inProgress, setInProgress] = useState(true);
  const [roundOrder, setRoundOrder] = useState<
    { isPuzzle: boolean; wordLength: number; basePoints: number; pointsLostPerGuess: number }[]
  >([]);
  const [roundNumber, setRoundNumber] = useState(0);
  const [wordLength, setWordLength] = useState(4);
  const [gameshowScore, setGameshowScore] = useState(0);
  const [summary, setSummary] = useState<
    {
      score: number;
      roundNumber: number;
      mode: string;
      wasCorrect: boolean;
      guess: string;
      correctAnswer: string;
    }[]
  >([]);

  // Determine round order (from props)
  React.useEffect(() => {
    const firstRoundWingo = { isPuzzle: false, wordLength: 4, basePoints: 200, pointsLostPerGuess: 0 };
    const firstRoundPuzzle = { isPuzzle: true, wordLength: 9, basePoints: 300, pointsLostPerGuess: 40 };

    const secondRoundWingo = { isPuzzle: false, wordLength: 5, basePoints: 300, pointsLostPerGuess: 0 };
    const secondRoundPuzzle = { isPuzzle: true, wordLength: 10, basePoints: 400, pointsLostPerGuess: 60 };

    const thirdRoundWingo4 = { isPuzzle: false, wordLength: 4, basePoints: 500, pointsLostPerGuess: 50 };
    const thirdRoundWingo5 = { isPuzzle: false, wordLength: 5, basePoints: 500, pointsLostPerGuess: 50 };
    const thirdRoundPuzzle = { isPuzzle: true, wordLength: 11, basePoints: 750, pointsLostPerGuess: 130 };

    // TODO: Final round scoring (half, all, or double current gameshowScore)
    const finalRound = [
      { isPuzzle: false, wordLength: 4, basePoints: 0, pointsLostPerGuess: 0 },
      { isPuzzle: false, wordLength: 5, basePoints: 0, pointsLostPerGuess: 0 },
      { isPuzzle: false, wordLength: 6, basePoints: 0, pointsLostPerGuess: 0 },
    ];

    const rounds = Array.from({ length: props.firstRoundConfig.numWingos })
      .map((_) => firstRoundWingo)
      .concat(Array.from({ length: props.firstRoundConfig.numPuzzles }).map((_) => firstRoundPuzzle))
      // Second round
      .concat(Array.from({ length: props.secondRoundConfig.numWingos }).map((_) => secondRoundWingo))
      .concat(Array.from({ length: props.secondRoundConfig.numPuzzles }).map((_) => secondRoundPuzzle))
      // Third round
      .concat(Array.from({ length: props.thirdRoundConfig.numFourLengthWingos }).map((_) => thirdRoundWingo4))
      .concat(Array.from({ length: props.thirdRoundConfig.numPuzzles }).map((_) => thirdRoundPuzzle))
      .concat(Array.from({ length: props.thirdRoundConfig.numFiveLengthWingos }).map((_) => thirdRoundWingo5))
      .concat(Array.from({ length: props.thirdRoundConfig.numberPuzzles }).map((_) => thirdRoundPuzzle))
      // Final
      .concat(props.hasFinalRound ? finalRound : []);

    setRoundOrder(rounds);
  }, [props.firstRoundConfig, props.secondRoundConfig, props.thirdRoundConfig, props.hasFinalRound]);

  // Update cumulative score
  React.useEffect(() => {
    if (!summary || summary.length === 0) {
      return;
    }

    const totalScore = summary.map((round) => round.score).reduce((prev, next) => prev + next);
    setGameshowScore(totalScore);
  }, [summary]);

  // Check if the gameshow has ended (when the roundNumber changes)
  React.useEffect(() => {
    if (!roundOrder || roundOrder.length === 0) {
      return;
    }

    if (roundNumber >= roundOrder.length) {
      setInProgress(false);
    }

    const nextRoundInfo = roundOrder[roundNumber];

    // Missing required information for next round
    if (!nextRoundInfo || !nextRoundInfo.wordLength) {
      setInProgress(false);
      return;
    }

    // Before loading round, set the word length needed
    setWordLength(nextRoundInfo?.wordLength);
  }, [roundNumber]);

  function onCompleteGameshowRound(wasCorrect: boolean, guess: string, correctAnswer: string, score: number | null) {
    // Incorrect answer or score couldn't be determined, use score of 0
    const newScore = !wasCorrect ? 0 : score ?? 0;

    const roundInfo = getRoundInfo();

    const roundSummary = {
      score: newScore,
      roundNumber: roundNumber,
      mode: `${roundInfo?.isPuzzle ? "Puzzle" : "Standard"} (${roundInfo?.wordLength} letters)`,
      wasCorrect: wasCorrect,
      guess: guess,
      correctAnswer: correctAnswer,
    };

    // Update summary with answer and score for current round
    let newSummary = summary.slice();
    newSummary.push(roundSummary);
    setSummary(newSummary);

    // Start next round
    setRoundNumber(roundNumber + 1);

    return;
  }

  function getRoundInfo() {
    if (!roundOrder || roundOrder.length === 0) {
      return;
    }

    return roundOrder[roundNumber];
  }

  function getNextRound() {
    const nextRoundInfo = getRoundInfo();

    if (!nextRoundInfo) {
      return;
    }

    // Missing required information for next round
    if (!nextRoundInfo.wordLength) {
      setInProgress(false);
      return;
    }

    const roundScoringInfo = {
      basePoints: nextRoundInfo.basePoints,
      pointsLostPerGuess: nextRoundInfo.pointsLostPerGuess,
    };

    const commonProps = {
      isCampaignLevel: props.isCampaignLevel,
      page: props.page,
      theme: props.theme,
      setPage: props.setPage,
      setTheme: props.setTheme,
      addGold: props.addGold,
      settings: props.settings,
      onComplete: props.onComplete,
      onCompleteGameshowRound: onCompleteGameshowRound,
    };

    if (nextRoundInfo.isPuzzle) {
      return (
        <WingoConfig
          {...commonProps}
          mode="puzzle"
          defaultWordLength={wordLength}
          defaultnumGuesses={1}
          enforceFullLengthGuesses={true}
          roundScoringInfo={roundScoringInfo}
          gameshowScore={gameshowScore}
        />
      );
    } else {
      return (
        <WingoConfig
          {...commonProps}
          mode="repeat"
          defaultWordLength={wordLength}
          defaultnumGuesses={5}
          enforceFullLengthGuesses={true}
          roundScoringInfo={roundScoringInfo}
          gameshowScore={gameshowScore}
        />
      );
    }
  }

  return (
    <>{inProgress ? getNextRound() : displayGameshowSummary(summary, props.settings, () => props.setPage("home"))}</>
  );
};
