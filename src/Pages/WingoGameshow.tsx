import React, { useState } from "react";
import { SettingsData } from "../Data/SaveData";
import { Theme } from "../Data/Themes";
import WingoConfig, { WingoConfigProps } from "./WingoConfig";
import { Button } from "../Components/Button";
import { LEVEL_FINISHING_TEXT } from "../Components/Level";
import { getGamemodeDefaultWordLength } from "../Helpers/getGamemodeDefaultWordLength";
import { displayGameshowSummary } from "../Helpers/getGameshowSummary";
import { getPageGamemodeSettings } from "../Helpers/getPageGamemodeSettings";
import { getWingoGameshowRoundOrder } from "../Helpers/getWingoGameshowRoundOrder";
import { useNavigate, useLocation } from "react-router-dom";
import { PagePath } from "../Data/PageNames";
import { getGamemodeDefaultNumGuesses } from "../Helpers/getGamemodeDefaultNumGuesses";

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
  theme: Theme;
  settings: SettingsData;
  setTheme: (theme: Theme) => void;
  addGold: (gold: number) => void;
  onComplete: (wasCorrect: boolean) => void;
}

export const WingoGameshow = (props: Props) => {
  const navigate = useNavigate();
  const location = useLocation().pathname as PagePath;

  const [inProgress, setInProgress] = useState(true);
  const [roundOrder, setRoundOrder] = useState<
    { isPuzzle: boolean; wordLength: number; basePoints: number; pointsLostPerGuess: number }[]
  >([]);
  const [roundNumberIndex, setRoundNumberIndex] = useState(0);
  const [wordLength, setWordLength] = useState(getGamemodeDefaultWordLength(location));
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
      settings: props.settings,
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
          gamemodeSettings={{
            ...(getPageGamemodeSettings("/Wingo/Puzzle") as WingoConfigProps["gamemodeSettings"]),
            wordLength: wordLength,
          }}
          defaultNumGuesses={getGamemodeDefaultNumGuesses("/Wingo/Puzzle")}
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
          gamemodeSettings={{
            ...(getPageGamemodeSettings("/Wingo/Repeat") as WingoConfigProps["gamemodeSettings"]),
            wordLength: wordLength,
          }}
          defaultNumGuesses={getGamemodeDefaultNumGuesses("/Wingo/Repeat")}
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
    props.campaignConfig.isCampaignLevel
      ? navigate("/Campaign/Areas/:areaName/Levels/:levelNumber")
      : navigate("/Home");
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
