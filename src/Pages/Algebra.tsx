import React, { useState } from "react";
import { PageName } from "../PageNames";
import { Button } from "../Components/Button";
import GamemodeSettingsMenu from "../Components/GamemodeSettingsMenu";
import { Keyboard } from "../Components/Keyboard";
import LetterTile from "../Components/LetterTile";
import { MessageNotification } from "../Components/MessageNotification";
import { NumPad } from "../Components/NumPad";
import ProgressBar, { GreenToRedColorTransition } from "../Components/ProgressBar";
import { SaveData, SettingsData } from "../Data/SaveData";
import { useClickChime, useCorrectChime, useFailureChime, useLightPingChime } from "../Data/Sounds";
import { Theme } from "../Data/Themes";
import { getAlgebraTemplates } from "../Data/AlgebraTemplates";
import { LEVEL_FINISHING_TEXT } from "../Components/Level";
import { getGamemodeDefaultTimerValue } from "../Data/DefaultTimerValues";
import { MAX_NUMPAD_GUESS_LENGTH } from "../Data/GamemodeSettingsInputLimits";
import { DEFAULT_ALPHABET, DEFAULT_ALPHABET_STRING } from "./WingoConfig";
import { Difficulty, difficultyOptions } from "../Data/DefaultGamemodeSettings";

export type AlgebraConfigProps = {
  difficulty: Difficulty;
  inputs: number[];
  questions: QuestionTemplate[];
};

export type QuestionTemplate = {
  expression: string;
  answerType: "letter" | "number";
  correctAnswer: string;
};

export interface AlgebraProps {
  campaignConfig:
    | {
        isCampaignLevel: true;
        // How many questions must be answered correctly to pass the campaign level?
        targetScore: number;
      }
    | { isCampaignLevel: false };

  defaultTemplates?: AlgebraConfigProps[];

  gamemodeSettings: {
    numTemplates: number;
    difficulty: Difficulty;
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  };
}

interface Props extends AlgebraProps {
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
  if (numCorrectAnswers === 0) {
    return "error";
  }

  // Some answers correct
  return "default";
}

/** */
const Algebra = (props: Props) => {
  const [gamemodeSettings, setGamemodeSettings] = useState<AlgebraProps["gamemodeSettings"]>(props.gamemodeSettings);

  const [inProgress, setInProgress] = useState(true);
  const [guess, setGuess] = useState("");

  // All the algebra templates (usually multiple templates each with multiple questions)
  const [algebraTemplates, setAlgebraTemplates] = useState<AlgebraConfigProps[]>(
    props.defaultTemplates ?? getAlgebraTemplates(gamemodeSettings.numTemplates, gamemodeSettings.difficulty)
  );
  // What algebra template is currently being used?
  const [currentAlgebraTemplateIndex, setCurrentAlgebraTemplateIndex] = useState(0);
  // What question from the current algebra template is being presented?
  const [questionNumber, setQuestionNumber] = useState(0);
  // How many questions (across all templates) have been answered correctly?
  const [numCorrectAnswers, setNumCorrectAnswers] = useState(0);

  const [remainingSeconds, setRemainingSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig.seconds
      : getGamemodeDefaultTimerValue(props.page)
  );

  const [mostRecentTotalSeconds, setMostRecentTotalSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig.seconds
      : getGamemodeDefaultTimerValue(props.page)
  );

  // Sounds
  const [playCorrectChimeSoundEffect] = useCorrectChime(props.settings);
  const [playFailureChimeSoundEffect] = useFailureChime(props.settings);
  const [playLightPingSoundEffect] = useLightPingChime(props.settings);
  const [playClickSoundEffect] = useClickChime(props.settings);

  // Reset game after change of settings (stops cheating by changing settings partway through a game)
  React.useEffect(() => {
    if (props.campaignConfig.isCampaignLevel) {
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

  const getCurrentAlgebraTemplate = (): AlgebraConfigProps => {
    return algebraTemplates[currentAlgebraTemplateIndex];
  };

  const getCurrentQuestionTemplate = (): QuestionTemplate => {
    return getCurrentAlgebraTemplate().questions[questionNumber];
  };

  // Evaluate each guess
  React.useEffect(() => {
    if (inProgress) {
      return;
    }

    // The correct answer for the current question in the current template
    const answer = getCurrentQuestionTemplate().correctAnswer.toString();
    const successCondition = guess === answer;

    if (successCondition) {
      playCorrectChimeSoundEffect();
      setNumCorrectAnswers(numCorrectAnswers + 1);
    } else {
      playFailureChimeSoundEffect();
    }
  }, [inProgress, guess]);

  function displayInputs(): React.ReactNode {
    return (
      <div className="algebra_inputs_wrapper">
        {getCurrentAlgebraTemplate().inputs.map((input, index) => {
          const letter = DEFAULT_ALPHABET[index];

          return (
            <div key={`algebra_input ${letter}${input}`} className="algebra_input">
              <strong>{letter}</strong> = {input}
            </div>
          );
        })}
      </div>
    );
  }

  function displayQuestion(): React.ReactNode {
    const question = getCurrentQuestionTemplate();

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

    // The correct answer for the current question
    const answer = getCurrentQuestionTemplate().correctAnswer.toString();
    // Guess matches the answer
    const successCondition = guess.toString().toUpperCase() === answer.toUpperCase();

    // Show outcome of current question (and how many questions are left)
    const currentQuestionOutcome = (
      <>
        <MessageNotification type={successCondition ? "success" : "error"}>
          <strong>{successCondition ? "Correct!" : "Incorrect!"}</strong>
          <br />
          <span>{`${questionNumber + 1} / ${getTotalNumQuestions()} questions completed`}</span>
        </MessageNotification>
        <br />
      </>
    );

    // When the game has finished, show the number of correct answers
    const overallOutcome = (
      <>
        <MessageNotification type={getQuestionSetOutcome(numCorrectAnswers, getTotalNumQuestions())}>
          <strong>{`${numCorrectAnswers} / ${getTotalNumQuestions()} correct`}</strong>
        </MessageNotification>
        <br />
      </>
    );

    const restartButton = (
      <Button mode="accept" onClick={() => ResetGame()} settings={props.settings} additionalProps={{ autoFocus: true }}>
        {props.campaignConfig.isCampaignLevel ? LEVEL_FINISHING_TEXT : "Restart"}
      </Button>
    );

    const continueButton = (
      <Button
        mode="accept"
        onClick={() => ContinueGame()}
        settings={props.settings}
        additionalProps={{ autoFocus: true }}
      >
        Next
      </Button>
    );

    // If no more questions, show restart button, otherwise show continue button
    const nextButton = isGameOver() ? restartButton : continueButton;

    const outcome = (
      <>
        {isGameOver() && overallOutcome}
        {currentQuestionOutcome}
        {nextButton}
      </>
    );

    return outcome;
  }

  const getTotalNumQuestions = () => {
    // A number array with values of the number of questions in each template
    const templatesNumQuestions = algebraTemplates.map((template) => template.questions.length);
    // Sum of these values
    return templatesNumQuestions.reduce((previousValue, currentValue) => previousValue + currentValue, 0);
  };

  // Has the last question in the last template been guessed (all questions have been answered and there are no more questions)?
  const isGameOver = () => {
    const isLastQuestion = (questionNumber + 1) >= getTotalNumQuestions();
    return !inProgress && isLastQuestion;
  };

  // Restart with new set of questions
  function ResetGame() {
    if (isGameOver()) {
      const totalNumQuestions = getTotalNumQuestions();

      // Achieved target score if a campaign level, otherwise just all answers were correct
      const wasCorrect = props.campaignConfig.isCampaignLevel
        ? numCorrectAnswers >= Math.min(props.campaignConfig.targetScore, totalNumQuestions)
        : numCorrectAnswers === totalNumQuestions;
      props.onComplete(wasCorrect);
    }

    setInProgress(true);
    setGuess("");
    setNumCorrectAnswers(0);

    setAlgebraTemplates(getAlgebraTemplates(gamemodeSettings.numTemplates, gamemodeSettings.difficulty));
    setCurrentAlgebraTemplateIndex(0);
    setQuestionNumber(0);

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

    if (guess.length >= MAX_NUMPAD_GUESS_LENGTH) {
      return;
    }

    setGuess(letter);
  }

  function onSubmitNumber(number: number) {
    if (!inProgress) {
      return;
    }

    if (guess.length >= MAX_NUMPAD_GUESS_LENGTH) {
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
                difficulty: e.target.value as Difficulty,
              };
              setGamemodeSettings(newGamemodeSettings);
            }}
            className="difficulty_input"
            name="difficulty"
            value={gamemodeSettings.difficulty}
          >
            {difficultyOptions.map((difficultyOption) => (
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
      {!props.campaignConfig.isCampaignLevel && (
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
              : guess.toUpperCase() === getCurrentQuestionTemplate().correctAnswer.toString().toUpperCase()
              ? "correct"
              : "incorrect"
          }
          settings={props.settings}
        ></LetterTile>
      </div>
      {props.settings.gameplay.keyboard && getCurrentQuestionTemplate().answerType === "number" && (
        <NumPad
          onEnter={() => setInProgress(false)}
          onBackspace={onBackspace}
          onSubmitNumber={onSubmitNumber}
          settings={props.settings}
        />
      )}
      {props.settings.gameplay.keyboard && getCurrentQuestionTemplate().answerType === "letter" && inProgress && (
        <Keyboard
          onEnter={() => setInProgress(false)}
          onBackspace={onBackspace}
          settings={props.settings}
          onSubmitLetter={onSubmitLetter}
          customAlphabet={DEFAULT_ALPHABET_STRING.toLocaleUpperCase()
            .slice(0, getCurrentAlgebraTemplate().inputs.length)
            .split("")}
          targetWord=""
          page="Algebra"
          guesses={[]}
          letterStatuses={[]}
          inDictionary
          disabled={!inProgress}
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
