import React, { useState } from "react";
import { Page } from "../../App";
import { Button } from "../../Button";
import { DEFAULT_ALPHABET, Keyboard } from "../../Keyboard";
import LetterTile from "../../LetterTile";
import { MessageNotification } from "../../MessageNotification";
import { NumPad } from "../../NumPad";
import ProgressBar, { GreenToRedColorTransition } from "../../ProgressBar";
import { SettingsData } from "../../SaveData";
import { useClickChime, useCorrectChime, useFailureChime, useLightPingChime } from "../../Sounds";
import { Theme } from "../../Themes";
import { AlgebraTemplates } from "./AlgebraTemplates";

export type AlgebraConfigProps = {
  difficulty: "novice" | "easy" | "medium" | "hard" | "expert";
  inputs: number[];
  questions: QuestionTemplate[];
};

export type QuestionTemplate = {
  expression: string;
  answerType: "letter" | "number";
  correctAnswer: string;
};

interface Props {
  defaultTemplate?: AlgebraConfigProps;
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
  const [algebraTemplate, setAlgebraTemplate] = useState<AlgebraConfigProps | undefined>(props.defaultTemplate);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [numCorrectAnswers, setNumCorrectAnswers] = useState(0);
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

  // Picks a random template if one was not passed in through the props
  React.useEffect(() => {
    const template = props.defaultTemplate || {
      ...Object.values(AlgebraTemplates)[Math.round(Math.random() * (Object.values(AlgebraTemplates).length - 1))],
    };

    setAlgebraTemplate(template);
    console.log(template);
  }, [props.defaultTemplate]);

  // Each time a guess is submitted
  React.useEffect(() => {
    if (inProgress) {
      return;
    }

    if (!guess || guess.length < 1) {
      return;
    }

    // The correct answer for the current question
    const answer = algebraTemplate?.questions[questionNumber].correctAnswer.toString();
    // Guess matches the answer
    const success_condition = guess.toString().toUpperCase() === answer?.toUpperCase();

    if (success_condition) {
      setNumCorrectAnswers(numCorrectAnswers + 1);
    }

  }, [inProgress, guess]);

  function displayInputs() {
    if (!algebraTemplate || !algebraTemplate.inputs) {
      return;
    }

    const numInputs = algebraTemplate.inputs.length;

    if (numInputs === undefined || numInputs <= 0) {
      return;
    }

    return (
      <div className="algebra_inputs_wrapper">
        {Array.from({ length: numInputs }).map((_, i) => {
          const letter = DEFAULT_ALPHABET[i];
          const number = algebraTemplate.inputs[i];

          if (!letter || !number) {
            return;
          }

          return (
            <div key={`algebra_input ${letter}${number}`} className="algebra_input">
              <strong>{letter}</strong> = {number}
            </div>
          );
        })}
      </div>
    );
  }

  function displayQuestion() {
    if (!algebraTemplate) {
      return;
    }

    const question = algebraTemplate.questions[questionNumber];

    if (!question || !question.expression || !question.answerType || !question.correctAnswer) {
      return;
    }

    return (
      <div className="algebra_questions_wrapper">
        <div className="algebra_question">
          <strong>{question.expression}</strong>
        </div>
        <div className="algebra_question_type">
          Answer type: <strong>{question.answerType}</strong>
        </div>
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

    // The correct answer for the current question
    const answer = algebraTemplate.questions[questionNumber].correctAnswer.toString();
    // Guess matches the answer
    const success_condition = guess.toString().toUpperCase() === answer.toUpperCase();

    // The number of questgions in this set of questions
    const numQuestions = algebraTemplate.questions.length;
    // Question was the last in the set of questions
    const set_finished = questionNumber === (numQuestions - 1);

    function getQuestionSetOutcome() {
      // All questions in the set answered correctly
      if (numCorrectAnswers === numQuestions) {
        return "success";
      }
      // No answers correct
      else if (numCorrectAnswers === 0) {
        return "error";
      }
      // Some answers correct
      else {
        return "default";
      }
    }

    return (
      <>
        {set_finished && (
          <MessageNotification type={getQuestionSetOutcome()}>
            <strong>{`${numCorrectAnswers} / ${numQuestions} correct`}</strong>
          </MessageNotification>
        )}

        <br></br>

        <MessageNotification type={success_condition ? "success" : "error"}>
          <strong>{success_condition ? "Correct!" : "Incorrect"}</strong>
          <br />
          {!success_condition && (
            <span>
              The answer was <strong>{answer}</strong>
            </span>
          )}
        </MessageNotification>
      </>
    );
  }

  // Restart with new set of questions
  function ResetGame() {
    setInProgress(true);
    setGuess("");
    setAlgebraTemplate({
      ...Object.values(AlgebraTemplates)[Math.round(Math.random() * (Object.values(AlgebraTemplates).length - 1))],
    });
    setRemainingGuesses(props.numGuesses);
    setQuestionNumber(0);
    setNumCorrectAnswers(0);

    if (props.timerConfig.isTimed) {
      // Reset the timer if it is enabled in the game options
      setSeconds(props.timerConfig.seconds);
    }
  }

  // Next question
  function ContinueGame() {
    setInProgress(true);
    setGuess("");
    setQuestionNumber(questionNumber + 1);
  }

  function onBackspace() {
    if (!inProgress) {
      return;
    }

    if (guess.length === 0) {
      return;
    }

    setGuess(guess.substring(0, guess.length - 1));
  }

  function onSubmitLetter(letter: string) {
    if (!inProgress) {
      return;
    }

    if (guess.length >= MAX_LENGTH) {
      return;
    }

    setGuess(letter);
  }

  function onSubmitNumber(number: number) {
    if (!inProgress) {
      return;
    }

    if (guess.length >= MAX_LENGTH) {
      return;
    }

    setGuess(`${guess}${number}`);
  }

  return (
    <div
      className="App algebra"
      style={{ backgroundImage: `url(${props.theme.backgroundImageSrc})`, backgroundSize: "100%" }}
    >
      <div className="outcome">{displayOutcome()}</div>
      {!inProgress && questionNumber === (algebraTemplate?.questions.length! - 1) && (
        <Button mode="accept" onClick={() => ResetGame()} settings={props.settings}>
          Restart
        </Button>
      )}
      {!inProgress && questionNumber !== (algebraTemplate?.questions.length! - 1) && (
        <Button mode="accept" onClick={() => ContinueGame()} settings={props.settings}>
          Next
        </Button>
      )}
      {inProgress && <MessageNotification type="default">{`Guesses left: ${remainingGuesses}`}</MessageNotification>}
      {displayInputs()}
      {displayQuestion()}
      <div className="guess">
        <LetterTile
          letter={guess}
          status={
            inProgress
              ? "not set"
              : guess.toUpperCase() ===
                algebraTemplate?.questions[questionNumber].correctAnswer.toString().toUpperCase()
              ? "correct"
              : "incorrect"
          }
          settings={props.settings}
        ></LetterTile>
      </div>
      {algebraTemplate?.questions[questionNumber].answerType === "number" && (
        <NumPad
          onEnter={() => setInProgress(false)}
          onBackspace={onBackspace}
          onSubmitNumber={onSubmitNumber}
          settings={props.settings}
        />
      )}
      {algebraTemplate?.questions[questionNumber].answerType === "letter" && (
        <Keyboard
          onEnter={() => setInProgress(false)}
          onBackspace={onBackspace}
          settings={props.settings}
          onSubmitLetter={onSubmitLetter}
          customAlphabet={"ABCDEFGHIJKLMNOPQRSTUVWXYZ".slice(0, algebraTemplate?.inputs.length).split("")}
          showBackspace={false}
          targetWord=""
          mode=""
          guesses={[]}
          letterStatuses={[]}
          inDictionary
        />
      )}
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
