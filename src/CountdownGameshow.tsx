import React, { useState } from "react";
import "./index.scss";
import { SettingsData } from "./SaveData";
import { Page } from "./App";
import CountdownLettersConfig from "./CountdownLetters/CountdownLettersConfig";
import { Theme } from "./Themes";
import CountdownNumbersConfig from "./CountdownNumbers/CountdownNumbersConfig";

interface Props {
  settings: SettingsData;
  setPage: (page: Page) => void;
  page: Page;
  themes: Theme[];
  setTheme: (theme: Theme) => void;
  addGold: (gold: number) => void;
  onComplete?: (wasCorrect: boolean, score: number | null) => void;
}

export const CountdownGameshow: React.FC<Props> = (props) => {
  const [inProgress, setInProgress] = useState(true);
  const [roundNumber, setRoundNumber] = useState(1);
  const [gameshowScore, setGameshowScore] = useState(0);

  function onComplete(wasCorrect: boolean, score?: number | null) {
    // Score for completed round couldn't be determined
    if ((score === null && score !== 0) || score === undefined) {
      setInProgress(false);
      return;
    }

    if (inProgress) {
      // Update cumulative score
      setGameshowScore(gameshowScore + score);

      // Increment round number if there are more rounds to go
      if (roundNumber < 14) {
        setRoundNumber(roundNumber + 1);
      } else {
        // TODO: Gameshow summary page?
        setInProgress(false);
      }

      return;
    }
  }

  function getNextRound() {
    if (!inProgress) {
      return;
    }

    // TODO: Configure total length of countdown gameshow, how many letter rounds and how many number rounds (from lobby menu)

    // https://wiki.apterous.org/15_round_format_(new)
    const numberRounds = [3, 6, 9, 14];

    if (!numberRounds.includes(roundNumber)) {
      return (
        <CountdownLettersConfig
          mode={"countdown_letters_casual"}
          timerConfig={{ isTimed: true, seconds: 30 }}
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
          timerConfig={{ isTimed: true, seconds: 30 }}
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

  return <>{getNextRound()}</>;
};
