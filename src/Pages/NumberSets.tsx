import React, { useState } from "react";
import { Button } from "../Components/Button";
import LetterTile from "../Components/LetterTile";
import { MessageNotification } from "../Components/MessageNotification";
import { NumPad } from "../Components/NumPad";
import ProgressBar, { GreenToRedColorTransition } from "../Components/ProgressBar";
import { SaveData, SettingsData } from "../Data/SaveData";
import { useClickChime, useCorrectChime, useFailureChime, useLightPingChime } from "../Data/Sounds";
import { Theme } from "../Data/Themes";
import { NumberSetTemplate } from "../Data/NumberSetsTemplates";
import { LEVEL_FINISHING_TEXT } from "../Components/Level";
import { Difficulty } from "../Data/DefaultGamemodeSettings";
import { MAX_NUMPAD_GUESS_LENGTH } from "../Data/GamemodeSettingsInputLimits";
import { getGamemodeDefaultTimerValue } from "../Helper Functions/getGamemodeDefaultTimerValue";
import { getQuestionSetOutcome } from "../Helper Functions/getQuestionSetOutcome";
import { getNumberSetTemplates } from "../Helper Functions/getNumberSetTemplates";
import { getNewGamemodeSettingValue } from "../Helper Functions/getGamemodeSettingsNewValue";
import NumberSetsGamemodeSettings from "../Components/GamemodeSettingsOptions/NumberSetsGamemodeSettings";
import { useLocation } from "react-router-dom";
import { PagePath } from "../Data/PageNames";

export interface NumberSetsProps {
  campaignConfig:
    | {
        isCampaignLevel: true;
        // How many questions must be answered correctly to pass the campaign level?
        targetScore: number;
      }
    | { isCampaignLevel: false };

  defaultNumberSets?: NumberSetTemplate[];

  gamemodeSettings: {
    numSets: number;
    difficulty: Difficulty;
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  };
}

interface Props extends NumberSetsProps {
  theme: Theme;
  settings: SettingsData;
  setTheme: (theme: Theme) => void;
  addGold: (gold: number) => void;
  onComplete: (wasCorrect: boolean) => void;
}

/** */
const NumberSets = (props: Props) => {
  const location = useLocation().pathname as PagePath;

  const [gamemodeSettings, setGamemodeSettings] = useState<NumberSetsProps["gamemodeSettings"]>(props.gamemodeSettings);

  const [inProgress, setInProgress] = useState(true);
  const [guess, setGuess] = useState("");

  const [numberSets, setNumberSets] = useState<NumberSetTemplate[]>(
    props.defaultNumberSets ?? getNumberSetTemplates(gamemodeSettings.numSets, gamemodeSettings.difficulty)
  );
  const [currentNumberSetIndex, setCurrentNumberSetIndex] = useState(0);
  const [numCorrectAnswers, setNumCorrectAnswers] = useState(0);

  const [remainingSeconds, setRemainingSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig.seconds
      : getGamemodeDefaultTimerValue(location)
  );

  const [mostRecentTotalSeconds, setMostRecentTotalSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig.seconds
      : getGamemodeDefaultTimerValue(location)
  );

  // Sounds
  const [playCorrectChimeSoundEffect] = useCorrectChime(props.settings);
  const [playFailureChimeSoundEffect] = useFailureChime(props.settings);

  // Reset game after change of settings (stops cheating by changing settings partway through a game)
  React.useEffect(() => {
    if (props.campaignConfig.isCampaignLevel) {
      return;
    }

    ResetGame();

    // Save the latest gamemode settings for this mode
    SaveData.setNumberSetsGamemodeSettings(gamemodeSettings);
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

  const getCurrentNumberSetTemplate = (): NumberSetTemplate => {
    return numberSets[currentNumberSetIndex];
  };

  const isGuessCorrect = (): Boolean => {
    const correctAnswer = getCurrentNumberSetTemplate().question.correctAnswer.toString().toUpperCase();
    return guess === correctAnswer;
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
  }, [guess, inProgress]);

  function displayExamples(): React.ReactNode {
    return (
      <div className="number_set_wrapper">
        {getCurrentNumberSetTemplate().examples.map((example, index) => {
          return (
            <div key={`example ${index}`} className="number_set_example">
              <span>
                {example.numbersLeft} ( <strong>{example.correctAnswer}</strong> ) {example.numbersRight}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  function displayQuestion(): React.ReactNode {
    const question = getCurrentNumberSetTemplate().question;

    return (
      <div className="number_set_question">
        <span>
          {question.numbersLeft} ( <strong>?</strong> ) {question.numbersRight}
        </span>
      </div>
    );
  }

  // Has the last numberSet been guessed/attempted?
  const isGameOver = () => {
    // Is the current numberSet the last numberSet?
    const isLastNumberSet = currentNumberSetIndex === numberSets.length - 1;

    return !inProgress && isLastNumberSet;
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
              The answer was <strong>{getCurrentNumberSetTemplate().question.correctAnswer}</strong>
            </span>
          )}
          <br />

          {currentNumberSetIndex + 1 < gamemodeSettings.numSets && (
            <span>{`${currentNumberSetIndex + 1} / ${gamemodeSettings.numSets} questions completed`}</span>
          )}
        </MessageNotification>
        <br />
      </>
    );

    // The number of correct answers needed for a successful outcome
    const targetScore = props.campaignConfig.isCampaignLevel
      ? Math.min(props.campaignConfig.targetScore, gamemodeSettings.numSets)
      : gamemodeSettings.numSets;

    // When the game has finished, show the number of correct answers
    const overallOutcome = (
      <>
        <MessageNotification
          type={getQuestionSetOutcome(numCorrectAnswers, targetScore, props.campaignConfig.isCampaignLevel)}
        >
          <strong>{`${numCorrectAnswers} / ${gamemodeSettings.numSets} correct`}</strong>
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

  function ResetGame() {
    if (isGameOver()) {
      // Achieved target score if a campaign level, otherwise just all answers were correct
      const wasCorrect = props.campaignConfig.isCampaignLevel
        ? numCorrectAnswers >= Math.min(props.campaignConfig.targetScore, gamemodeSettings.numSets)
        : numCorrectAnswers === gamemodeSettings.numSets;
      props.onComplete(wasCorrect);
    }

    setInProgress(true);
    setGuess("");

    setNumberSets(getNumberSetTemplates(gamemodeSettings.numSets, gamemodeSettings.difficulty));

    setCurrentNumberSetIndex(0);
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
    setCurrentNumberSetIndex(currentNumberSetIndex + 1);
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

  function onSubmitNumber(number: number) {
    if (!inProgress) {
      return;
    }

    if (guess.length >= MAX_NUMPAD_GUESS_LENGTH) {
      return;
    }

    setGuess(`${guess}${number}`);
  }

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newGamemodeSettings: NumberSetsProps["gamemodeSettings"] = {
      ...gamemodeSettings,
      difficulty: e.target.value as Difficulty,
    };

    setGamemodeSettings(newGamemodeSettings);
  };

  const handleTimerToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGamemodeSettings: NumberSetsProps["gamemodeSettings"] = {
      ...gamemodeSettings,
      timerConfig: e.target.checked ? { isTimed: true, seconds: mostRecentTotalSeconds } : { isTimed: false },
    };

    setGamemodeSettings(newGamemodeSettings);
  };

  const handleSimpleGamemodeSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGamemodeSettings: NumberSetsProps["gamemodeSettings"] = {
      ...gamemodeSettings,
      [e.target.name]: getNewGamemodeSettingValue(e),
    };

    setGamemodeSettings(newGamemodeSettings);
  };

  return (
    <div
      className="App number_sets"
      style={{ backgroundImage: `url(${props.theme.backgroundImageSrc})`, backgroundSize: "100% 100%" }}
    >
      {!props.campaignConfig.isCampaignLevel && (
        <div className="gamemodeSettings">
          <NumberSetsGamemodeSettings
            gamemodeSettings={gamemodeSettings}
            handleDifficultyChange={handleDifficultyChange}
            handleTimerToggle={handleTimerToggle}
            handleSimpleGamemodeSettingsChange={handleSimpleGamemodeSettingsChange}
            setMostRecentTotalSeconds={setMostRecentTotalSeconds}
            setRemainingSeconds={setRemainingSeconds}
          ></NumberSetsGamemodeSettings>
        </div>
      )}

      <div className="outcome">{displayOutcome()}</div>

      {displayExamples()}
      {displayQuestion()}

      <div className="guess">
        <LetterTile
          letter={guess}
          status={inProgress ? "not set" : isGuessCorrect() ? "correct" : "incorrect"}
          settings={props.settings}
        ></LetterTile>
      </div>

      {props.settings.gameplay.keyboard && (
        <NumPad
          onEnter={() => setInProgress(false)}
          onBackspace={onBackspace}
          onSubmitNumber={onSubmitNumber}
          settings={props.settings}
          disabled={!inProgress}
          hasBackspace={true}
          hasEnter={true}
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

export default NumberSets;
