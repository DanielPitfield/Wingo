import React, { useState } from "react";
import { Page } from "../../App";
import { Button } from "../../Button";
import GamemodeSettingsMenu from "../../GamemodeSettingsMenu";
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
  gamemodeSettings?: {
    wordLength?: boolean;
    firstLetter?: boolean;
    showHint?: boolean;
    timer?: { isTimed: true; seconds: number } | { isTimed: false };
  };
  defaultSet?: NumberSetConfigProps;
  theme: Theme;
  settings: SettingsData;
  setPage: (page: Page) => void;
  onComplete?: (wasCorrect: boolean) => void;
}

/** */
const NumberSets: React.FC<Props> = (props) => {
  // Max number of characters permitted in a guess
  const MAX_LENGTH = 6;

  const [inProgress, setInProgress] = useState(true);
  const [guess, setGuess] = useState("");
  const [numberSet, setNumberSet] = useState<NumberSetConfigProps | undefined>(props.defaultSet);

  // Gamemode settings
  const [isTimerEnabled, setIsTimerEnabled] = useState(props.gamemodeSettings?.timer?.isTimed === true ?? false);
  const DEFAULT_TIMER_VALUE = 30;
  const [remainingSeconds, setRemainingSeconds] = useState(
    props.gamemodeSettings?.timer?.isTimed === true ? props.gamemodeSettings?.timer.seconds : DEFAULT_TIMER_VALUE
  );
  const [totalSeconds, setTotalSeconds] = useState(
    props.gamemodeSettings?.timer?.isTimed === true ? props.gamemodeSettings?.timer.seconds : DEFAULT_TIMER_VALUE
  );

  // Generate the elements to configure the gamemode settings
  const gamemodeSettings = generateSettings();

  // Sounds
  const [playCorrectChimeSoundEffect] = useCorrectChime(props.settings);
  const [playFailureChimeSoundEffect] = useFailureChime(props.settings);

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
    if (!isTimerEnabled || !inProgress) {
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
  }, [setRemainingSeconds, remainingSeconds, isTimerEnabled]);

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
            Restart
          </Button>
        )}
      </>
    );
  }

  function ResetGame() {
    props.onComplete?.(true);
    setInProgress(true);
    setGuess("");

    const numberSet = generateSet();
    setNumberSet(numberSet);
    console.log(numberSet);

    if (isTimerEnabled) {
      // Reset the timer if it is enabled in the game options
      setRemainingSeconds(totalSeconds);
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

  function generateSettings(): React.ReactNode {
    let settings;

    settings = (
      <>
        {props.gamemodeSettings?.timer !== undefined && (
          <>
            <label>
              <input
                checked={isTimerEnabled}
                type="checkbox"
                onChange={(e) => {
                  setIsTimerEnabled(!isTimerEnabled);
                }}
              ></input>
              Timer
            </label>
            {isTimerEnabled && (
              <label>
                <input
                  type="number"
                  value={totalSeconds}
                  min={10}
                  max={120}
                  step={5}
                  onChange={(e) => {
                    setRemainingSeconds(e.target.valueAsNumber);
                    setTotalSeconds(e.target.valueAsNumber);
                  }}
                ></input>
                Seconds
              </label>
            )}
          </>
        )}
      </>
    );

    return settings;
  }

  return (
    <div
      className="App number_sets"
      style={{ backgroundImage: `url(${props.theme.backgroundImageSrc})`, backgroundSize: "100%" }}
    >
      <div className="gamemodeSettings">
        <GamemodeSettingsMenu>{gamemodeSettings}</GamemodeSettingsMenu>
      </div>
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
        {isTimerEnabled && (
          <ProgressBar
            progress={remainingSeconds}
            total={totalSeconds}
            display={{ type: "transition", colorTransition: GreenToRedColorTransition }}
          ></ProgressBar>
        )}
      </div>
    </div>
  );
};

export default NumberSets;
