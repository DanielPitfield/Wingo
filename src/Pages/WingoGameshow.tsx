import React, { useState } from "react";
import { SettingsData } from "../Data/SaveData";
import { PageName } from "../Data/PageNames";
import { Theme } from "../Data/Themes";
import WingoConfig, { WingoConfigProps } from "./WingoConfig";
import { Button } from "../Components/Button";
import { ChallengeReward } from "../Components/Challenge";
import Success from "../Data/Images/success.svg";
import Error from "../Data/Images/error.svg";
import { LEVEL_FINISHING_TEXT } from "../Components/Level";
import { getGamemodeDefaultWordLength } from "../Data/DefaultWordLengths";
import { getWingoGameshowRoundOrder } from "../Data/getWingoGameshowRoundOrder";
import { getPageGamemodeSettings } from "../Data/getPageGamemodeSettings";

export interface WingoGameshowProps {
  campaignConfig:
    | {
        isCampaignLevel: true;
        // What score must be achieved to pass the campaign level?
        targetScore: number;
      }
    | { isCampaignLevel: false };

  roundOrderConfig: {
    firstRoundConfig: { numWingos: number; numPuzzles: number };
    secondRoundConfig: { numWingos: number; numPuzzles: number };
    thirdRoundConfig: {
      numFourLengthWingos: number;
      numPuzzles: number;
      numFiveLengthWingos: number;
      numberPuzzles: number;
    };
    hasFinalRound: boolean;
  };

  defaultNumGuesses: number;
}

interface Props extends WingoGameshowProps {
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

export function displayGameshowSummary(summary: RoundInfo[], settings: SettingsData) {
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

export const WingoGameshow = (props: Props) => {
  const [inProgress, setInProgress] = useState(true);
  const [roundOrder, setRoundOrder] = useState<
    { isPuzzle: boolean; wordLength: number; basePoints: number; pointsLostPerGuess: number }[]
  >([]);
  const [roundNumberIndex, setRoundNumberIndex] = useState(0);
  const [wordLength, setWordLength] = useState(getGamemodeDefaultWordLength(props.page));
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

  // Determine round order
  React.useEffect(() => {
    const newRoundOrder = getWingoGameshowRoundOrder(props.roundOrderConfig);
    setRoundOrder(newRoundOrder);
  }, [props.roundOrderConfig]);

  // Update cumulative score
  React.useEffect(() => {
    if (!summary || summary.length === 0) {
      return;
    }

    const totalScore = summary.map((round) => round.score).reduce((prev, next) => prev + next);
    setGameshowScore(totalScore);

    // Campaign level and reached target score
    if (props.campaignConfig.isCampaignLevel && totalScore >= props.campaignConfig.targetScore) {
      setInProgress(false);
    }
  }, [summary]);

  // Check if the gameshow has ended (when the roundNumber changes)
  React.useEffect(() => {
    if (!roundOrder || roundOrder.length === 0) {
      return;
    }

    if (roundNumberIndex >= roundOrder.length) {
      setInProgress(false);
    }

    const nextRoundInfo = getRoundInfo();

    // Missing required information for next round
    if (nextRoundInfo === null) {
      setInProgress(false);
      return;
    }

    // Before loading round, set the word length needed
    setWordLength(nextRoundInfo?.wordLength);
  }, [roundNumberIndex]);

  function onCompleteGameshowRound(wasCorrect: boolean, guess: string, correctAnswer: string, score: number | null) {
    // Incorrect answer or score couldn't be determined, use score of 0
    const newScore = !wasCorrect ? 0 : score ?? 0;

    const roundInfo = getRoundInfo();

    const roundSummary = {
      score: newScore,
      roundNumber: roundNumberIndex,
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
    setRoundNumberIndex(roundNumberIndex + 1);

    return;
  }

  function getRoundInfo() {
    return roundOrder[roundNumberIndex] ?? null;
  }

  function getNextRound() {
    const nextRoundInfo = getRoundInfo();

    if (nextRoundInfo === null) {
      return;
    }

    const roundScoringInfo = {
      basePoints: nextRoundInfo.basePoints,
      pointsLostPerGuess: nextRoundInfo.pointsLostPerGuess,
    };

    const commonProps = {
      /*
      Always say the rounds of the gameshow are NOT campaign levels (even if the gameshow IS a campaign level)
      This way the score from the rounds is reported back correctly (wasCorrect is less strict)
      The pass criteria for a gameshow campaign level is that the gameshow score has reached the target score
      */
      isCampaignLevel: false,
      page: props.page,
      settings: props.settings,
      setPage: props.setPage,
      setTheme: props.setTheme,
      addGold: props.addGold,
      onComplete: props.onComplete,
      onCompleteGameshowRound: onCompleteGameshowRound,
    };

    if (nextRoundInfo.isPuzzle) {
      return (
        <WingoConfig
          {...commonProps}
          mode="puzzle"
          gamemodeSettings={getPageGamemodeSettings("wingo/puzzle") as WingoConfigProps["gamemodeSettings"]}
          defaultWordLength={wordLength}
          defaultNumGuesses={1}
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
          gamemodeSettings={getPageGamemodeSettings("wingo/repeat") as WingoConfigProps["gamemodeSettings"]}
          defaultWordLength={wordLength}
          defaultNumGuesses={5}
          enforceFullLengthGuesses={true}
          roundScoringInfo={roundScoringInfo}
          gameshowScore={gameshowScore}
        />
      );
    }
  }

  const getMaximumPossibleScore = (): number => {
    // TODO: What is the maximum score for each round type?
    const MAX_NORMAL_ROUND_SCORE = 100;
    const MAX_PUZZLE_ROUND_SCORE = 250;

    const numNormalRounds = roundOrder.filter((round) => !round.isPuzzle).length;
    const numPuzzleRounds = roundOrder.filter((round) => round.isPuzzle).length;

    const maxScore = numNormalRounds * MAX_NORMAL_ROUND_SCORE + numPuzzleRounds * MAX_PUZZLE_ROUND_SCORE;

    return maxScore;
  };

  function EndGameshow() {
    // Campaign level and reached target score, otherwise completed all rounds
    const wasCorrect = props.campaignConfig.isCampaignLevel
      ? gameshowScore >= Math.min(props.campaignConfig.targetScore, getMaximumPossibleScore())
      : roundNumberIndex >= roundOrder.length;
    props.onComplete(wasCorrect);

    // Navigate away from gameshow
    props.campaignConfig.isCampaignLevel ? props.setPage("campaign/area/level") : props.setPage("home");
  }

  return (
    <>
      {inProgress && <>{getNextRound()}</>}
      {!inProgress && (
        <>
          {displayGameshowSummary(summary, props.settings)}
          <Button mode="accept" onClick={EndGameshow} settings={props.settings} additionalProps={{ autoFocus: true }}>
            {props.campaignConfig.isCampaignLevel ? LEVEL_FINISHING_TEXT : "Back to Home"}
          </Button>
        </>
      )}
    </>
  );
};
