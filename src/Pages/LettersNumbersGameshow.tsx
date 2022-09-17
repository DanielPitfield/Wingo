import React, { useState } from "react";
import { SettingsData } from "../Data/SaveData";
import { PageName } from "../PageNames";
import LettersGameConfig, { LettersGameConfigProps } from "./LettersGameConfig";
import NumbersGameConfig, { NumbersGameConfigProps } from "./NumbersGameConfig";
import { Theme } from "../Data/Themes";
import { displayGameshowSummary } from "./WingoGameshow";
import { Button } from "../Components/Button";
import WingoConfig, { WingoConfigProps } from "./WingoConfig";
import { LEVEL_FINISHING_TEXT } from "../Components/Level";
import { getGamemodeDefaultNumGuesses } from "../Data/DefaultNumGuesses";
import { getGamemodeDefaultWordLength } from "../Data/DefaultWordLengths";
import { getPageGamemodeSettings } from "../Data/getPageGamemodeSettings";

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
  page: PageName;
  themes: Theme[];
  settings: SettingsData;
  setPage: (page: PageName) => void;
  setTheme: (theme: Theme) => void;
  addGold: (gold: number) => void;
  onComplete: (wasCorrect: boolean) => void;
}

export const LettersNumbersGameshow = (props: Props) => {
  const [inProgress, setInProgress] = useState(true);
  const [roundOrder, setRoundOrder] = useState<("number" | "letter" | "conundrum")[]>([]);
  const [roundNumber, setRoundNumber] = useState(0);
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
    const rounds: ("number" | "letter" | "conundrum")[] = Array.from({ length: props.numSets })
      .flatMap(
        (_, i) =>
          Array.from({ length: props.numLetterRoundsPerSet })
            .map((_) => "letter")
            .concat(Array.from({ length: props.numNumberRoundsPerSet }).map((_) => "number"))
            .concat(Array.from({ length: props.numConundrumRoundsPerSet }).map((_) => "conundrum")) as (
            | "number"
            | "letter"
            | "conundrum"
          )[]
      )
      .concat(props.hasFinishingConundrum ? ["conundrum"] : []);

    setRoundOrder(rounds);
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

    if (roundNumber >= roundOrder.length) {
      setInProgress(false);
    }
  }, [roundNumber]);

  function onCompleteGameshowRound(wasCorrect: boolean, guess: string, correctAnswer: string, score: number | null) {
    // Incorrect answer or score couldn't be determined, use score of 0
    const newScore = !wasCorrect ? 0 : score ?? 0;

    const roundSummary = {
      score: newScore,
      roundNumber: roundNumber,
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
    setRoundNumber(roundNumber + 1);

    return;
  }

  function getRoundType() {
    if (!roundOrder || roundOrder.length === 0) {
      return;
    }

    return roundOrder[roundNumber];
  }

  function getNextRound() {
    const roundType = getRoundType();

    if (!roundType) {
      return;
    }

    const commonProps = {
      /*
      Always say the rounds of the gameshow are NOT campaign levels (even if the gameshow IS a campaign level)
      This way the score from the rounds is reported back correctly (wasCorrect is less strict)
      The pass criteria for a gameshow campaign level is that the gameshow score has reached the target score
      */
      campaignConfig: { isCampaignLevel: false as false },
      page: props.page,
      settings: props.settings,
      setPage: props.setPage,
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
          gamemodeSettings={getPageGamemodeSettings("LettersGame") as LettersGameConfigProps["gamemodeSettings"]}
        />
      );
    } else if (roundType === "number") {
      return <NumbersGameConfig {...commonProps} theme={props.themes[1]} gameshowScore={gameshowScore} gamemodeSettings={getPageGamemodeSettings("NumbersGame") as NumbersGameConfigProps["gamemodeSettings"]}/>;
    } else if (roundType === "conundrum") {
      return (
        <WingoConfig
          {...commonProps}
          isCampaignLevel={false}
          mode="conundrum"
          gamemodeSettings={getPageGamemodeSettings("Conundrum") as WingoConfigProps["gamemodeSettings"]}
          defaultWordLength={getGamemodeDefaultWordLength("Conundrum")}
          defaultNumGuesses={getGamemodeDefaultNumGuesses("Conundrum")}
          enforceFullLengthGuesses={true}
        />
      );
    }
  }

  return (
    <>
      {inProgress ? getNextRound() : displayGameshowSummary(summary, props.settings)}
      {!inProgress && (
        <Button
          mode="accept"
          onClick={() => {
            // Campaign level and reached target score, otherwise completed all rounds
            const wasCorrect = props.campaignConfig.isCampaignLevel
              ? gameshowScore >= props.campaignConfig.targetScore
              : roundNumber >= roundOrder.length;
            props.onComplete(wasCorrect);
            props.campaignConfig.isCampaignLevel ? props.setPage("campaign/area/level") : props.setPage("home");
          }}
          settings={props.settings}
          additionalProps={{ autoFocus: true }}
        >
          {props.campaignConfig.isCampaignLevel ? LEVEL_FINISHING_TEXT : "Back to Home"}
        </Button>
      )}
    </>
  );
};
