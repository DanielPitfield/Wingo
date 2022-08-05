import React, { useState } from "react";
import { PageName } from "../PageNames";
import { Button } from "../Components/Button";
import GamemodeSettingsMenu from "../Components/GamemodeSettingsMenu";
import { DEFAULT_ALPHABET, Keyboard } from "../Components/Keyboard";
import LetterTile from "../Components/LetterTile";
import { MessageNotification } from "../Components/MessageNotification";
import { NumPad } from "../Components/NumPad";
import ProgressBar, { GreenToRedColorTransition } from "../Components/ProgressBar";
import { SaveData, SettingsData } from "../Data/SaveData";
import { useClickChime, useCorrectChime, useFailureChime, useLightPingChime } from "../Data/Sounds";
import { Theme } from "../Data/Themes";
import { AlgebraTemplates } from "../Data/AlgebraTemplates";
import { LEVEL_FINISHING_TEXT } from "../Components/Level";

export const algebraDifficulties = ["novice", "easy", "medium", "hard", "expert"] as const;
export type algebraDifficulty = typeof algebraDifficulties[number];
export const DEFAULT_DIFFICULTY: algebraDifficulty = "easy";

export type AlgebraConfigProps = {
  difficulty: algebraDifficulty;
  inputs: number[];
  questions: QuestionTemplate[];
};

export type QuestionTemplate = {
  expression: string;
  answerType: "letter" | "number";
  correctAnswer: string;
};

export interface AlgebraProps {
  defaultTemplate?: AlgebraConfigProps;

  gamemodeSettings?: {
    difficulty?: algebraDifficulty;
    timerConfig?: { isTimed: true; seconds: number } | { isTimed: false };
  };
}

interface Props extends AlgebraProps {
  isCampaignLevel: boolean;
  page: PageName;
  theme: Theme;
  settings: SettingsData;
  setPage: (page: PageName) => void;
  setTheme: (theme: Theme) => void;
  addGold: (gold: number) => void;
  onComplete: (wasCorrect: boolean) => void;
}

export function getQuestionSetOutcome(numCorrectAnswers: number, numQuestions: number) {
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

/** */
const Algebra: React.FC<Props> = (props) => {
  // Max number of characters permitted in a guess
  const MAX_LENGTH = 6;

  const [inProgress, setInProgress] = useState(true);
  const [guess, setGuess] = useState("");
  const [algebraTemplate, setAlgebraTemplate] = useState<AlgebraConfigProps | undefined>(props.defaultTemplate);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [numCorrectAnswers, setNumCorrectAnswers] = useState(0);

  const defaultGamemodeSettings = {
    difficulty: props.gamemodeSettings?.difficulty ?? DEFAULT_DIFFICULTY,
    timerConfig: props.gamemodeSettings?.timerConfig ?? { isTimed: false },
  };

  const [gamemodeSettings, setGamemodeSettings] = useState<{
    difficulty: algebraDifficulty;
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  }>(defaultGamemodeSettings);

  const DEFAULT_TIMER_VALUE = 100;
  const [remainingSeconds, setRemainingSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig.seconds
      : DEFAULT_TIMER_VALUE
  );

  const [mostRecentTotalSeconds, setMostRecentTotalSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig.seconds
      : DEFAULT_TIMER_VALUE
  );

  // Sounds
  const [playCorrectChimeSoundEffect] = useCorrectChime(props.settings);
  const [playFailureChimeSoundEffect] = useFailureChime(props.settings);
  const [playLightPingSoundEffect] = useLightPingChime(props.settings);
  const [playClickSoundEffect] = useClickChime(props.settings);

  // Reset game after change of settings (stops cheating by changing settings partway through a game)
  React.useEffect(() => {
    if (props.isCampaignLevel) {
      return;
    }

    ResetGame();

    // Save the latest gamemode settings for this mode
    SaveData.setAlgebraGamemodeSettings(gamemodeSettings);
  }, [gamemodeSettings]);

  // (Guess) Timer Setup
  React.useEffect(() => {
    if (!gamemodeSettings.timerConfig.isTimed || !inProgress) {
      return;
    }

    const timerGuess = setInterval(() => {
      if (remainingSeconds > 0) {
        setRemainingSeconds(remainingSeconds - 1);
      } else {
        playFailureChimeSoundEffect();
        setInProgress(false);
        clearInterval(timerGuess);
      }
    }, 1000);
    return () => {
      clearInterval(timerGuess);
    };
  }, [setRemainingSeconds, remainingSeconds, gamemodeSettings.timerConfig.isTimed]);

  // Picks a random template if one was not passed in through the props
  React.useEffect(() => {
    // TODO: Pick a random template which has the currently set difficulty
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
    const successCondition = guess.toString().toUpperCase() === answer?.toUpperCase();

    if (successCondition) {
      playCorrectChimeSoundEffect();
      setNumCorrectAnswers(numCorrectAnswers + 1);
    } else {
      playFailureChimeSoundEffect();
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
    const successCondition = guess.toString().toUpperCase() === answer.toUpperCase();

    // The number of questgions in this set of questions
    const numQuestions = algebraTemplate.questions.length;
    // Question was the last in the set of questions
    const lastQuestion = questionNumber === numQuestions - 1;

    return (
      <>
        {/* Show number of correct answers and restart button after last question */}
        {lastQuestion && (
          <>
            <MessageNotification type={getQuestionSetOutcome(numCorrectAnswers, numQuestions)}>
              <strong>{`${numCorrectAnswers} / ${numQuestions} correct`}</strong>
            </MessageNotification>

            <br></br>

            <Button
              mode="accept"
              onClick={() => ResetGame()}
              settings={props.settings}
              additionalProps={{ autoFocus: true }}
            >
              {props.isCampaignLevel ? LEVEL_FINISHING_TEXT : "Restart"}
            </Button>

            <br></br>
          </>
        )}

        {/* Show outcome of current question (and how many questions are left) */}
        <MessageNotification type={successCondition ? "success" : "error"}>
          <strong>{successCondition ? "Correct!" : "Incorrect!"}</strong>
          <br></br>
          <span>{`${questionNumber + 1} / ${numQuestions} questions completed`}</span>
        </MessageNotification>

        <br></br>

        {/* Show next button if there are more questions */}
        {!lastQuestion && (
          <Button
            mode="accept"
            onClick={() => ContinueGame()}
            settings={props.settings}
            additionalProps={{ autoFocus: true }}
          >
            Next
          </Button>
        )}
      </>
    );
  }

  // Restart with new set of questions
  function ResetGame() {
    // After last question in template set
    if (!inProgress && algebraTemplate && questionNumber === algebraTemplate.questions.length - 1) {
      // All questions answered correctly
      const wasCorrect = numCorrectAnswers === algebraTemplate.questions.length;
      props.onComplete(wasCorrect)
    }

    setInProgress(true);
    setGuess("");
    setAlgebraTemplate({
      ...Object.values(AlgebraTemplates)[Math.round(Math.random() * (Object.values(AlgebraTemplates).length - 1))],
    });
    setQuestionNumber(0);
    setNumCorrectAnswers(0);

    if (gamemodeSettings.timerConfig.isTimed) {
      // Reset the timer if it is enabled in the game options
      setRemainingSeconds(gamemodeSettings.timerConfig.seconds);
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

  function generateSettingsOptions(): React.ReactNode {
    return (
      <>
        <label>
          <select
            onChange={(e) => {
              const newGamemodeSettings = {
                ...gamemodeSettings,
                difficulty: e.target.value as algebraDifficulty,
              };
              setGamemodeSettings(newGamemodeSettings);
            }}
            className="difficulty_input"
            name="difficulty"
            value={gamemodeSettings.difficulty}
          >
            {algebraDifficulties.map((difficultyOption) => (
              <option key={difficultyOption} value={difficultyOption}>
                {difficultyOption}
              </option>
            ))}
          </select>
          Difficulty
        </label>

        <label>
          <input
            checked={gamemodeSettings.timerConfig.isTimed}
            type="checkbox"
            onChange={() => {
              // If currently timed, on change, make the game not timed and vice versa
              const newTimer: { isTimed: true; seconds: number } | { isTimed: false } = gamemodeSettings.timerConfig
                .isTimed
                ? { isTimed: false }
                : { isTimed: true, seconds: mostRecentTotalSeconds };
              const newGamemodeSettings = { ...gamemodeSettings, timerConfig: newTimer };
              setGamemodeSettings(newGamemodeSettings);
            }}
          ></input>
          Timer
        </label>
        {gamemodeSettings.timerConfig.isTimed && (
          <label>
            <input
              type="number"
              value={gamemodeSettings.timerConfig.seconds}
              min={10}
              max={120}
              step={5}
              onChange={(e) => {
                setRemainingSeconds(e.target.valueAsNumber);
                setMostRecentTotalSeconds(e.target.valueAsNumber);
                const newGamemodeSettings = {
                  ...gamemodeSettings,
                  timerConfig: { isTimed: true, seconds: e.target.valueAsNumber },
                };
                setGamemodeSettings(newGamemodeSettings);
              }}
            ></input>
            Seconds
          </label>
        )}
      </>
    );
  }

  return (
    <div
      className="App algebra"
      style={{ backgroundImage: `url(${props.theme.backgroundImageSrc})`, backgroundSize: "100% 100%" }}
    >
      {!props.isCampaignLevel && (
        <div className="gamemodeSettings">
          <GamemodeSettingsMenu>{generateSettingsOptions()}</GamemodeSettingsMenu>
        </div>
      )}
      <div className="outcome">{displayOutcome()}</div>
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
          showKeyboard={props.settings.gameplay.keyboard}
        />
      )}
      {algebraTemplate?.questions[questionNumber].answerType === "letter" && inProgress && (
        <Keyboard
          onEnter={() => setInProgress(false)}
          onBackspace={onBackspace}
          settings={props.settings}
          onSubmitLetter={onSubmitLetter}
          customAlphabet={"ABCDEFGHIJKLMNOPQRSTUVWXYZ".slice(0, algebraTemplate?.inputs.length).split("")}
          showBackspace={false}
          targetWord=""
          mode="Algebra"
          guesses={[]}
          letterStatuses={[]}
          inDictionary
          disabled={!inProgress}
          showKeyboard={props.settings.gameplay.keyboard}
        />
      )}
      <div>
        {gamemodeSettings.timerConfig.isTimed && (
          <ProgressBar
            progress={remainingSeconds}
            total={gamemodeSettings.timerConfig.seconds}
            display={{ type: "transition", colorTransition: GreenToRedColorTransition }}
          ></ProgressBar>
        )}
      </div>
    </div>
  );
};

export default Algebra;
