import React, { useState } from "react";
import { Page } from "../App";
import { Button } from "../Button";
import { MessageNotification } from "../MessageNotification";
import { shuffleArray } from "../NumbersArithmetic/ArithmeticDrag";
import ProgressBar, { GreenToRedColorTransition } from "../ProgressBar";

interface Props {
  numGroups: number;
  groupSize: number;
  numGuesses: number;
  timerConfig: { isTimed: false } | { isTimed: true; seconds: number };
  setPage: (page: Page) => void;
}

/** */
const GroupWall: React.FC<Props> = (props) => {
  const [inProgress, setInProgress] = useState(true);
  const [remainingGuesses, setRemainingGuesses] = useState(props.numGuesses);
  const [seconds, setSeconds] = useState(props.timerConfig.isTimed ? props.timerConfig.seconds : 0);

  // (Guess) Timer Setup
  React.useEffect(() => {
    if (!props.timerConfig.isTimed || !inProgress) {
      return;
    }

    const timerGuess = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      } else {
        setInProgress(false);
      }
    }, 1000);
    return () => {
      clearInterval(timerGuess);
    };
  }, [setSeconds, seconds, props.timerConfig.isTimed]);

  function displayGrid() {
    var Grid = [];

    Grid.push(
      <div className="">
        
      </div>
    );

    return Grid;
  }

  /**
   *
   * @returns
   */
  function displayOutcome(): React.ReactNode {
    // Game still in progress, don't display anything
    if (inProgress) {
      return;
    }

    return (
      <>
        <MessageNotification type="default">
          <strong>
            
          </strong>
        </MessageNotification>

        <br></br>

        <Button mode="accept" onClick={() => ResetGame()}>
          Restart
        </Button>
      </>
    );
  }

  function ResetGame() {
    setInProgress(true);
    setRemainingGuesses(props.numGuesses);

    if (props.timerConfig.isTimed) {
      // Reset the timer if it is enabled in the game options
      setSeconds(props.timerConfig.seconds);
    }
  }

  return (
    <div className="App only_connect_wall">
      <div className="outcome">{displayOutcome()}</div>
      {inProgress && <MessageNotification type="default">{`Guesses left: ${remainingGuesses}`}</MessageNotification>}
      <div className="only_connect_wall">{displayGrid()}</div>
      <div>
        {props.timerConfig.isTimed && (
          <ProgressBar
            progress={seconds}
            total={props.timerConfig.seconds}
            display={{ type: "transition", colorTransition: GreenToRedColorTransition }}
          ></ProgressBar>
        )}
      </div>
    </div>
  );
};

export default GroupWall;