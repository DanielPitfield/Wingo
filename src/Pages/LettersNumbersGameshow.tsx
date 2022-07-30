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
  settings: SettingsData;
  setPage: (page: PageName) => void;
  page: PageName;
  themes: Theme[];
  setTheme: (theme: Theme) => void;
  addGold: (gold: number) => void;
  numSets: number;
  numLetterRoundsPerSet: number;
  numNumberRoundsPerSet: number;
  numConundrumRoundsPerSet: number;
  hasFinishingConundrum: boolean;

  commonWingoProps: {
    defaultnumGuesses: number;
    page: PageName;
    theme: Theme;
    setPage: (page: PageName) => void;
    setTheme: (theme: Theme) => void;
    addGold: (gold: number) => void;
    settings: SettingsData;
    onComplete: (wasCorrect: boolean) => void;
  };
}

export const LettersNumbersGameshow: React.FC<Props> = (props) => {
  const DEFAULT_NUM_GUESSES = 5;

  const [inProgress, setInProgress] = useState(true);
  const [roundOrder, setRoundOrder] = useState<("number" | "letter" | "conundrum")[]>([]);
  const [roundNumber, setRoundNumber] = useState(0);
  const [gameshowScore, setGameshowScore] = useState(0);
  const [summary, setSummary] = useState<
    {
      roundNumber: number;
      mode: string;
      modeName: string;
      wasCorrect: boolean;
      answer: string;
      targetAnswer: string;
      score: number;
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

    if (roundType === "letter") {
      return (
        <LettersGameConfig
          page={"LettersGame"}
          theme={props.themes[0]}
          settings={props.settings}
          setTheme={props.setTheme}
          setPage={props.setPage}
          addGold={props.addGold}
          onComplete={onComplete}
          gameshowScore={gameshowScore}
        />
      );
    } else if (roundType === "number") {
      return (
        <NumbersGameConfig
          defaultNumGuesses={DEFAULT_NUM_GUESSES}
          page={"NumbersGame"}
          theme={props.themes[1]}
          settings={props.settings}
          setTheme={props.setTheme}
          setPage={props.setPage}
          addGold={props.addGold}
          onComplete={onComplete}
          gameshowScore={gameshowScore}
        />
      );
    } else if (roundType === "conundrum") {
      return (
        <WingoConfig
          {...props.commonWingoProps}
          mode="conundrum"
          defaultWordLength={9}
          defaultnumGuesses={1}
          enforceFullLengthGuesses={true}
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
      mode: getRoundType()?.toString() || "",
      modeName: getRoundType()?.toString() || "",
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
