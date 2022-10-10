import React, { useState } from "react";
import { SettingsData } from "../Data/SaveData/SaveData";
import LettersGameConfig, { LettersGameConfigProps } from "./LettersGameConfig";
import NumbersGameConfig, { NumbersGameConfigProps } from "./NumbersGameConfig";
import { Theme } from "../Data/Themes";
import { Button } from "../Components/Button";
import WingoConfig, { WingoConfigProps } from "./WingoConfig";
import { LEVEL_FINISHING_TEXT } from "../Components/Level";
import { getGamemodeDefaultNumGuesses } from "../Helpers/getGamemodeDefaultNumGuesses";
import { displayGameshowSummary } from "../Helpers/getGameshowSummary";
import { getPageGamemodeSettings } from "../Helpers/getPageGamemodeSettings";
import { useLocation, useNavigate } from "react-router-dom";
import { getAreaBacktrackPath } from "../Helpers/getAreaBacktrackPath";
import { PagePath } from "../Data/PageNames";

type RoundType = "number" | "letter" | "conundrum";

export interface LettersNumbersGameshowProps {
  campaignConfig:
    | {
        isCampaignLevel: true;
        // What score must be achieved to pass the campaign level?
        targetScore: number;
      }
    | { isCampaignLevel: false };

  numSets: number;
  numLetterRoundsPerSet: number;
  numNumberRoundsPerSet: number;
  numConundrumRoundsPerSet: number;
  hasFinishingConundrum: boolean;
}

interface Props extends LettersNumbersGameshowProps {
  themes: Theme[];
  settings: SettingsData;
  setTheme: (theme: Theme) => void;
  addGold: (gold: number) => void;
  onComplete: (wasCorrect: boolean) => void;
}

export const LettersNumbersGameshow = (props: Props) => {
  const navigate = useNavigate();
  const location = useLocation().pathname as PagePath;

  const [inProgress, setInProgress] = useState(true);
  const [roundOrder, setRoundOrder] = useState<RoundType[]>([]);
  const [roundNumberIndex, setRoundNumberIndex] = useState(0);
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

  // The order of rounds for just a singular set
  function generateRoundSet(): RoundType[] {
    return Array.from({ length: props.numLetterRoundsPerSet })
      .map((_) => "letter" as RoundType)
      .concat(Array.from({ length: props.numNumberRoundsPerSet }).map((_) => "number" as RoundType))
      .concat(Array.from({ length: props.numConundrumRoundsPerSet }).map((_) => "conundrum" as RoundType))
      .concat(props.hasFinishingConundrum ? ["conundrum" as RoundType] : []);
  }

  // The entire order of rounds
  function generateRoundOrder(): RoundType[] {
    return Array.from({ length: props.numSets }).flatMap((_, i) => generateRoundSet());
  }

  // Determine round order (from props)
  React.useEffect(() => {
    setRoundOrder(generateRoundOrder());
  }, [
    props.numSets,
    props.numLetterRoundsPerSet,
    props.numNumberRoundsPerSet,
    props.numConundrumRoundsPerSet,
    props.hasFinishingConundrum,
  ]);

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
  }, [roundNumberIndex]);

  function onCompleteGameshowRound(wasCorrect: boolean, guess: string, correctAnswer: string, score: number | null) {
    // Incorrect answer or score couldn't be determined, use score of 0
    const newScore = !wasCorrect ? 0 : score ?? 0;

    const roundSummary = {
      score: newScore,
      roundNumber: roundNumberIndex,
      mode: getRoundType()?.toString() || "",
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

  function getRoundType(): RoundType | null {
    return roundOrder[roundNumberIndex] ?? null;
  }

  function getNextRound() {
    const roundType = getRoundType();

    if (roundType === null) {
      return;
    }

    const commonProps = {
      /*
      Always say the rounds of the gameshow are NOT campaign levels (even if the gameshow IS a campaign level)
      This way the score from the rounds is reported back correctly (wasCorrect is less strict)
      The pass criteria for a gameshow campaign level is that the gameshow score has reached the target score
      */
      campaignConfig: { isCampaignLevel: false as false },
      settings: props.settings,
      setTheme: props.setTheme,
      addGold: props.addGold,
      onComplete: props.onComplete,
      onCompleteGameshowRound: onCompleteGameshowRound,
    };

    if (roundType === "letter") {
      return (
        <LettersGameConfig
          {...commonProps}
          theme={props.themes[0]}
          gameshowScore={gameshowScore}
          gamemodeSettings={getPageGamemodeSettings("/LettersGame") as LettersGameConfigProps["gamemodeSettings"]}
        />
      );
    } else if (roundType === "number") {
      return (
        <NumbersGameConfig
          {...commonProps}
          theme={props.themes[1]}
          gameshowScore={gameshowScore}
          gamemodeSettings={getPageGamemodeSettings("/NumbersGame") as NumbersGameConfigProps["gamemodeSettings"]}
        />
      );
    } else if (roundType === "conundrum") {
      return (
        <WingoConfig
          {...commonProps}
          isCampaignLevel={false}
          mode="conundrum"
          gamemodeSettings={getPageGamemodeSettings("/Conundrum") as WingoConfigProps["gamemodeSettings"]}
          defaultNumGuesses={getGamemodeDefaultNumGuesses("/Conundrum")}
          enforceFullLengthGuesses={true}
        />
      );
    }
  }

  const getMaximumPossibleScore = (): number => {
    const MAX_LETTER_ROUND_SCORE = 9;
    const MAX_NUMBER_ROUND_SCORE = 10;
    const MAX_CONUNDRUM_ROUND_SCORE = 9;

    const numLetterRounds = roundOrder.filter((round) => round === "letter").length;
    const numNumberRounds = roundOrder.filter((round) => round === "number").length;
    const numConundrumRounds = roundOrder.filter((round) => round === "conundrum").length;

    const maxScore =
      numLetterRounds * MAX_LETTER_ROUND_SCORE +
      numNumberRounds * MAX_NUMBER_ROUND_SCORE +
      numConundrumRounds * MAX_CONUNDRUM_ROUND_SCORE;

    return maxScore;
  };

  function EndGameshow() {
    // Campaign level and reached target score, otherwise completed all rounds
    const wasCorrect = props.campaignConfig.isCampaignLevel
      ? gameshowScore >= Math.min(props.campaignConfig.targetScore, getMaximumPossibleScore())
      : roundNumberIndex >= roundOrder.length;
    props.onComplete(wasCorrect);

    // Navigate away from gameshow
    props.campaignConfig.isCampaignLevel ? navigate(getAreaBacktrackPath(location)) : navigate("/Home");
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
