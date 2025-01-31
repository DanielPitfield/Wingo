import React, { useState } from "react";
import Button from "../Components/Button";
import MessageNotification from "../Components/MessageNotification";
import ProgressBar, { GreenToRedColorTransition } from "../Components/ProgressBar";
import { useClickChime, useCorrectChime, useFailureChime, useLightPingChime } from "../Data/Sounds";
import { Theme } from "../Data/Themes";
import { LEVEL_FINISHING_TEXT } from "../Components/Level";
import { targetWordLengthMappings } from "../Data/WordArrayMappings";
import { shuffleArray } from "../Helpers/shuffleArray";
import { getGamemodeDefaultTimerValue } from "../Helpers/getGamemodeDefaultTimerValue";
import { getRandomElementFrom } from "../Helpers/getRandomElementFrom";
import { getPrettyText } from "../Helpers/getPrettyText";
import { getNewGamemodeSettingValue } from "../Helpers/getGamemodeSettingsNewValue";
import SameLetterWordsGamemodeSettings, {
  MIN_NUM_SAME_LETTER_MATCHING_WORDS,
  MIN_NUM_SAME_LETTER_TOTAL_WORDS,
} from "../Components/GamemodeSettingsOptions/SameLetterWordsGamemodeSettings";
import { useLocation } from "react-router";
import { PagePath } from "../Data/PageNames";
import { SettingsData } from "../Data/SaveData/Settings";
import { setMostRecentSameLetterWordsGamemodeSettings } from "../Data/SaveData/MostRecentGamemodeSettings";
import { useCountdown } from "usehooks-ts";

export interface SameLetterWordsProps {
  gamemodeSettings: {
    wordLength: number;
    numMatchingWords: number;
    numTotalWords: number;
    // How many times can you check your attempts?
    startingNumGuesses: number;
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  };
}

interface Props extends SameLetterWordsProps {
  isCampaignLevel: boolean;
  theme: Theme;
  settings: SettingsData;
  setTheme: (theme: Theme) => void;
  addGold: (gold: number) => void;
  onComplete: (wasCorrect: boolean) => void;
}

const SameLetterWords = (props: Props) => {
  const location = useLocation().pathname as PagePath;

  const [inProgress, setInProgress] = useState(true);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [validWords, setValidWords] = useState<string[]>([]);
  const [gridWords, setGridWords] = useState<string[]>([]);

  const [gamemodeSettings, setGamemodeSettings] = useState<SameLetterWordsProps["gamemodeSettings"]>(
    props.gamemodeSettings
  );

  const [remainingGuesses, setRemainingGuesses] = useState(gamemodeSettings.startingNumGuesses);

  // The starting/total time of the timer
  const [totalSeconds, setTotalSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig?.seconds
      : getGamemodeDefaultTimerValue(location)
  );

  // How many seconds left on the timer?
  const [remainingSeconds, { startCountdown, stopCountdown, resetCountdown }] = useCountdown({
    countStart: totalSeconds,
    intervalMs: 1000,
  });

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
    setMostRecentSameLetterWordsGamemodeSettings(gamemodeSettings);
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

  // Start timer (any time the toggle is enabled or the totalSeconds is changed)
  React.useEffect(() => {
    if (!inProgress) {
      return;
    }

    if (!gamemodeSettings.timerConfig.isTimed) {
      return;
    }

    startCountdown();
  }, [inProgress, gamemodeSettings.timerConfig.isTimed, totalSeconds]);

  // Check remaining seconds on timer
  React.useEffect(() => {
    if (!inProgress) {
      return;
    }

    if (!gamemodeSettings.timerConfig.isTimed) {
      return;
    }

    if (remainingSeconds <= 0) {
      stopCountdown();
      playFailureChimeSoundEffect();
      setInProgress(false);
    }
  }, [inProgress, gamemodeSettings.timerConfig.isTimed, remainingSeconds]);

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
    const targetWordArray = targetWordLengthMappings.find((x) => x.value === originalWord.length)?.array;

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
    const targetWordArray = targetWordLengthMappings.find((x) => x.value === originalWord.length)?.array;

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
    const targetWordArray = targetWordLengthMappings.find((x) => x.value === gamemodeSettings.wordLength)?.array!;

    // The maximum number of attempts to try find a complete subset for each number of matching words
    const MAX_ATTEMPTS_BEFORE_TRYING_LOWER_NUM = 50;

    // Decrement the number of matching words (starting from specified number, until a complete subset is found)
    for (let numMatchingWords = gamemodeSettings.numMatchingWords; numMatchingWords >= 2; numMatchingWords--) {
      console.log(`Trying to find ${numMatchingWords} matching words in array`);
      // The required number of filler words to make a complete grid (if the current number of matching words are found)
      const numRandomWords = gamemodeSettings.numTotalWords - gamemodeSettings.numMatchingWords;

      let attemptCount = 0;

      while (attemptCount < MAX_ATTEMPTS_BEFORE_TRYING_LOWER_NUM) {
        const originalWord = getRandomElementFrom(targetWordArray);
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
              }}
            >
              {word ? getPrettyText(word) : ""}
            </button>
          );
        })}
      </div>
    );
  }

  const Grid = () => {
    // The number of total words divided by the number of words that make up the correct selection (rounded up)
    const numRows = Math.ceil(gamemodeSettings.numTotalWords / gamemodeSettings.numMatchingWords);

    const Grid = Array.from({ length: numRows }).map((_, index) => populateRow(index));
    return <div className="only_connect_wall">{Grid}</div>;
  };

  const Outcome = () => {
    if (inProgress) {
      return null;
    }

    // Every valid word is within the selected words
    const successCondition =
      validWords.every((word) => selectedWords.includes(word)) && validWords.length > 0 && selectedWords.length > 0;

    const restartButton = (
      <Button mode="accept" settings={props.settings} onClick={() => ResetGame()}>
        {props.isCampaignLevel ? LEVEL_FINISHING_TEXT : "Restart"}
      </Button>
    );

    if (successCondition) {
      return (
        <>
          <MessageNotification type="success">
            All <strong>{validWords.length}</strong> words with the same letters found!
          </MessageNotification>
          <br />
          {restartButton}
        </>
      );
    }

    return (
      <>
        <MessageNotification type="error">
          You didn't find the <strong>{validWords.length}</strong> words with the same letters
        </MessageNotification>
        <br />
        {restartButton}
      </>
    );
  };

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
    setRemainingGuesses(gamemodeSettings.startingNumGuesses);

    if (gamemodeSettings.timerConfig.isTimed) {
      // Reset the timer if it is enabled in the game options
      resetCountdown();
    }
  }

  const handleTimerToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGamemodeSettings: SameLetterWordsProps["gamemodeSettings"] = {
      ...gamemodeSettings,
      timerConfig: e.target.checked ? { isTimed: true, seconds: totalSeconds } : { isTimed: false },
    };

    setGamemodeSettings(newGamemodeSettings);
  };

  const handleSimpleGamemodeSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGamemodeSettings: SameLetterWordsProps["gamemodeSettings"] = {
      ...gamemodeSettings,
      [e.target.name]: getNewGamemodeSettingValue(e),
    };

    setGamemodeSettings(newGamemodeSettings);
  };

  return (
    <div
      className="App same_letter_words"
      style={{ backgroundImage: `url(${props.theme.backgroundImageSrc})`, backgroundSize: "100% 100%" }}
    >
      {!props.isCampaignLevel && (
        <div className="gamemodeSettings">
          <SameLetterWordsGamemodeSettings
            gamemodeSettings={gamemodeSettings}
            handleSimpleGamemodeSettingsChange={handleSimpleGamemodeSettingsChange}
            handleTimerToggle={handleTimerToggle}
            setRemainingGuesses={setRemainingGuesses}
            resetCountdown={resetCountdown}
            setTotalSeconds={setTotalSeconds}
            onLoadPresetGamemodeSettings={setGamemodeSettings}
            onShowOfAddPresetModal={() => {}}
            onHideOfAddPresetModal={() => {}}
          />
        </div>
      )}
      <Outcome />
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
      <Grid />
      <div>
        {gamemodeSettings.timerConfig.isTimed && (
          <ProgressBar
            progress={remainingSeconds}
            total={gamemodeSettings.timerConfig.seconds}
            display={{ type: "transition", colorTransition: GreenToRedColorTransition }}
          />
        )}
      </div>
    </div>
  );
};

export default SameLetterWords;
