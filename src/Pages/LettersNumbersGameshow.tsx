import React, { useState } from "react";
import { SettingsData } from "../Data/SaveData";
import { PageName } from "../PageNames";
import LettersGameConfig from "./LettersGameConfig";
import NumbersGameConfig from "./NumbersGameConfig";
import { Theme } from "../Data/Themes";
import { displayGameshowSummary } from "./WingoGameshow";
import { Button } from "../Components/Button";
import WingoConfig from "./WingoConfig";

interface Props {
  themes: Theme[];
  numSets: number;
  numLetterRoundsPerSet: number;
  numNumberRoundsPerSet: number;
  numConundrumRoundsPerSet: number;
  hasFinishingConundrum: boolean;

  isCampaignLevel: boolean;
  page: PageName;
  settings: SettingsData;
  setPage: (page: PageName) => void;
  setTheme: (theme: Theme) => void;
  addGold: (gold: number) => void;
  onComplete: (wasCorrect: boolean) => void;
}

export const LettersNumbersGameshow: React.FC<Props> = (props) => {
  const DEFAULT_NUM_GUESSES = 5;

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
      isCampaignLevel: props.isCampaignLevel,
      page: props.page,
      setPage: props.setPage,
      setTheme: props.setTheme,
      addGold: props.addGold,
      settings: props.settings,
      onComplete: props.onComplete,
      onCompleteGameshowRound: onCompleteGameshowRound,
    };

    if (roundType === "letter") {
      return <LettersGameConfig {...commonProps} theme={props.themes[0]} gameshowScore={gameshowScore} />;
    } else if (roundType === "number") {
      return (
        <NumbersGameConfig
          {...commonProps}
          theme={props.themes[1]}
          defaultNumGuesses={DEFAULT_NUM_GUESSES}
          gameshowScore={gameshowScore}
        />
      );
    } else if (roundType === "conundrum") {
      return (
        <WingoConfig
          {...commonProps}
          mode="conundrum"
          defaultWordLength={9}
          defaultnumGuesses={1}
          enforceFullLengthGuesses={true}
        />
      );
    }
  }

  return (
    <>
      {inProgress ? getNextRound() : displayGameshowSummary(summary, props.settings, () => props.setPage("home"))}
      {!inProgress && (
        <Button
          mode={"accept"}
          onClick={() => props.setPage("home")}
          settings={props.settings}
          additionalProps={{ autoFocus: true }}
        >
          Back to Home
        </Button>
      )}
    </>
  );
};
