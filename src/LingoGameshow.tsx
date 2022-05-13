import React, { useState } from "react";
import "./index.scss";
import { SettingsData } from "./SaveData";
import { Page } from "./App";
import { Theme } from "./Themes";
import WordleConfig, { getWordSummary } from "./WordleConfig";

interface Props {
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

export const LingoGameshow: React.FC<Props> = (props) => {
  const [inProgress, setInProgress] = useState(true);
  const [roundNumber, setRoundNumber] = useState(1);
  const [gameshowScore, setGameshowScore] = useState(0);
  const [wordLength, setWordLength] = useState(4);

  const lingoRounds = [
    /* --- ROUND 1 - FOUR LETTER LINGOS --- */

    // 4 rounds of four letter lingos (£200 for correct answer)
    { roundNumber: 1, isPuzzle: false, wordLength: 4, basePoints: 200, pointsLostPerGuess: 0 },
    { roundNumber: 2, isPuzzle: false, wordLength: 4, basePoints: 200, pointsLostPerGuess: 0 },
    { roundNumber: 3, isPuzzle: false, wordLength: 4, basePoints: 200, pointsLostPerGuess: 0 },
    { roundNumber: 4, isPuzzle: false, wordLength: 4, basePoints: 200, pointsLostPerGuess: 0 },

    // 9 letter puzzle word (starts at £300, -£40 for each revealed letter after first)
    { roundNumber: 5, isPuzzle: true, wordLength: 9, basePoints: 300, pointsLostPerGuess: 40 },

    /* --- ROUND 2 - FIVE LETTER LINGOS --- */

    // 3 rounds of five letter lingos (£300 for correct answer)
    { roundNumber: 6, isPuzzle: false, wordLength: 5, basePoints: 300, pointsLostPerGuess: 0 },
    { roundNumber: 7, isPuzzle: false, wordLength: 5, basePoints: 300, pointsLostPerGuess: 0 },
    { roundNumber: 8, isPuzzle: false, wordLength: 5, basePoints: 300, pointsLostPerGuess: 0 },

    // 10 letter puzzle word (starts at £400, -£60 for each revealed letter after first)
    { roundNumber: 9, isPuzzle: true, wordLength: 10, basePoints: 400, pointsLostPerGuess: 60 },

    /* --- ROUND 3 - FOUR AND FIVE LETTER LINGOS --- */

    // 2 rounds of four letter lingos (starts at £500, -£50 for each subsequent guess)
    { roundNumber: 10, isPuzzle: false, wordLength: 4, basePoints: 500, pointsLostPerGuess: 50 },
    { roundNumber: 11, isPuzzle: false, wordLength: 4, basePoints: 500, pointsLostPerGuess: 50 },

    // 11 letter puzzle word (starts at £750, -£130 for each revealed letter after first)
    { roundNumber: 12, isPuzzle: true, wordLength: 11, basePoints: 750, pointsLostPerGuess: 130 },

    // 2 rounds of five letter lingos (starts at £500, -£50 for each subsequent guess)
    { roundNumber: 13, isPuzzle: false, wordLength: 4, basePoints: 500, pointsLostPerGuess: 50 },
    { roundNumber: 14, isPuzzle: false, wordLength: 4, basePoints: 500, pointsLostPerGuess: 50 },

    // 11 letter puzzle word (starts at £750, -£130 for each revealed letter after first)
    { roundNumber: 15, isPuzzle: true, wordLength: 11, basePoints: 750, pointsLostPerGuess: 130 },

    /* --- ROUND 4 - FINAL (90 seconds) --- */

    // Four letter lingo (for half of basePoints earned so far)
    { roundNumber: 16, isPuzzle: false, wordLength: 4, basePoints: 0, pointsLostPerGuess: 0 },
    // Five letter lingo (for all basePoints earned so far)
    { roundNumber: 17, isPuzzle: false, wordLength: 5, basePoints: 0, pointsLostPerGuess: 0 },
    // Six letter lingo (for double of basePoints earned so far)
    { roundNumber: 18, isPuzzle: false, wordLength: 6, basePoints: 0, pointsLostPerGuess: 0 },
  ];

  const [summary, setSummary] = useState<{ roundNumber: number; answer: string; score: number }[]>([]);

  function onComplete(wasCorrect: boolean, answer: string, score?: number | null) {
    // Incorrect answer or score couldn't be determined, use score of 0
    const newScore = !wasCorrect || !score || score === undefined ? 0 : score;

    const roundSummary = { roundNumber: roundNumber, answer: answer, score: newScore };

    // Update summary with answer and score for current round
    let newSummary = summary.slice();
    newSummary.push(roundSummary);

    setSummary(newSummary);

    // Increment round number if there are more rounds to go
    if (roundNumber < 2) {
      setRoundNumber(roundNumber + 1);
    } else {
      setInProgress(false);
    }

    if (!wasCorrect) {
      return;
    }

    // Score for completed round couldn't be determined
    if ((score === null && score !== 0) || score === undefined) {
      setInProgress(false);
      return;
    }

    // Update cumulative score
    setGameshowScore(gameshowScore + score);

    return;
  }

  React.useEffect(() => {
    // TODO: Configure total length of custom wingo gameshow, how many 4,5,6 wordLength wingo rounds and how many puzzle wingo rounds (from lobby menu)

    const nextRoundInfo = lingoRounds.find((roundInfo) => roundInfo.roundNumber === roundNumber);

    // Missing required information for next round
    if (!nextRoundInfo || !nextRoundInfo.wordLength) {
      setInProgress(false);
      return;
    }

    // Before loading round, set the word length needed
    setWordLength(nextRoundInfo?.wordLength);
  }, [roundNumber]);

  function getNextRound() {
    const nextRoundInfo = lingoRounds.find((roundInfo) => roundInfo.roundNumber === roundNumber);

    // Missing required information for next round
    if (!nextRoundInfo || !nextRoundInfo.wordLength) {
      setInProgress(false);
      return;
    }

    console.log(nextRoundInfo);

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
          keyboard={true}
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
          keyboard={true}
          defaultWordLength={wordLength}
          enforceFullLengthGuesses={true}
          roundScoringInfo={roundScoringInfo}
          gameshowScore={gameshowScore}
        />
      );
    }
  }

  function getGameshowSummary() {
    return summary.map((round) => {
      const roundSummary = (
        <>
          <br></br>
          <strong>{`Round ${round.roundNumber}`}</strong>
          <br></br>
          {`Answer: ${round.answer}`}
          <br></br>
          {`Score: ${round.score}`}
        </>
      );
      return (
        <div className="gameshow-round-summary" style={{ backgroundColor: round.score > 0 ? "green" : "red" }}>
          {roundSummary}
        </div>
      );
    });
  }

  return <>{inProgress ? getNextRound() : <div className="gameshow-summary-container">{getGameshowSummary()}</div>}</>;
};
