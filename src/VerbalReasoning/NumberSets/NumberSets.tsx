import React, { useEffect, useState } from "react";
import { Page } from "../../App";
import { Button } from "../../Button";
import { MessageNotification } from "../../MessageNotification";
import ProgressBar, { GreenToRedColorTransition } from "../../ProgressBar";
import { SettingsData } from "../../SaveData";
import { useClickChime, useCorrectChime, useFailureChime, useLightPingChime } from "../../Sounds";
import { Theme } from "../../Themes";
import { Sets } from "./Sets";

/** Config for a specific number set (exported for config from campaign) */
export type NumberSetConfigProps = {
  difficulty: "novice" | "easy" | "medium" | "hard" | "expert";
  correctAnswerDescription: string;
  examples: NumberSetTemplate[];
  question: NumberSetTemplate;
};

/** Config for a specific number set (exported for config from campaign) */
export type NumberSetTemplate = {
  numbersLeft: number[];
  numbersRight: number[];
  correctAnswer: number;
};

interface Props {
  defaultSet?: NumberSetConfigProps;
  numGuesses: number;
  timerConfig: { isTimed: false } | { isTimed: true; seconds: number };
  theme: Theme;
  settings: SettingsData;
  setPage: (page: Page) => void;
}

/** */
const NumberSets: React.FC<Props> = (props) => {
  const [inProgress, setInProgress] = useState(true);
  const [numberSet, setNumberSet] = useState<NumberSetConfigProps | undefined>(props.defaultSet);
  const [remainingGuesses, setRemainingGuesses] = useState(props.numGuesses);
  const [seconds, setSeconds] = useState(props.timerConfig.isTimed ? props.timerConfig.seconds : 0);
  const [playCorrectChimeSoundEffect] = useCorrectChime(props.settings);
  const [playFailureChimeSoundEffect] = useFailureChime(props.settings);
  const [playLightPingSoundEffect] = useLightPingChime(props.settings);
  const [playClickSoundEffect] = useClickChime(props.settings);

  // (Guess) Timer Setup
  React.useEffect(() => {
    if (!props.timerConfig.isTimed || !inProgress) {
      return;
    }

    const timerGuess = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      } else {
        playFailureChimeSoundEffect();
        setInProgress(false);
        clearInterval(timerGuess);
      }
    }, 1000);
    return () => {
      clearInterval(timerGuess);
    };
  }, [setSeconds, seconds, props.timerConfig.isTimed]);

  // Picks a random set if one was not passed in through the props
  React.useEffect(() => {
    if (props.defaultSet) {
      setNumberSet(props.defaultSet);
    } else {
      setNumberSet({ ...Object.values(Sets)[Math.round(Math.random() * (Object.values(Sets).length - 1))] });
    }
  }, [props.defaultSet]);

  function displayExamples() {
    if (!numberSet || !numberSet.examples) {
      return;
    }

    const numExamples = numberSet?.examples.length;

    if (numExamples === undefined || numExamples <= 0) {
      return;
    }

    return (
      <div className="number_set_wrapper">
        {Array.from({ length: numExamples }).map((_, i) => {
          const example = numberSet?.examples[i];

          if (!example) {
            return;
          }

          return (
            <div key={`example ${i}`} className="number_set_example">
              {`${example.numbersLeft} ( ${example.correctAnswer} ) ${example.numbersRight}`}
            </div>
          );
        })}
      </div>
    );
  }

  function displayQuestion() {
    if (!numberSet) {
      return;
    }

    const question = numberSet?.question;

    if (!question) {
      return;
    }

    return (
      <div className="number_set_question">
        {`${question.numbersLeft} (  ) ${question.numbersRight}`}
      </div>
    );
  }

  function displayOutcome(): React.ReactNode {
    // Game still in progress, don't display anything
    if (inProgress) {
      return;
    }

    let message_notification;
    const success_condition = true;

    if (success_condition) {
      message_notification = (
        <MessageNotification type="success">
          <strong>All words with the same letters found!</strong>
        </MessageNotification>
      );
    } else {
      message_notification = (
        <MessageNotification type="error">
          <strong>You didn't find the words with the same letters</strong>
        </MessageNotification>
      );
    }

    return (
      <>
        {message_notification}

        <br></br>

        <Button mode="accept" settings={props.settings} onClick={() => ResetGame()}>
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
    <div
      className="App number_sets"
      style={{ backgroundImage: `url(${props.theme.backgroundImageSrc})`, backgroundSize: "100%" }}
    >
      <div className="outcome">{displayOutcome()}</div>
      {inProgress && <MessageNotification type="default">{`Guesses left: ${remainingGuesses}`}</MessageNotification>}
      {inProgress && displayExamples()}
      {inProgress && displayQuestion()}
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

export default NumberSets;
