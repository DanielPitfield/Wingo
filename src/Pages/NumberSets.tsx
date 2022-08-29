import React, { useState } from "react";
import { PageName } from "../PageNames";
import { Button } from "../Components/Button";
import GamemodeSettingsMenu from "../Components/GamemodeSettingsMenu";
import LetterTile from "../Components/LetterTile";
import { MessageNotification } from "../Components/MessageNotification";
import { NumPad } from "../Components/NumPad";
import ProgressBar, { GreenToRedColorTransition } from "../Components/ProgressBar";
import { SaveData, SettingsData } from "../Data/SaveData";
import { useClickChime, useCorrectChime, useFailureChime, useLightPingChime } from "../Data/Sounds";
import { Theme } from "../Data/Themes";
import { algebraDifficulty, algebraDifficulties } from "./Algebra";
import { generateSet } from "../Data/NumberSetsTemplates";
import { LEVEL_FINISHING_TEXT } from "../Components/Level";
import { getGamemodeDefaultTimerValue } from "../Data/DefaultTimerValues";

/** Config for a specific number set (exported for config from campaign) */
export type NumberSetConfigProps = {
  difficulty: algebraDifficulty;
  correctAnswerDescription: string;
  examples: NumberSetTemplate[];
  // TODO: Multiple questions like algebra gamemode?
  question: NumberSetTemplate;
};

/** Config for a specific number set (exported for config from campaign) */
export type NumberSetTemplate = {
  numbersLeft: number[];
  numbersRight: number[];
  correctAnswer: number;
};

export interface NumberSetsProps {
  campaignConfig:
    | {
        isCampaignLevel: true;
        // How many questions must be answered correctly to pass the campaign level?
        targetScore: number;
      }
    | { isCampaignLevel: false };

  defaultSet?: NumberSetConfigProps;

  gamemodeSettings: {
    difficulty: algebraDifficulty;
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  };
}

interface Props extends NumberSetsProps {
  page: PageName;
  theme: Theme;
  settings: SettingsData;
  setPage: (page: PageName) => void;
  setTheme: (theme: Theme) => void;
  addGold: (gold: number) => void;
  onComplete: (wasCorrect: boolean) => void;
}

/** */
const NumberSets: React.FC<Props> = (props) => {
  // Max number of characters permitted in a guess
  const MAX_LENGTH = 6;

  const [inProgress, setInProgress] = useState(true);
  const [guess, setGuess] = useState("");
  const [numberSet, setNumberSet] = useState<NumberSetConfigProps | undefined>(props.defaultSet);

  const [gamemodeSettings, setGamemodeSettings] = useState<NumberSetsProps["gamemodeSettings"]>(props.gamemodeSettings);

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

  // Reset game after change of settings (stops cheating by changing settings partway through a game)
  React.useEffect(() => {
    if (props.campaignConfig.isCampaignLevel) {
      return;
    }

    ResetGame();

    // Save the latest gamemode settings for this mode
    SaveData.setNumberSetsGamemodeSettings(gamemodeSettings);
  }, [gamemodeSettings]);

  // Evaluate each guess
  React.useEffect(() => {
    if (inProgress) {
      return;
    }

    const successCondition = guess === numberSet?.question.correctAnswer.toString();

    if (successCondition) {
      playCorrectChimeSoundEffect();
    } else {
      playFailureChimeSoundEffect();
    }
  }, [guess, inProgress]);

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

  // Picks a random set if one was not passed in through the props
  React.useEffect(() => {
    if (props.defaultSet) {
      setNumberSet(props.defaultSet);
    } else {
      // TODO: Choose set of current difficulty
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
              <span>
                {example.numbersLeft} ( <strong>{example.correctAnswer}</strong> ) {example.numbersRight}
              </span>
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
        <span>
          {question.numbersLeft} ( <strong>?</strong> ) {question.numbersRight}
        </span>
      </div>
    );
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

        <br></br>

        {!inProgress && (
          <Button
            mode="accept"
            onClick={() => ResetGame()}
            settings={props.settings}
            additionalProps={{ autoFocus: true }}
          >
            {props.campaignConfig.isCampaignLevel ? LEVEL_FINISHING_TEXT : "Restart"}
          </Button>
        )}
      </>
    );
  }

  function ResetGame() {
    if (!inProgress) {
      const wasCorrect = guess === numberSet?.question.correctAnswer.toString();
      props.onComplete(wasCorrect);

    /*
    // TODO: wasCorrect campaign pass criteria with multiple questions
    // Achieved target score if a campaign level, otherwise just all answers were correct
    const wasCorrect = props.campaignConfig.isCampaignLevel
    ? numCorrectAnswers >= Math.min(props.campaignConfig.targetScore, gamemodeSettings.numQuestions)
    : numCorrectAnswers === gamemodeSettings.numQuestions;
    */
    }

    setInProgress(true);
    setGuess("");
    setNumberSet(generateSet());

    if (gamemodeSettings.timerConfig.isTimed) {
      // Reset the timer if it is enabled in the game options
      setRemainingSeconds(gamemodeSettings.timerConfig.seconds);
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
      className="App number_sets"
      style={{ backgroundImage: `url(${props.theme.backgroundImageSrc})`, backgroundSize: "100% 100%" }}
    >
      {!props.campaignConfig.isCampaignLevel && (
        <div className="gamemodeSettings">
          <GamemodeSettingsMenu>{generateSettingsOptions()}</GamemodeSettingsMenu>
        </div>
      )}
      <div className="outcome">{displayOutcome()}</div>
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
        disabled={!inProgress}
        showKeyboard={props.settings.gameplay.keyboard}
      />
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
