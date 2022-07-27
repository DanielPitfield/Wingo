import React, { useState } from "react";
import { Page } from "../App";
import { Button } from "../Button";
import { DEFAULT_WORD_LENGTH, wordLengthMappingsTargets } from "../defaultGamemodeSettings";
import GamemodeSettingsMenu from "../GamemodeSettingsMenu";
import { MessageNotification } from "../MessageNotification";
import { shuffleArray } from "../NumbersArithmetic/ArithmeticDrag";
import { getPrettyWord } from "../OnlyConnect/GroupWall";
import ProgressBar, { GreenToRedColorTransition } from "../ProgressBar";
import { SaveData, SettingsData } from "../SaveData";
import { useClickChime, useCorrectChime, useFailureChime, useLightPingChime } from "../Sounds";
import { Theme } from "../Themes";
import { pickRandomElementFrom } from "../WordleConfig";

export interface SameLetterWordsProps {
  isCampaignLevel: boolean;

  gamemodeSettings?: {
    wordLength?: number;
    numMatchingWords?: number;
    numTotalWords?: number;
    // How many times can you check your attempts?
    numGuesses?: number;
    timerConfig?: { isTimed: true; seconds: number } | { isTimed: false };
  };
}

interface Props extends SameLetterWordsProps {
  theme: Theme;
  settings: SettingsData;
  setPage: (page: Page) => void;
  onComplete?: (wasCorrect: boolean) => void;
}

/** */
const SameLetterWords: React.FC<Props> = (props) => {
  const DEFAULT_NUM_MATCHING_WORDS = 4;
  const DEFAULT_NUM_TOTAL_WORDS = 16;
  const DEFAULT_NUM_GUESSES = 20;

  const MIN_NUM_MATCHING_WORDS = 2;
  const MAX_NUM_MATCHING_WORDS = 10;

  const MIN_NUM_TOTAL_WORDS = 4;
  const MAX_NUM_TOTAL_WORDS = 20;

  const MIN_NUM_GUESSES = 1;
  const MAX_NUM_GUESSES = 100;

  const [inProgress, setInProgress] = useState(true);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [validWords, setValidWords] = useState<string[]>([]);
  const [gridWords, setGridWords] = useState<string[]>([]);

  // TODO: Handling unexpected gamemodeSettings (that have been provided)
  const STARTING_NUM_TOTAL_WORDS = Math.max(
    MIN_NUM_TOTAL_WORDS,
    props.gamemodeSettings?.numTotalWords ?? DEFAULT_NUM_TOTAL_WORDS
  );

  const numMatchingWordsFloor = Math.max(
    MIN_NUM_MATCHING_WORDS,
    props.gamemodeSettings?.numMatchingWords ?? DEFAULT_NUM_MATCHING_WORDS
  );
  // Number of words to match can't be more than the total number of words
  const STARTING_NUM_MATCHING_WORDS =
    numMatchingWordsFloor < STARTING_NUM_TOTAL_WORDS ? numMatchingWordsFloor : STARTING_NUM_TOTAL_WORDS - 1;

  const defaultGamemodeSettings = {
    wordLength: props.gamemodeSettings?.wordLength ?? DEFAULT_WORD_LENGTH,
    numMatchingWords: STARTING_NUM_MATCHING_WORDS,
    numTotalWords: STARTING_NUM_TOTAL_WORDS,
    numGuesses: props.gamemodeSettings?.numGuesses ?? DEFAULT_NUM_GUESSES,
    timerConfig: props.gamemodeSettings?.timerConfig ?? { isTimed: false },
  };

  const [gamemodeSettings, setGamemodeSettings] = useState<{
    wordLength: number;
    numMatchingWords: number;
    numTotalWords: number;
    numGuesses: number;
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  }>(defaultGamemodeSettings);

  const DEFAULT_TIMER_VALUE = 100;
  const [remainingSeconds, setRemainingSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig.seconds
      : DEFAULT_TIMER_VALUE
  );
  const [remainingGuesses, setRemainingGuesses] = useState(gamemodeSettings.numGuesses);
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
    SaveData.setSameLetterWordsGamemodeSettings(gamemodeSettings);
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

  // Populate grid/wall
  React.useEffect(() => {
    // Grid words already initialised
    if (gridWords.length > 0) {
      return;
    }

    setGridWords(getGridWords());
  }, [gridWords]);

  // Check selection
  React.useEffect(() => {
    if (!inProgress) {
      return;
    }

    // Not full selection
    if (selectedWords.length !== validWords.length) {
      return;
    }

    // No selected words
    if (selectedWords.length === 0) {
      return;
    }

    // No valid words
    if (validWords.length === 0) {
      return;
    }

    // Decrease number of guesses
    setRemainingGuesses(remainingGuesses - 1);

    // If just used last guess
    if (remainingGuesses <= 1) {
      setInProgress(false);
    }

    // All selected words are valid
    if (selectedWords.every((word) => validWords.includes(word))) {
      playCorrectChimeSoundEffect();
      setInProgress(false);
      // Put correct words at top of grid
      setGridWords(
        gridWords.sort((a, b) => {
          if (validWords.includes(a) && !validWords.includes(b)) {
            return -1;
          } else if (!validWords.includes(a) && validWords.includes(b)) {
            return 1;
          } else {
            return 0;
          }
        })
      );
    } else {
      const INCORRECT_SELECTION_DELAY_MS = 500;
      // Half a second to show incorrect (but complete/full) selection
      setTimeout(() => {
        // Reset the selected words
        setSelectedWords([]);

        playLightPingSoundEffect();
      }, INCORRECT_SELECTION_DELAY_MS);
    }
  }, [selectedWords]);

  function handleSelection(word: string) {
    if (!inProgress) {
      return;
    }

    if (!word) {
      return;
    }

    let newSelectedWords = selectedWords.slice();

    // Word is already selected
    if (selectedWords.includes(word)) {
      // Remove word from selection (de-select)
      newSelectedWords = newSelectedWords.filter((x) => x !== word);
    }
    // Room for word to be added to selection
    else if (selectedWords.length < validWords.length) {
      newSelectedWords.push(word);
    }
    // Selection is already full
    else {
      return;
    }

    setSelectedWords(newSelectedWords);
  }

  // (props.numMatching) words within (props.numTotal) words
  function getGridWords(): string[] {
    // Array to hold all the words for the grid
    let grid_words: string[] = [];

    // The word array containing all the words of the specified length
    let targetWordArray: string[] = [];

    // The letters a word must have to match the original word (in alphabetical order)
    let validLetters: string[] = [];

    function isWordValid(validLetters: string[], word: string) {
      // Letters of the word (in alphabetical order)
      const word_letters = word.split("").sort((a, b) => a.localeCompare(b));

      return word_letters.join("") === validLetters.join("");
    }

    // Start from prop.numMatchingWords, and decrement down (if we could not find that number of matching words in targetWordArray)
    for (let numMatchingWords = gamemodeSettings.numMatchingWords; numMatchingWords >= 1; numMatchingWords--) {
      console.log(`Trying to find ${numMatchingWords} matching words in array`);

      // Determine the maximum number of times to find the props.numMatchingWords in the targetArray, before just continuing
      const MAX_ATTEMPTS_BEFORE_TRYING_LOWER_NUM = 15;

      // For a sensible number of attempts for this numMatchingWords
      for (let attemptNo = 1; attemptNo <= MAX_ATTEMPTS_BEFORE_TRYING_LOWER_NUM; attemptNo++) {
        // The word array containing all the words of the specified length
        targetWordArray = wordLengthMappingsTargets.find((x) => x.value === gamemodeSettings.wordLength)?.array!;

        // Choose a random word from this array
        const originalWord = pickRandomElementFrom(targetWordArray);

        // The letters a word must have to match the original word (in alphabetical order)
        validLetters = originalWord.split("").sort((a: string, b: string) => a.localeCompare(b));

        // Matching words
        const original_matches = targetWordArray.filter((word) => isWordValid(validLetters, word));

        // Otherwise, select a subset of the matching words (shuffle and slice)
        const shuffled_matches = shuffleArray(original_matches);
        grid_words = shuffled_matches.slice(0, gamemodeSettings.numMatchingWords);

        // If a suitable number of grid words was found
        if (grid_words.length >= numMatchingWords) {
          break;
        }
      }

      // If a suitable number of grid words was found
      if (grid_words.length >= numMatchingWords) {
        break;
      }
    }

    const matching_words = grid_words.slice();
    // Set the correct/matching words
    setValidWords(matching_words);
    console.log(matching_words);

    // Non-matching words
    let fail_count = 0;

    while (grid_words.length < gamemodeSettings.numTotalWords && fail_count < 100) {
      // Choose a random word from target array
      const randomWord = pickRandomElementFrom(targetWordArray);
      // Not already in array and is NOT a matching word
      if (!grid_words.includes(randomWord) && !isWordValid(validLetters, randomWord)) {
        grid_words.push(randomWord);
      } else {
        fail_count += 1;
      }
    }

    // Shuffle again
    grid_words = shuffleArray(grid_words);

    return grid_words;
  }

  function populateRow(rowNumber: number) {
    return (
      <div className="only-connect-row" key={rowNumber}>
        {Array.from({ length: gamemodeSettings.numMatchingWords }).map((_, i) => {
          const index = rowNumber * gamemodeSettings.numMatchingWords + i;
          const word = gridWords[index];

          if (!word) {
            return;
          }

          return (
            <button
              key={index}
              className="only-connect-button"
              data-selected={selectedWords.includes(word)}
              data-row-number={
                (inProgress && selectedWords.includes(word)) || (!inProgress && validWords.includes(word))
                  ? 1
                  : undefined
              }
              onClick={() => {
                handleSelection(word);
                playClickSoundEffect();
              }}
            >
              {word ? getPrettyWord(word) : ""}
            </button>
          );
        })}
      </div>
    );
  }

  function displayGrid() {
    var Grid = [];

    // The number of total words divided by the number of words that make up the correct selection (rounded up)
    const numRows = Math.ceil(gamemodeSettings.numTotalWords / gamemodeSettings.numMatchingWords);

    for (let i = 0; i < numRows; i++) {
      Grid.push(populateRow(i));
    }

    return Grid;
  }

  /**
   *
   * @returns
   */
  function displayOutcome(): React.ReactNode {
    // Game still in progress, don't display anything
    if (inProgress) {
      return;
    }

    let message_notification;
    const successCondition = selectedWords.length > 0 && selectedWords.every((word) => validWords.includes(word));

    if (successCondition) {
      message_notification = (
        <MessageNotification type="success">
          All <strong>{validWords.length}</strong> words with the same letters found!
        </MessageNotification>
      );
    } else {
      message_notification = (
        <MessageNotification type="error">
          You didn't find the <strong>{validWords.length}</strong> words with the same letters
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
    props.onComplete?.(true);
    setInProgress(true);
    setSelectedWords([]);
    setValidWords([]);
    setGridWords(getGridWords());
    setRemainingGuesses(gamemodeSettings.numGuesses);

    if (gamemodeSettings.timerConfig.isTimed) {
      // Reset the timer if it is enabled in the game options
      setRemainingSeconds(gamemodeSettings.timerConfig.seconds);
    }
  }

  function generateSettingsOptions(): React.ReactNode {
    return (
      <>
        <label>
          <input
            type="number"
            value={gamemodeSettings.numMatchingWords}
            min={MIN_NUM_MATCHING_WORDS}
            max={Math.min(MAX_NUM_MATCHING_WORDS, gamemodeSettings.numTotalWords - 1)}
            onChange={(e) => {
              const newGamemodeSettings = {
                ...gamemodeSettings,
                numMatchingWords: e.target.valueAsNumber,
              };
              setGamemodeSettings(newGamemodeSettings);
            }}
          ></input>
          Number of matching words
        </label>
        <label>
          <input
            type="number"
            value={gamemodeSettings.numTotalWords}
            min={Math.max(MIN_NUM_TOTAL_WORDS, gamemodeSettings.numMatchingWords + 1)}
            max={MAX_NUM_TOTAL_WORDS}
            onChange={(e) => {
              const newGamemodeSettings = {
                ...gamemodeSettings,
                numTotalWords: e.target.valueAsNumber,
              };
              setGamemodeSettings(newGamemodeSettings);
            }}
          ></input>
          Number of total words
        </label>
        <label>
          <input
            type="number"
            value={gamemodeSettings.numGuesses}
            min={MIN_NUM_GUESSES}
            max={MAX_NUM_GUESSES}
            onChange={(e) => {
              setRemainingGuesses(e.target.valueAsNumber);
              const newGamemodeSettings = {
                ...gamemodeSettings,
                numGuesses: e.target.valueAsNumber,
              };
              setGamemodeSettings(newGamemodeSettings);
            }}
          ></input>
          Number of guesses
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
      className="App same_letter_words"
      style={{ backgroundImage: `url(${props.theme.backgroundImageSrc})`, backgroundSize: "100%" }}
    >
      {!props.isCampaignLevel && (
        <div className="gamemodeSettings">
          <GamemodeSettingsMenu>{generateSettingsOptions()}</GamemodeSettingsMenu>
        </div>
      )}
      <div className="outcome">{displayOutcome()}</div>
      {inProgress && (
        <>
          <MessageNotification type="default">
            Find the <strong>{validWords.length}</strong> words with the same letters
          </MessageNotification>
          <MessageNotification type="default">
            Guesses left: <strong>{remainingGuesses}</strong>
          </MessageNotification>
        </>
      )}
      <div className="grid">{displayGrid()}</div>
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

export default SameLetterWords;
