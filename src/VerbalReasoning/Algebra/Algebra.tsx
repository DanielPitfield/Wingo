import React, { useState } from "react";
import { Page } from "../../App";
import { Button } from "../../Button";
import { Alphabet } from "../../Keyboard";
import LetterTile from "../../LetterTile";
import { MessageNotification } from "../../MessageNotification";
import { NumPad } from "../../NumPad";
import ProgressBar, { GreenToRedColorTransition } from "../../ProgressBar";
import { SettingsData } from "../../SaveData";
import { useClickChime, useCorrectChime, useFailureChime, useLightPingChime } from "../../Sounds";
import { Theme } from "../../Themes";
import { AlgebraTemplates } from "./AlgebraTemplates";

export type AlegbraConfigProps = {
  difficulty: "novice" | "easy" | "medium" | "hard" | "expert";
  inputs: number[];
  questions: QuestionTemplate[];
};

export type QuestionTemplate = {
  expression: string;
  answerType: "letter" | "number";
  correctAnswer: string | number;
};

interface Props {
  defaultTemplate?: AlegbraConfigProps;
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
  const [algebraTemplate, setAlgebraTemplate] = useState<AlegbraConfigProps | undefined>(props.defaultTemplate);
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
    if (props.defaultTemplate) {
      setAlgebraTemplate(props.defaultTemplate);
    } else {
      setAlgebraTemplate({ ...Object.values(AlgebraTemplates)[Math.round(Math.random() * (Object.values(AlgebraTemplates).length - 1))] });
    }
  }, [props.defaultTemplate]);

  function displayInputs() {
    if (!algebraTemplate || !algebraTemplate.inputs) {
      return;
    }

    const numInputs = algebraTemplate.inputs.length;

    if (numInputs === undefined || numInputs <= 0) {
      return;
    }

    return (
      <div className="alegbra_inputs_wrapper">
        {Array.from({ length: numInputs }).map((_, i) => {
          const letter = Alphabet[i];
          const number = algebraTemplate.inputs[i];

          if (!letter || !number) {
            return;
          }

          return (
            <div key={`alegbra_input ${letter}${number}`} className="alegbra_input">
              {`${letter} = ${number}`}
            </div>
          );
        })}
      </div>
    );
  }

  function displayQuestions() {
    if (!algebraTemplate || !algebraTemplate.questions) {
      return;
    }

    const numQuestions = algebraTemplate.inputs.length;

    if (numQuestions === undefined || numQuestions <= 0) {
      return;
    }

    return (
      <div className="alegbra_questions_wrapper">
        {Array.from({ length: numQuestions }).map((_, i) => {
          const question = algebraTemplate.questions[i];

          if (!question || !question.expression || !question.answerType || !question.correctAnswer) {
            return;
          }

          return (
            <div key={`alegbra_question ${i}`} className="alegbra_question">
              {`${question.expression} (Answer type: ${question.answerType})`}
            </div>
          );
        })}
      </div>
    );

  }

  function displayOutcome(): React.ReactNode {
    // Game still in progress, don't display anything
    if (inProgress) {
      return;
    }

    if (!algebraTemplate) {
      return;
    }

    //const answer = numberSet?.question.correctAnswer.toString();

    return (
      <>
        <MessageNotification type="success">

        </MessageNotification>
      </>
    );
  }

  function ResetGame() {
    setInProgress(true);
    setGuess("");
    setAlgebraTemplate({ ...Object.values(AlgebraTemplates)[Math.round(Math.random() * (Object.values(AlgebraTemplates).length - 1))] });
    setRemainingGuesses(props.numGuesses);

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
      {displayInputs()}
      {displayQuestions()}
      <div className="guess">
        <LetterTile
          letter={guess}
          status={
            "not set"
            //inProgress ? "not set" : guess === numberSet?.question.correctAnswer.toString() ? "correct" : "incorrect"
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
