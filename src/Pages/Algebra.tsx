import React, { useState } from "react";
import { Button } from "../Components/Button";
import { Keyboard } from "../Components/Keyboard";
import LetterTile from "../Components/LetterTile";
import { MessageNotification } from "../Components/MessageNotification";
import { NumPad } from "../Components/NumPad";
import ProgressBar, { GreenToRedColorTransition } from "../Components/ProgressBar";
import { SaveData, SettingsData } from "../Data/SaveData";
import { useClickChime, useCorrectChime, useFailureChime, useLightPingChime } from "../Data/Sounds";
import { Theme } from "../Data/Themes";
import { AlgebraTemplate, answerType, AlgebraQuestion } from "../Data/AlgebraTemplates";
import { LEVEL_FINISHING_TEXT } from "../Components/Level";
import { MAX_NUMPAD_GUESS_LENGTH } from "../Data/GamemodeSettingsInputLimits";
import { DEFAULT_ALPHABET, DEFAULT_ALPHABET_STRING } from "./WingoConfig";
import { Difficulty } from "../Data/DefaultGamemodeSettings";
import { getAlgebraTemplates } from "../Helpers/getAlgebraTemplates";
import { getGamemodeDefaultTimerValue } from "../Helpers/getGamemodeDefaultTimerValue";
import { getQuestionSetOutcome } from "../Helpers/getQuestionSetOutcome";
import { getNewGamemodeSettingValue } from "../Helpers/getGamemodeSettingsNewValue";
import AlgebraGamemodeSettings from "../Components/GamemodeSettingsOptions/AlgebraGamemodeSettings";
import { useLocation } from "react-router-dom";
import { PagePath } from "../Data/PageNames";
import { useCountdown } from "usehooks-ts";

export interface AlgebraProps {
  campaignConfig:
    | {
        isCampaignLevel: true;
        // How many questions must be answered correctly to pass the campaign level?
        targetScore: number;
      }
    | { isCampaignLevel: false };

  defaultTemplates?: AlgebraTemplate[];

  gamemodeSettings: {
    numTemplates: number;
    difficulty: Difficulty;
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  };
}

interface Props extends AlgebraProps {
  theme: Theme;
  settings: SettingsData;
  setTheme: (theme: Theme) => void;
  addGold: (gold: number) => void;
  onComplete: (wasCorrect: boolean) => void;
}

const Algebra = (props: Props) => {
  const location = useLocation().pathname as PagePath;

  const [gamemodeSettings, setGamemodeSettings] = useState<AlgebraProps["gamemodeSettings"]>(props.gamemodeSettings);

  const [inProgress, setInProgress] = useState(true);
  const [guess, setGuess] = useState("");

  // All the algebra templates (usually multiple templates each with multiple questions)
  const [algebraTemplates, setAlgebraTemplates] = useState<AlgebraTemplate[]>(
    props.defaultTemplates ?? getAlgebraTemplates(gamemodeSettings.numTemplates, gamemodeSettings.difficulty)
  );

  // What algebra template is currently being used?
  const [templateIndex, setTemplateIndex] = useState(0);
  // What question from the current algebra template is being presented?
  const [questionIndex, setQuestionIndex] = useState(0);

  // How many questions (across all templates) have been answered correctly?
  const [numCorrectAnswers, setNumCorrectAnswers] = useState(0);

  const [totalSeconds, setTotalSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig?.seconds
      : getGamemodeDefaultTimerValue(location)
  );

  const [remainingSeconds, { startCountdown, stopCountdown, resetCountdown }] = useCountdown({
    countStart: totalSeconds,
    countStop: 0,
    intervalMs: 1000,
  });

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

  // Start timer
  React.useEffect(() => {
    if (!gamemodeSettings.timerConfig.isTimed) {
      return;
    }

    startCountdown();
  }, [gamemodeSettings.timerConfig.isTimed, resetCountdown]);

  // Check for when timer ends
  // TODO: stopCountdown() in dependency array?
  React.useEffect(() => {
    if (!gamemodeSettings.timerConfig.isTimed) {
      return;
    }

    if (!inProgress) {
      return;
    }

    if (remainingSeconds <= 0) {
      playFailureChimeSoundEffect();
      setInProgress(false);
    }
  }, [remainingSeconds]);

  // Reset timer back to full (when the total time value is changed)
  React.useEffect(() => {
    resetCountdown();
  }, [setTotalSeconds]);

  const getCurrentAlgebraTemplate = (): AlgebraTemplate => {
    return algebraTemplates[templateIndex];
  };

  const getCurrentQuestionTemplate = (): AlgebraQuestion => {
    return getCurrentAlgebraTemplate().questions[questionIndex];
  };

  const isGuessCorrect = (): Boolean => {
    const correctAnswers = getCurrentQuestionTemplate().correctAnswers.map((answer) => answer.toUpperCase());
    return correctAnswers.includes(guess.toUpperCase());
  };

  const isLastQuestionInTemplate = (): Boolean => {
    const currentTemplateQuestions = getCurrentAlgebraTemplate().questions;
    return getCurrentQuestionTemplate() === currentTemplateQuestions[currentTemplateQuestions.length - 1];
  };

  // Evaluate each guess
  React.useEffect(() => {
    if (inProgress) {
      return;
    }

    if (isGuessCorrect()) {
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

  // Have all the questions been answered (there are no more questions)?
  const isGameOver = () => {
    const allQuestionsCompleted = getCompletedNumQuestions() >= getTotalNumQuestions();
    return !inProgress && allQuestionsCompleted;
  };

  function displayOutcome(): React.ReactNode {
    // Game still in progress, don't display anything
    if (inProgress) {
      return;
    }

    // Show outcome of current question (and how many questions are left)
    const currentQuestionOutcome = (
      <>
        <MessageNotification type={isGuessCorrect() ? "success" : "error"}>
          <strong>{isGuessCorrect() ? "Correct!" : "Incorrect!"}</strong>
          <br />

          {!isGuessCorrect() && (
            <span>
              The answers were: <strong>{getCurrentQuestionTemplate().correctAnswers.join(" , ")}</strong>
            </span>
          )}
          <br />

          {getCompletedNumQuestions() < getTotalNumQuestions() && (
            <span>{`${getCompletedNumQuestions()} / ${getTotalNumQuestions()} questions completed`}</span>
          )}
        </MessageNotification>
        <br />
      </>
    );

    // The number of correct answers needed for a successful outcome
    const targetScore = props.campaignConfig.isCampaignLevel
      ? Math.min(props.campaignConfig.targetScore, getTotalNumQuestions())
      : getTotalNumQuestions();

    // When the game has finished, show the total number of correct answers
    const overallOutcome = (
      <>
        <MessageNotification
          type={getQuestionSetOutcome(numCorrectAnswers, targetScore, props.campaignConfig.isCampaignLevel)}
        >
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

  const getCompletedNumQuestions = () => {
    // The number of completed questions from current template
    let count = questionIndex + 1;

    if (templateIndex === 0) {
      return count;
    }

    // Add on the number of completed questions from previous sets
    for (let i = 0; i < templateIndex; i++) {
      count += algebraTemplates[templateIndex].questions.length;
    }

    return count;
  };

  const getTotalNumQuestions = () => {
    // A number array with values of the number of questions in each template
    const templatesNumQuestions = algebraTemplates.map((template) => template.questions.length);
    // Sum of these values
    return templatesNumQuestions.reduce((previousValue, currentValue) => previousValue + currentValue, 0);
  };

  // Restart with new set of questions
  function ResetGame() {
    if (isGameOver()) {
      // Achieved target score if a campaign level, otherwise just all answers were correct
      const wasCorrect = props.campaignConfig.isCampaignLevel
        ? numCorrectAnswers >= Math.min(props.campaignConfig.targetScore, getTotalNumQuestions())
        : numCorrectAnswers === getTotalNumQuestions();
      props.onComplete(wasCorrect);
    }

    setInProgress(true);
    setGuess("");

    setAlgebraTemplates(getAlgebraTemplates(gamemodeSettings.numTemplates, gamemodeSettings.difficulty));

    setTemplateIndex(0);
    setQuestionIndex(0);
    setNumCorrectAnswers(0);

    if (gamemodeSettings.timerConfig.isTimed) {
      // Reset the timer if it is enabled in the game options
      resetCountdown();
    }
  }

  // Next question
  function ContinueGame() {
    setInProgress(true);
    setGuess("");

    // Just completed last question in a template
    if (isLastQuestionInTemplate()) {
      // Use next template and start from first question
      setTemplateIndex(templateIndex + 1);
      setQuestionIndex(0);
    }
    // More questions from this template
    else {
      // Just use next question
      setQuestionIndex(questionIndex + 1);
    }
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

    const currentAnswerType: answerType = getCurrentQuestionTemplate().answerType;

    // Letters not allowed when answer type is "number" (numPad shouldn't appear anyway, but just in case)
    if (currentAnswerType === "number") {
      return;
    }

    if (guess.length >= MAX_NUMPAD_GUESS_LENGTH) {
      return;
    }

    // Append
    if (currentAnswerType === "combination") {
      setGuess(`${guess}${letter}`);
    }
    // Replace
    else {
      setGuess(letter);
    }
  }

  function onSubmitNumber(number: number) {
    if (!inProgress) {
      return;
    }

    // Numbers not allowed when answer type is "letter" (keyboard shouldn't appear anyway, but just in case)
    if (getCurrentQuestionTemplate().answerType === "letter") {
      return;
    }

    if (guess.length >= MAX_NUMPAD_GUESS_LENGTH) {
      return;
    }

    // Always append
    setGuess(`${guess}${number}`);
  }

  function displayInputMethods(): React.ReactNode {
    if (!props.settings.gameplay.keyboard) {
      return;
    }

    const answerType: answerType = getCurrentQuestionTemplate().answerType;

    const letterKeyboard = (
      <Keyboard
        onEnter={() => setInProgress(false)}
        onBackspace={onBackspace}
        settings={props.settings}
        onSubmitLetter={onSubmitLetter}
        customAlphabet={DEFAULT_ALPHABET_STRING.toLocaleUpperCase()
          .slice(0, getCurrentAlgebraTemplate().inputs.length)
          .split("")}
        targetWord=""
        guesses={[]}
        letterStatuses={[]}
        inDictionary
        disabled={!inProgress}
        hasBackspace={true}
        hasEnter={true}
      />
    );

    const numPad = (
      <NumPad
        onEnter={() => setInProgress(false)}
        onBackspace={onBackspace}
        onSubmitNumber={onSubmitNumber}
        settings={props.settings}
        disabled={!inProgress}
        hasBackspace={answerType === "number"}
        hasEnter={answerType === "number"}
      />
    );

    if (answerType === "letter") {
      return letterKeyboard;
    }

    if (answerType === "number") {
      return numPad;
    }

    if (answerType === "combination") {
      return (
        <>
          {numPad}
          {letterKeyboard}
        </>
      );
    }
  }

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newGamemodeSettings: AlgebraProps["gamemodeSettings"] = {
      ...gamemodeSettings,
      difficulty: e.target.value as Difficulty,
    };

    setGamemodeSettings(newGamemodeSettings);
  };

  const handleTimerToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGamemodeSettings: AlgebraProps["gamemodeSettings"] = {
      ...gamemodeSettings,
      timerConfig: e.target.checked ? { isTimed: true, seconds: totalSeconds } : { isTimed: false },
    };

    setGamemodeSettings(newGamemodeSettings);
  };

  const handleSimpleGamemodeSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGamemodeSettings: AlgebraProps["gamemodeSettings"] = {
      ...gamemodeSettings,
      [e.target.name]: getNewGamemodeSettingValue(e),
    };

    setGamemodeSettings(newGamemodeSettings);
  };

  return (
    <div
      className="App algebra"
      style={{ backgroundImage: `url(${props.theme.backgroundImageSrc})`, backgroundSize: "100% 100%" }}
    >
      {!props.campaignConfig.isCampaignLevel && (
        <div className="gamemodeSettings">
          <AlgebraGamemodeSettings
            gamemodeSettings={gamemodeSettings}
            handleDifficultyChange={handleDifficultyChange}
            handleTimerToggle={handleTimerToggle}
            handleSimpleGamemodeSettingsChange={handleSimpleGamemodeSettingsChange}
            setTotalSeconds={setTotalSeconds}
          ></AlgebraGamemodeSettings>
        </div>
      )}

      <div className="outcome">{displayOutcome()}</div>

      {displayInputs()}
      {displayQuestion()}

      <div className="guess">
        <LetterTile
          letter={guess}
          status={inProgress ? "not set" : isGuessCorrect() ? "correct" : "incorrect"}
          settings={props.settings}
        ></LetterTile>
      </div>

      {displayInputMethods()}

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
