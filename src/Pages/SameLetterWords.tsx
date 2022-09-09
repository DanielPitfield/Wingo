import React, { useState } from "react";
import { PageName } from "../PageNames";
import { Button } from "../Components/Button";
import GamemodeSettingsMenu from "../Components/GamemodeSettingsMenu";
import { MessageNotification } from "../Components/MessageNotification";
import { shuffleArray } from "./ArithmeticDrag";
import { getPrettyWord } from "./OnlyConnect";
import ProgressBar, { GreenToRedColorTransition } from "../Components/ProgressBar";
import { SaveData, SettingsData } from "../Data/SaveData";
import { useClickChime, useCorrectChime, useFailureChime, useLightPingChime } from "../Data/Sounds";
import { Theme } from "../Data/Themes";
import { pickRandomElementFrom } from "./WingoConfig";
import { LEVEL_FINISHING_TEXT } from "../Components/Level";
import { wordLengthMappingsTargets } from "../Data/WordArrayMappings";
import { getGamemodeDefaultTimerValue } from "../Data/DefaultTimerValues";
import {
  MAX_NUM_SAME_LETTER_GUESSES,
  MAX_NUM_SAME_LETTER_MATCHING_WORDS,
  MAX_NUM_SAME_LETTER_TOTAL_WORDS,
  MIN_NUM_SAME_LETTER_GUESSES,
  MIN_NUM_SAME_LETTER_MATCHING_WORDS,
  MIN_NUM_SAME_LETTER_TOTAL_WORDS,
} from "../Data/GamemodeSettingsInputLimits";

export interface SameLetterWordsProps {
  gamemodeSettings: {
    wordLength: number;
    numMatchingWords: number;
    numTotalWords: number;
    // How many times can you check your attempts?
    numGuesses: number;
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  };
}

interface Props extends SameLetterWordsProps {
  isCampaignLevel: boolean;
  page: PageName;
  theme: Theme;
  settings: SettingsData;
  setPage: (page: PageName) => void;
  setTheme: (theme: Theme) => void;
  addGold: (gold: number) => void;
  onComplete: (wasCorrect: boolean) => void;
}

/** */
const SameLetterWords = (props: Props) => {
  const [inProgress, setInProgress] = useState(true);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [validWords, setValidWords] = useState<string[]>([]);
  const [gridWords, setGridWords] = useState<string[]>([]);

  const [gamemodeSettings, setGamemodeSettings] = useState<SameLetterWordsProps["gamemodeSettings"]>(
    props.gamemodeSettings
  );

  const [remainingSeconds, setRemainingSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig.seconds
      : getGamemodeDefaultTimerValue(props.page)
  );
  const [remainingGuesses, setRemainingGuesses] = useState(gamemodeSettings.numGuesses);
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
    if (props.isCampaignLevel) {
      return;
    }

    ResetGame();

    // Save the latest gamemode settings for this mode
    SaveData.setSameLetterWordsGamemodeSettings(gamemodeSettings);
  }, [gamemodeSettings]);

  // Validate the values of props.gamemodeSettings.numTotalWords and props.gamemodeSettings.numMatchingWords
  React.useEffect(() => {
    // No less than 4 total words
    const newNumTotalWords = Math.max(MIN_NUM_SAME_LETTER_TOTAL_WORDS, props.gamemodeSettings.numTotalWords);

    // Minimum number of matching words
    const numMatchingWordsFloor = Math.max(MIN_NUM_SAME_LETTER_MATCHING_WORDS, props.gamemodeSettings.numMatchingWords);

    // But the number of words to match can't be more than the total number of words
    const newNumMatchingWords = numMatchingWordsFloor < newNumTotalWords ? numMatchingWordsFloor : newNumTotalWords - 1;

    const newGamemodeSettings = {
      ...gamemodeSettings,
      numTotalWords: newNumTotalWords,
      numMatchingWords: newNumMatchingWords,
    };
    setGamemodeSettings(newGamemodeSettings);
  }, [props.gamemodeSettings.numTotalWords, props.gamemodeSettings.numMatchingWords]);

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
  }, []);

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

  function isAnagram(originalWord: string, newWord: string) {
    // Letters of the words (in alphabetical order)
    const originalWordLetters = originalWord.split("").sort().join("");
    const newWordLetters = newWord.split("").sort().join("");

    return originalWordLetters === newWordLetters;
  }

  // Subset of words with same letters (the correct selection)
  function getMatchingWords(originalWord: string): string[] {
    // Matching words (anagrams) must be the same length, so pick from array of words with length of original word
    const targetWordArray = wordLengthMappingsTargets.find((x) => x.value === originalWord.length)?.array;

    if (!targetWordArray) {
      return [];
    }

    // Filter words which are anagrams of orignial word
    const matchingWords = targetWordArray.filter((word) => isAnagram(originalWord, word));
    // Shuffle
    const shuffledMatchingWords = shuffleArray(matchingWords);
    // Only take as many as required
    const matchingWordsSubset = shuffledMatchingWords.slice(0, gamemodeSettings.numMatchingWords);

    return matchingWordsSubset;
  }

  // Filler words which aren't made with same letters
  function getRandomWords(originalWord: string, numRandomWords: number): string[] {
    // Would be too easy to find words which don't have the same letters if they are a different length (to the original word)!
    const targetWordArray = wordLengthMappingsTargets.find((x) => x.value === originalWord.length)?.array;

    if (!targetWordArray) {
      return [];
    }

    // Filter words which are NOT anagrams of orignial word
    const randomWords = targetWordArray.filter((word) => !isAnagram(originalWord, word));
    // Shuffle
    const shuffledRandomWords = shuffleArray(randomWords);
    // Only take as many as required
    const randomWordsSubset = shuffledRandomWords.slice(0, numRandomWords);

    return randomWordsSubset;
  }

  // Combine a subset of matching words and filler words
  function getGridWords(): string[] {
    // The word array containing all the words of the specified length
    const targetWordArray = wordLengthMappingsTargets.find((x) => x.value === gamemodeSettings.wordLength)?.array!;

    // The maximum number of attempts to try find a complete subset for each number of matching words
    const MAX_ATTEMPTS_BEFORE_TRYING_LOWER_NUM = 50;

    // Decrement the number of matching words (starting from specified number, until a complete subset is found)
    for (let numMatchingWords = gamemodeSettings.numMatchingWords; numMatchingWords >= 2; numMatchingWords--) {
      console.log(`Trying to find ${numMatchingWords} matching words in array`);
      // The required number of filler words to make a complete grid (if the current number of matching words are found)
      const numRandomWords = gamemodeSettings.numTotalWords - gamemodeSettings.numMatchingWords;

      let attemptCount = 0;

      while (attemptCount < MAX_ATTEMPTS_BEFORE_TRYING_LOWER_NUM) {
        const originalWord = pickRandomElementFrom(targetWordArray);
        const matchingWords = getMatchingWords(originalWord);

        // Found a matching words subset of the length being considered currently
        if (matchingWords.length === numMatchingWords) {
          const randomWords = getRandomWords(originalWord, numRandomWords);
          const gridWords = matchingWords.concat(randomWords);
          // Grid was able to be completed with sufficient number of filler words
          if (gridWords.length === gamemodeSettings.numTotalWords) {
            // Set and log the correct selection of words (the matching words)
            setValidWords(matchingWords);
            console.log(matchingWords);
            return gridWords;
          }
        }

        attemptCount += 1;
      }
    }

    // Subset could not be found
    return [];
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
    // The number of total words divided by the number of words that make up the correct selection (rounded up)
    const numRows = Math.ceil(gamemodeSettings.numTotalWords / gamemodeSettings.numMatchingWords);
    return Array.from({ length: numRows }).map((_, index) => populateRow(index));
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

    // Every valid word is within the selected words
    const successCondition =
      validWords.every((word) => selectedWords.includes(word)) && validWords.length > 0 && selectedWords.length > 0;

    let outcomeNotification;

    if (successCondition) {
      outcomeNotification = (
        <MessageNotification type="success">
          All <strong>{validWords.length}</strong> words with the same letters found!
        </MessageNotification>
      );
    } else {
      outcomeNotification = (
        <MessageNotification type="error">
          You didn't find the <strong>{validWords.length}</strong> words with the same letters
        </MessageNotification>
      );
    }

    return (
      <>
        {outcomeNotification}

        <br></br>

        <Button mode="accept" settings={props.settings} onClick={() => ResetGame()}>
          {props.isCampaignLevel ? LEVEL_FINISHING_TEXT : "Restart"}
        </Button>
      </>
    );
  }

  function ResetGame() {
    if (!inProgress) {
      // Every valid word is within the selected words (all same letter words found)
      const wasCorrect =
        validWords.every((word) => selectedWords.includes(word)) && validWords.length > 0 && selectedWords.length > 0;
      props.onComplete(wasCorrect);
    }

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
            min={MIN_NUM_SAME_LETTER_MATCHING_WORDS}
            max={Math.min(MAX_NUM_SAME_LETTER_MATCHING_WORDS, gamemodeSettings.numTotalWords - 1)}
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
            min={Math.max(MIN_NUM_SAME_LETTER_TOTAL_WORDS, gamemodeSettings.numMatchingWords + 1)}
            max={MAX_NUM_SAME_LETTER_TOTAL_WORDS}
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
            min={MIN_NUM_SAME_LETTER_GUESSES}
            max={MAX_NUM_SAME_LETTER_GUESSES}
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
      style={{ backgroundImage: `url(${props.theme.backgroundImageSrc})`, backgroundSize: "100% 100%" }}
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
