import React, { useState } from "react";
import "./index.scss";
import { SettingsData } from "./SaveData";
import { Page } from "./App";
import CountdownLettersConfig from "./CountdownLetters/CountdownLettersConfig";
import CountdownNumbersConfig from "./CountdownNumbers/CountdownNumbersConfig";
import { Theme } from "./Themes";
import { displayGameshowSummary } from "./LingoGameshow";
import { Button } from "./Button";

interface Props {
  settings: SettingsData;
  setPage: (page: Page) => void;
  page: Page;
  themes: Theme[];
  setTheme: (theme: Theme) => void;
  addGold: (gold: number) => void;
}

export const CountdownGameshow: React.FC<Props> = (props) => {
  const [inProgress, setInProgress] = useState(true);
  const [roundNumber, setRoundNumber] = useState(1);
  const [gameshowScore, setGameshowScore] = useState(0);
  const [summary, setSummary] = useState<
    { roundNumber: number; wasCorrect: boolean; answer: string; targetAnswer: string; score: number }[]
  >([]);

  // TODO: 14 without conundrum, 15 with
  const NUM_COUNTDOWN_ROUNDS = 6;

  React.useEffect(() => {
    if (!summary || summary.length === 0) {
      return;
    }

    const totalScore = summary.map((round) => round.score).reduce((prev, next) => prev + next);
    setGameshowScore(totalScore);
  }, [summary]);

  React.useEffect(() => {
    if (roundNumber > NUM_COUNTDOWN_ROUNDS) {
      setInProgress(false);
    }
  }, [roundNumber]);

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

  function getNextRound() {
    // TODO: Configure total length of custom countdown gameshow, how many letter rounds and how many number rounds (from lobby menu)

    // https://wiki.apterous.org/15_round_format_(new)
    const numberRounds = [3, 6, 9, 14];

    if (!numberRounds.includes(roundNumber)) {
      return (
        <CountdownLettersConfig
          mode={"countdown_letters_casual"}
          timerConfig={{ isTimed: true, seconds: 2 }}
          keyboard={true}
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
    } else {
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
    }
  }

  return (
    <>
      {inProgress ? getNextRound() : displayGameshowSummary(gameshowScore, summary)}
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
