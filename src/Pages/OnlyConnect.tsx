import React, { useState } from "react";
import { PageName } from "../PageNames";
import { Button } from "../Components/Button";
import { categoryMappings } from "../Data/DefaultGamemodeSettings";
import GamemodeSettingsMenu from "../Components/GamemodeSettingsMenu";
import { MessageNotification } from "../Components/MessageNotification";
import { shuffleArray } from "./ArithmeticDrag";
import ProgressBar, { GreenToRedColorTransition } from "../Components/ProgressBar";
import { SaveData, SettingsData } from "../Data/SaveData";
import { useClickChime, useCorrectChime, useFailureChime, useLightPingChime } from "../Data/Sounds";
import { Theme } from "../Data/Themes";
import { LEVEL_FINISHING_TEXT } from "../Components/Level";

export interface GroupWallProps {
  gamemodeSettings?: {
    numGroups?: number;
    groupSize?: number;
    // How many times can you check your attempts, once there are only two groups remaining?
    numGuesses?: number;
    timerConfig?: { isTimed: true; seconds: number } | { isTimed: false };
  };
}

interface Props extends GroupWallProps {
  isCampaignLevel: boolean;
  page: PageName;
  theme: Theme;
  settings: SettingsData;
  setPage: (page: PageName) => void;
  setTheme: (theme: Theme) => void;
  addGold: (gold: number) => void;
  onComplete: (wasCorrect: boolean) => void;
}

export function getPrettyWord(text: string): string {
  return (
    text
      // Replace dashes with spaces
      .replaceAll("-", " ")
      // Get each individual word
      .split(" ")
      // Capitalise the first letter of each word
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      // Join the words together with spaces (as one string)
      .join(" ")
  );
}

/** */
const OnlyConnect: React.FC<Props> = (props) => {
  const DEFAULT_NUM_GROUPS = 4;
  const DEFAULT_GROUP_SIZE = 4;
  const DEFAULT_NUM_GUESSES = 3;

  const [inProgress, setInProgress] = useState(true);
  const [gridWords, setGridWords] = useState<
    { word: string; categoryName: string; inCompleteGroup: boolean; rowNumber: number | null }[]
  >([]);
  const [selectedWords, setSelectedWords] = useState<{ word: string; categoryName: string }[]>([]);
  const [numCompletedGroups, setNumCompletedGroups] = useState(0);

  const defaultGamemodeSettings = {
    numGroups: props.gamemodeSettings?.numGroups ?? DEFAULT_NUM_GROUPS,
    groupSize: props.gamemodeSettings?.groupSize ?? DEFAULT_GROUP_SIZE,
    numGuesses: props.gamemodeSettings?.numGuesses ?? DEFAULT_NUM_GUESSES,
    timerConfig: props.gamemodeSettings?.timerConfig ?? { isTimed: false },
  };

  const [gamemodeSettings, setGamemodeSettings] = useState<{
    numGroups: number;
    groupSize: number;
    numGuesses: number;
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  }>(defaultGamemodeSettings);

  const [remainingGuesses, setRemainingGuesses] = useState(gamemodeSettings.numGuesses);

  const DEFAULT_TIMER_VALUE = 60;
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
    SaveData.setGroupWallGamemodeSettings(gamemodeSettings);
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
    if (selectedWords.length !== gamemodeSettings.groupSize) {
      return;
    }

    // Get the category name of the first word in the selection
    const category = selectedWords[0].categoryName;

    // Count how many words in the selection are from this category
    const numCorrectWords = selectedWords.filter((word) => word.categoryName === category).length;

    // If not all of the selected words are from the same category
    if (numCorrectWords !== selectedWords.length) {
      // There are only 2 groups left
      if (numCompletedGroups === gamemodeSettings.numGroups - 2) {
        // Decrease number of guesses
        setRemainingGuesses(remainingGuesses - 1);
        // If just used last guess
        if (remainingGuesses <= 1) {
          setInProgress(false);
        }
      }

      const INCORRECT_SELECTION_DELAY_MS = 500;
      // Half a second to show incorrect (but complete/full) selection
      setTimeout(() => {
        // Reset the selected words
        setSelectedWords([]);

        playLightPingSoundEffect();
      }, INCORRECT_SELECTION_DELAY_MS);
      return;
    }

    // Count the number of groups BEFORE checking each grid word
    const completedGroupCountPre = gridWords.filter((x) => x.inCompleteGroup).length / gamemodeSettings.groupSize;

    const newGridWords = gridWords
      .map((x, index) => {
        // If the word is not in the selected words
        if (!selectedWords.some((y) => y.word === x.word)) {
          // Ignore it
          return x;
        }

        // Every word of the category found (with the selection)
        if (gridWords[index].categoryName === category) {
          // Update the boolean flag to say it is part of a complete group
          x.inCompleteGroup = true;

          // Add the row number of the completed group
          x.rowNumber = numCompletedGroups + 1;
        }

        return x;
      })

      /* 
      Re-orders gridWords (shove newly found group into correct position/row on grid)
      The 999's ensure that if a grid word has no row number (i.e. not part of a group), that it appears after any grouped words.
      */
      .sort((a, b) => {
        return (a?.rowNumber || 999) - (b?.rowNumber || 999);
      });

    // Count the number of groups AFTER checking each grid word
    const completedGroupCountPost = newGridWords.filter((x) => x.inCompleteGroup).length / gamemodeSettings.groupSize;

    // If there is a new completed group (i.e. the group count has incremented by 1)
    if (completedGroupCountPost > completedGroupCountPre) {
      // If there is only 1 group left
      if (completedGroupCountPost === gamemodeSettings.numGroups - 1) {
        // Auto-complete the last group
        setGridWords(
          newGridWords.map((gridWord) => ({
            ...gridWord,

            // Set all to true
            inCompleteGroup: true,

            // Set the row number to the final row number, if not already set
            rowNumber: gridWord.rowNumber === null ? numCompletedGroups + 2 : gridWord.rowNumber,
          }))
        );

        // Increment count of how many groups have been correctly selected
        setNumCompletedGroups(numCompletedGroups + 2);

        setInProgress(false);
        playCorrectChimeSoundEffect();
      } else {
        // Update the calculated grid words
        setGridWords(newGridWords);

        // Increment count of how many groups have been correctly selected
        setNumCompletedGroups(numCompletedGroups + 1);
      }
    }

    // Reset the selected words
    setSelectedWords([]);
  }, [selectedWords]);

  function handleSelection(gridItem: { word: string; categoryName: string; inCompleteGroup: boolean }) {
    if (!inProgress) {
      return;
    }

    if (!gridItem) {
      return;
    }

    // Already part of a group
    if (gridItem.inCompleteGroup) {
      return;
    }

    let newSelectedWords = selectedWords.slice();

    // Word is already selected
    if (selectedWords.includes(gridItem)) {
      // Remove word from selection (de-select)
      newSelectedWords = newSelectedWords.filter((x) => x !== gridItem);
    }
    // Room for word to be added to selection
    else if (selectedWords.length < gamemodeSettings.groupSize) {
      newSelectedWords.push(gridItem);
    }
    // Selection is already full
    else {
      return;
    }

    setSelectedWords(newSelectedWords);
  }

  // (gamemodeSettings.groupSize) words from (gamemodeSettings.numGroups) categories, shuffled
  function getGridWords(): {
    word: string;
    categoryName: string;
    inCompleteGroup: boolean;
    rowNumber: number | null;
  }[] {
    // Array to hold all the words for the grid (along with their categories)
    let gridWords: { word: string; categoryName: string; inCompleteGroup: boolean; rowNumber: number | null }[] = [];

    // Use the specified number of categories (but never exceed the number of category word lists)
    const numCategories = Math.min(gamemodeSettings.numGroups, categoryMappings.length);
    // Filter the categories which have enough enough words in their word list
    const suitableCategories = categoryMappings.filter(
      (category) => category.array.length >= gamemodeSettings.groupSize /* TODO: Leeway for word replacements? */
    );
    // Randomly select the required number of categories
    const chosenCategories = shuffleArray(suitableCategories).slice(0, numCategories);

    for (const category of chosenCategories) {
      /* 
      Words from this category (which aren't already included in gridWords from other categories)
      e.g The word 'Duck' can be from both the 'Meats and Fish' and 'Animals' categories
      May need to add leeway to the condition of suitableCategories to accomodate for these kinds of replacements
      */
      const wordList: string[] = shuffleArray(category.array)
        .map((x) => x.word)
        .filter((word) => !gridWords.map((x) => x.word).includes(word));
      // The subset of words chosen from this category
      const wordSubset = wordList.slice(0, gamemodeSettings.groupSize);

      // Attach category name to every word (in an object)
      const categorySubset = wordSubset.map((word) => ({
        word: word,
        categoryName: category.name,
        inCompleteGroup: false,
        rowNumber: null,
      }));

      // Add group of words
      gridWords = gridWords.concat(categorySubset);
    }

    return shuffleArray(gridWords);
  }

  function populateRow(rowNumber: number) {
    return (
      <div className="only-connect-row" key={rowNumber}>
        {Array.from({ length: gamemodeSettings.groupSize }).map((_, i) => {
          const index = rowNumber * gamemodeSettings.groupSize + i;
          const gridItem = gridWords[index];

          return (
            <button
              key={index}
              className="only-connect-button"
              data-num-completed-groups={numCompletedGroups}
              data-row-number={gridItem?.rowNumber}
              data-selected={selectedWords.includes(gridItem)}
              onClick={() => {
                handleSelection(gridItem);
                playClickSoundEffect();
              }}
            >
              {gridItem ? getPrettyWord(gridItem.word) : ""}
            </button>
          );
        })}
      </div>
    );
  }

  function displayGrid() {
    let Grid = [];

    for (let i = 0; i < gamemodeSettings.numGroups; i++) {
      Grid.push(populateRow(i));
    }

    return Grid;
  }

  function getCorrectGrid() {
    const categoryNames = Array.from(new Set(gridWords.map((word) => word.categoryName)));
    // The names of the categories for which the player found all the words to
    const completeCategoryNames = Array.from(
      new Set(gridWords.filter((word) => word.inCompleteGroup).map((word) => word.categoryName))
    );

    return (
      <div className="only-connect-correct-answer">
        {categoryNames.map((_, i) => {
          if (completeCategoryNames.includes(categoryNames[i])) {
            // Player completed this category, just show what the name of the category was
            return (
              <>
                {categoryNames[i]}
                <br></br>
              </>
            );
          } else {
            // Player did NOT complete the category, show the name and words of the category
            const categoryWords: string[] = gridWords
              .filter((word) => word.categoryName === categoryNames[i])
              .map((x) => x.word);
            // TODO: Formatting of correct words
            return (
              <>
                <>{`${categoryNames[i]} (${categoryWords.join(", ")})`}</>
                <br></br>
              </>
            );
          }
        })}
      </div>
    );
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

    return (
      <>
        <MessageNotification type={numCompletedGroups === gamemodeSettings.numGroups ? "success" : "error"}>
          <strong>
            {numCompletedGroups === gamemodeSettings.numGroups
              ? "All groups found!"
              : `${numCompletedGroups} groups found`}
            {getCorrectGrid()}
          </strong>
        </MessageNotification>

        <br></br>

        <Button mode="accept" settings={props.settings} onClick={() => ResetGame()}>
          {props.isCampaignLevel ? LEVEL_FINISHING_TEXT : "Restart"}
        </Button>
      </>
    );
  }

  function ResetGame() {
    if (!inProgress) {
      // ALl groups correctly found
      const wasCorrect = numCompletedGroups === gamemodeSettings.numGroups;
      props.onComplete(wasCorrect);
    }

    setInProgress(true);
    setGridWords(getGridWords());
    setSelectedWords([]);
    setNumCompletedGroups(0);
    setRemainingGuesses(gamemodeSettings.numGuesses);

    if (gamemodeSettings.timerConfig.isTimed) {
      // Reset the timer if it is enabled in the game options
      setRemainingSeconds(gamemodeSettings.timerConfig.seconds);
    }
  }

  function generateSettingsOptions(): React.ReactNode {
    const MIN_NUM_GROUPS = 2;
    const MAX_NUM_GROUPS = 10;

    const MIN_GROUP_SIZE = 2;
    const MAX_GROUP_SIZE = 10;

    return (
      <>
        <label>
          <input
            type="number"
            value={gamemodeSettings.numGroups}
            min={MIN_NUM_GROUPS}
            max={MAX_NUM_GROUPS}
            onChange={(e) => {
              const newGamemodeSettings = {
                ...gamemodeSettings,
                numGroups: e.target.valueAsNumber,
              };
              setGamemodeSettings(newGamemodeSettings);
            }}
          ></input>
          Number of groups
        </label>
        <label>
          <input
            type="number"
            value={gamemodeSettings.groupSize}
            min={MIN_GROUP_SIZE}
            max={MAX_GROUP_SIZE}
            onChange={(e) => {
              const newGamemodeSettings = {
                ...gamemodeSettings,
                groupSize: e.target.valueAsNumber,
              };
              setGamemodeSettings(newGamemodeSettings);
            }}
          ></input>
          Group size
        </label>
        <label>
          <input
            type="number"
            value={gamemodeSettings.numGuesses}
            min={1}
            max={10}
            onChange={(e) => {
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
      className="App only_connect_wall"
      style={{ backgroundImage: `url(${props.theme.backgroundImageSrc})`, backgroundSize: "100% 100%" }}
    >
      {!props.isCampaignLevel && (
        <div className="gamemodeSettings">
          <GamemodeSettingsMenu>{generateSettingsOptions()}</GamemodeSettingsMenu>
        </div>
      )}
      {!inProgress && <div className="outcome">{displayOutcome()}</div>}
      {Boolean(inProgress && numCompletedGroups === gamemodeSettings.numGroups - 2) && (
        <MessageNotification type="default">{`Guesses left: ${remainingGuesses}`}</MessageNotification>
      )}
      <div className="only_connect_wall">{displayGrid()}</div>
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

export default OnlyConnect;
