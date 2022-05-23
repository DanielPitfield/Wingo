import React, { useState } from "react";
import "./index.scss";
import { SettingsData } from "./SaveData";
import { Page } from "./App";
import CountdownLettersConfig from "./CountdownLetters/CountdownLettersConfig";
import CountdownNumbersConfig from "./CountdownNumbers/CountdownNumbersConfig";
import { Theme } from "./Themes";
import { displayGameshowSummary } from "./LingoGameshow";
import { Button } from "./Button";
import WordleConfig from "./WordleConfig";

interface Props {
  settings: SettingsData;
  setPage: (page: Page) => void;
  page: Page;
  themes: Theme[];
  setTheme: (theme: Theme) => void;
  addGold: (gold: number) => void;
  numSets: number;
  numLetterRoundsPerSet: number;
  numNumberRoundsPerSet: number;
  numConundrumRoundsPerSet: number;
  hasFinishingConundrum: boolean;

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

export const CountdownGameshow: React.FC<Props> = (props) => {
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
        <CountdownLettersConfig
          mode={"countdown_letters_casual"}
          timerConfig={{ isTimed: true, seconds: 2 }}
          defaultWordLength={9}
          page={"countdown/letters"}
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
        <CountdownNumbersConfig
          mode={"countdown_numbers_casual"}
          timerConfig={{ isTimed: true, seconds: 200 }}
          defaultNumOperands={6}
          defaultExpressionLength={5}
          defaultNumGuesses={5}
          page={"countdown/numbers"}
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
        <WordleConfig
          {...props.commonWingoProps}
          mode="conundrum"
          firstLetterProvided={false}
          showHint={false}
          timerConfig={{ isTimed: true, seconds: 30 }}
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
