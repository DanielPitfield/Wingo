import React, { useState } from "react";
import { Page } from "../../App";
import { Button } from "../../Button";
import LetterTile from "../../LetterTile";
import { MessageNotification } from "../../MessageNotification";
import { NumPad } from "../../NumPad";
import ProgressBar, { GreenToRedColorTransition } from "../../ProgressBar";
import { SettingsData } from "../../SaveData";
import { useClickChime, useCorrectChime, useFailureChime, useLightPingChime } from "../../Sounds";
import { Theme } from "../../Themes";
import { generateSet } from "./Sets";

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
  // Max number of characters permitted in a guess
  const MAX_LENGTH = 6;

  const [inProgress, setInProgress] = useState(true);
  const [guess, setGuess] = useState("");
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
      const numberSet = generateSet();
      setNumberSet(numberSet);
      console.log(numberSet);
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

    return <div className="number_set_question">{`${question.numbersLeft} (  ) ${question.numbersRight}`}</div>;
  }

  function displayOutcome(): React.ReactNode {
    // Game still in progress, don't display anything
    if (inProgress) {
      return;
    }

    if (!numberSet) {
      return;
    }

    const answer = numberSet?.question.correctAnswer.toString();

    return (
      <>
        <MessageNotification type={guess === answer ? "success" : "error"}>
          <strong>{guess === answer ? "Correct!" : "Incorrect"}</strong>
          <br />
          {guess !== answer && (
            <span>
              The answer was <strong>{answer}</strong>
            </span>
          )}
        </MessageNotification>
      </>
    );
  }

  function ResetGame() {
    setInProgress(true);
    setGuess("");
    setRemainingGuesses(props.numGuesses);

    const numberSet = generateSet();
    setNumberSet(numberSet);
    console.log(numberSet);

    if (props.timerConfig.isTimed) {
      // Reset the timer if it is enabled in the game options
      setSeconds(props.timerConfig.seconds);
    }
  }

  function onBackspace() {
    if (guess.length === 0) {
      return;
    }

    setGuess(guess.substring(0, guess.length - 1));
  }

  function onSubmitNumber(number: number) {
    if (guess.length >= MAX_LENGTH) {
      return;
    }

    setGuess(`${guess}${number}`);
  }

  return (
    <div
      className="App number_sets"
      style={{ backgroundImage: `url(${props.theme.backgroundImageSrc})`, backgroundSize: "100%" }}
    >
      <div className="outcome">{displayOutcome()}</div>
      {!inProgress && (
        <Button mode="accept" onClick={() => ResetGame()} settings={props.settings}>
          Restart
        </Button>
      )}
      {inProgress && <MessageNotification type="default">{`Guesses left: ${remainingGuesses}`}</MessageNotification>}
      {displayExamples()}
      {displayQuestion()}
      <div className="guess">
        <LetterTile
          letter={guess}
          status={
            inProgress ? "not set" : guess === numberSet?.question.correctAnswer.toString() ? "correct" : "incorrect"
          }
          settings={props.settings}
        ></LetterTile>
      </div>
      <NumPad
        onEnter={() => setInProgress(false)}
        onBackspace={onBackspace}
        onSubmitNumber={onSubmitNumber}
        settings={props.settings}
      />
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
