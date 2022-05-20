import React, { useState } from "react";
import "./index.scss";
import { SettingsData } from "./SaveData";
import { Page } from "./App";
import { Theme } from "./Themes";
import WordleConfig from "./WordleConfig";
import { Button } from "./Button";
import { ChallengeReward } from "./Challenges/Challenge";
import Star from "./images/star.png";

interface Props {
  keyboard: boolean;
  firstRoundConfig: { numLingos: number; numPuzzles: number };
  secondRoundConfig: { numLingos: number; numPuzzles: number };
  thirdRoundConfig: {
    numFourLengthLingos: number;
    numPuzzles: number;
    numFiveLengthLingos: number;
    numberPuzzles: number;
  };
  hasFinalRound: boolean;

  commonWingoProps: {
    saveData: Storage;
    defaultnumGuesses: number;
    puzzleRevealMs: number;
    puzzleLeaveNumBlanks: number;
    page: Page;
    theme: Theme;
    setPage: (page: Page) => void;
    setTheme: (theme: Theme) => void;
    addGold: (gold: number) => void;
    settings: SettingsData;
    onComplete: (wasCorrect: boolean) => void;
  };
}

export function displayGameshowSummary(
  totalScore: number,
  summary: { roundNumber: number; wasCorrect: boolean; answer: string; targetAnswer: string; score: number }[],
  settings: SettingsData
) {
  return (
    <div className="gameshow-summary-container">
      <div className="gameshow-summary-totalScore">{totalScore}</div>
      {summary.map((round) => (
        <div
          key={round.roundNumber}
          className="gameshow-round-summary"
          data-correct={round.score > 0}
          data-animation-setting={settings.graphics.animation}
        >
          <img className="gameshow-round-summary-icon" src={Star} width={32} height={32} alt="" />
          <h3 className="gameshow-round-summary-title">Round {round.roundNumber}</h3>
          <p className="gameshow-round-summary-description">
            <p className="guess">
              <strong>Guess:</strong> {round.answer ? round.answer.toUpperCase() : "-"}
            </p>
            {round.targetAnswer.length > 0 && (
              <p className="answer">
                <strong>Answer:</strong> {round.targetAnswer.toUpperCase()}
              </p>
            )}
          </p>
          <ChallengeReward goldCoins={round.score} />
        </div>
      ))}
    </div>
  );
}

export const LingoGameshow: React.FC<Props> = (props) => {
  const [inProgress, setInProgress] = useState(true);
  const [roundOrder, setRoundOrder] = useState<
    { isPuzzle: boolean; wordLength: number; basePoints: number; pointsLostPerGuess: number }[]
  >([]);
  const [roundNumber, setRoundNumber] = useState(0);
  const [wordLength, setWordLength] = useState(4);
  const [gameshowScore, setGameshowScore] = useState(0);
  const [summary, setSummary] = useState<
    { roundNumber: number; wasCorrect: boolean; answer: string; targetAnswer: string; score: number }[]
  >([]);

  // Determine round order (from props)
  React.useEffect(() => {
    const firstRoundLingo = { isPuzzle: false, wordLength: 4, basePoints: 200, pointsLostPerGuess: 0 };
    const firstRoundPuzzle = { isPuzzle: true, wordLength: 9, basePoints: 300, pointsLostPerGuess: 40 };

    const secondRoundLingo = { isPuzzle: false, wordLength: 5, basePoints: 300, pointsLostPerGuess: 0 };
    const secondRoundPuzzle = { isPuzzle: true, wordLength: 10, basePoints: 400, pointsLostPerGuess: 60 };

    const thirdRoundLingo4 = { isPuzzle: false, wordLength: 4, basePoints: 500, pointsLostPerGuess: 50 };
    const thirdRoundLingo5 = { isPuzzle: false, wordLength: 5, basePoints: 500, pointsLostPerGuess: 50 };
    const thirdRoundPuzzle = { isPuzzle: true, wordLength: 11, basePoints: 750, pointsLostPerGuess: 130 };

    // TODO: Final round scoring (half, all, or double current gameshowScore)
    const finalRound = [
      { isPuzzle: false, wordLength: 4, basePoints: 0, pointsLostPerGuess: 0 },
      { isPuzzle: false, wordLength: 5, basePoints: 0, pointsLostPerGuess: 0 },
      { isPuzzle: false, wordLength: 6, basePoints: 0, pointsLostPerGuess: 0 },
    ];

    const rounds = Array.from({ length: props.firstRoundConfig.numLingos })
      .map((_) => firstRoundLingo)
      .concat(Array.from({ length: props.firstRoundConfig.numPuzzles }).map((_) => firstRoundPuzzle))
      // Second round
      .concat(Array.from({ length: props.secondRoundConfig.numLingos }).map((_) => secondRoundLingo))
      .concat(Array.from({ length: props.secondRoundConfig.numPuzzles }).map((_) => secondRoundPuzzle))
      // Third round
      .concat(Array.from({ length: props.thirdRoundConfig.numFourLengthLingos }).map((_) => thirdRoundLingo4))
      .concat(Array.from({ length: props.thirdRoundConfig.numPuzzles }).map((_) => thirdRoundPuzzle))
      .concat(Array.from({ length: props.thirdRoundConfig.numFiveLengthLingos }).map((_) => thirdRoundLingo5))
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

  function getNextRound() {
    if (!roundOrder || roundOrder.length === 0) {
      return;
    }

    const nextRoundInfo = roundOrder[roundNumber];

    // Missing required information for next round
    if (!nextRoundInfo || !nextRoundInfo.wordLength) {
      setInProgress(false);
      return;
    }

    const roundScoringInfo = {
      basePoints: nextRoundInfo.basePoints,
      pointsLostPerGuess: nextRoundInfo.pointsLostPerGuess,
    };

    if (nextRoundInfo.isPuzzle) {
      return (
        <WordleConfig
          {...props.commonWingoProps}
          onComplete={onComplete}
          mode="puzzle"
          firstLetterProvided={true}
          showHint={false}
          timerConfig={{ isTimed: false }}
          keyboard={props.keyboard}
          defaultWordLength={wordLength}
          defaultnumGuesses={1}
          enforceFullLengthGuesses={true}
          roundScoringInfo={roundScoringInfo}
          gameshowScore={gameshowScore}
        />
      );
    } else {
      return (
        <WordleConfig
          {...props.commonWingoProps}
          onComplete={onComplete}
          mode="repeat"
          firstLetterProvided={true}
          showHint={false}
          timerConfig={{ isTimed: true, seconds: 30 }}
          keyboard={props.keyboard}
          defaultWordLength={wordLength}
          enforceFullLengthGuesses={true}
          roundScoringInfo={roundScoringInfo}
          gameshowScore={gameshowScore}
        />
      );
    }
  }

  function onComplete(wasCorrect: boolean, answer: string, targetAnswer: string, score: number | null) {
    // Incorrect answer or score couldn't be determined, use score of 0
    const newScore = !wasCorrect || !score || score === undefined || score === null ? 0 : score;

    const roundSummary = {
      roundNumber: roundNumber,
      wasCorrect: wasCorrect,
      answer: answer,
      targetAnswer: targetAnswer,
      score: newScore,
    };

    // Update summary with answer and score for current round
    let newSummary = summary.slice();
    newSummary.push(roundSummary);
    setSummary(newSummary);

    // Start next round
    setRoundNumber(roundNumber + 1);

    return;
  }

  return (
    <>
      {inProgress ? getNextRound() : displayGameshowSummary(gameshowScore, summary, props.commonWingoProps.settings)}
      {!inProgress && (
        <Button
          mode={"accept"}
          onClick={() => props.commonWingoProps.setPage("home")}
          settings={props.commonWingoProps.settings}
          additionalProps={{ autoFocus: true }}
        >
          Back to Home
        </Button>
      )}
    </>
  );
};
