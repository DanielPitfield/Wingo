import React, { useState } from "react";
import { Button } from "../Components/Button";
import { MessageNotification } from "../Components/MessageNotification";
import ProgressBar, { GreenToRedColorTransition } from "../Components/ProgressBar";
import { SaveData, SettingsData } from "../Data/SaveData";
import { useClickChime, useCorrectChime, useFailureChime, useLightPingChime } from "../Data/Sounds";
import { Theme } from "../Data/Themes";
import { LEVEL_FINISHING_TEXT } from "../Components/Level";
import { getPrettyText } from "../Helpers/getPrettyText";
import { getGamemodeDefaultTimerValue } from "../Helpers/getGamemodeDefaultTimerValue";
import { getNewGamemodeSettingValue } from "../Helpers/getGamemodeSettingsNewValue";
import OnlyConnectGamemodeSettings from "../Components/GamemodeSettingsOptions/OnlyConnectGamemodeSettings";
import { useLocation } from "react-router-dom";
import { PagePath } from "../Data/PageNames";
import { getOnlyConnectGridWords } from "../Helpers/getOnlyConnectGridWords";

export interface OnlyConnectProps {
  gamemodeSettings: {
    numGroups: number;
    groupSize: number;
    // How many times can you check your attempts, once there are only two groups remaining?
    numGuesses: number;
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  };
}

export type GridWord = {
  word: string;
  categoryName: string;
  inCompleteGroup: boolean;
  rowNumber: number | null;
};

interface Props extends OnlyConnectProps {
  isCampaignLevel: boolean;
  theme: Theme;
  settings: SettingsData;
  setTheme: (theme: Theme) => void;
  addGold: (gold: number) => void;
  onComplete: (wasCorrect: boolean) => void;
}

const OnlyConnect = (props: Props) => {
  const location = useLocation().pathname as PagePath;

  const [gamemodeSettings, setGamemodeSettings] = useState<OnlyConnectProps["gamemodeSettings"]>(
    props.gamemodeSettings
  );

  const [inProgress, setInProgress] = useState(true);

  const [gridWords, setGridWords] = useState<GridWord[]>(
    getOnlyConnectGridWords(gamemodeSettings.numGroups, gamemodeSettings.groupSize)
  );
  const [selectedWords, setSelectedWords] = useState<{ word: string; categoryName: string }[]>([]);
  const [numCompletedGroups, setNumCompletedGroups] = useState(0);

  const [remainingGuesses, setRemainingGuesses] = useState(gamemodeSettings.numGuesses);

  const [remainingSeconds, setRemainingSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig?.seconds
      : getGamemodeDefaultTimerValue(location)
  );

  const [mostRecentTotalSeconds, setMostRecentTotalSeconds] = useState(
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig?.seconds
      : getGamemodeDefaultTimerValue(location)
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
    SaveData.setOnlyConnectGamemodeSettings(gamemodeSettings);
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

        // Clear selection
        setGridWords(
          gridWords.map((gridWord) => {
            if (selectedWords.some((x) => x.word === gridWord.word)) {
              gridWord.rowNumber = null;
            }

            return gridWord;
          })
        );
        setSelectedWords([]);

        setInProgress(false);
        clearInterval(timerGuess);
      }
    }, 1000);
    return () => {
      clearInterval(timerGuess);
    };
  }, [setRemainingSeconds, remainingSeconds, gamemodeSettings.timerConfig.isTimed]);

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
    // TODO: Infinite loop?
  }, [selectedWords]);

  function handleSelection(gridItem: GridWord) {
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
              {gridItem ? getPrettyText(gridItem.word) : ""}
            </button>
          );
        })}
      </div>
    );
  }

  function displayGrid(): React.ReactNode {
    // Create a grid (of a row for every group)
    return Array.from({ length: gamemodeSettings.numGroups }).map((_, index) => populateRow(index));
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
          // The name of the category (or a generic name if the name can't be found)
          const displayedCategoryName = categoryNames[i] ?? `Category ${i + 1}`;

          // Player completed this category
          if (completeCategoryNames.includes(categoryNames[i])) {
            // Just show what the name of the category was
            return (
              <React.Fragment key={displayedCategoryName}>
                <br />
                {displayedCategoryName}
              </React.Fragment>
            );
          }
          // Player did NOT complete the category
          else {
            const categoryWords: string[] = gridWords
              .filter((word) => word.categoryName === categoryNames[i])
              .map((x) => getPrettyText(x.word));

            // Show the name and words of the category
            return (
              <React.Fragment key={displayedCategoryName}>
                <br />
                <>{`${displayedCategoryName} (${categoryWords.join(", ")})`}</>
              </React.Fragment>
            );
          }
        })}
      </div>
    );
  }

  function displayOutcome(): React.ReactNode {
    // Game still in progress, don't display anything
    if (inProgress) {
      return;
    }

    // All groups were found
    const gridCompleted = numCompletedGroups === gamemodeSettings.numGroups;

    return (
      <>
        <MessageNotification type={gridCompleted ? "success" : "error"}>
          <strong>
            {gridCompleted
              ? "All groups found!"
              : numCompletedGroups === 1
              ? "1 group found"
              : `${numCompletedGroups} groups found`}
          </strong>
          <br />
          {getCorrectGrid()}
        </MessageNotification>

        <br />

        <Button mode="accept" settings={props.settings} onClick={() => ResetGame()}>
          {props.isCampaignLevel ? LEVEL_FINISHING_TEXT : "Restart"}
        </Button>
      </>
    );
  }

  function ResetGame() {
    if (!inProgress) {
      // All groups correctly found
      const wasCorrect = numCompletedGroups === gamemodeSettings.numGroups;
      props.onComplete(wasCorrect);
    }

    setInProgress(true);
    setGridWords(getOnlyConnectGridWords(gamemodeSettings.numGroups, gamemodeSettings.groupSize));
    setSelectedWords([]);
    setNumCompletedGroups(0);
    setRemainingGuesses(gamemodeSettings.numGuesses);

    if (gamemodeSettings.timerConfig.isTimed) {
      // Reset the timer if it is enabled in the game options
      setRemainingSeconds(gamemodeSettings.timerConfig.seconds);
    }
  }

  const handleTimerToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGamemodeSettings: OnlyConnectProps["gamemodeSettings"] = {
      ...gamemodeSettings,
      timerConfig: e.target.checked ? { isTimed: true, seconds: mostRecentTotalSeconds } : { isTimed: false },
    };

    setGamemodeSettings(newGamemodeSettings);
  };

  const handleSimpleGamemodeSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGamemodeSettings: OnlyConnectProps["gamemodeSettings"] = {
      ...gamemodeSettings,
      [e.target.name]: getNewGamemodeSettingValue(e),
    };

    setGamemodeSettings(newGamemodeSettings);
  };

  return (
    <div
      className="App only_connect_wall"
      style={{ backgroundImage: `url(${props.theme.backgroundImageSrc})`, backgroundSize: "100% 100%" }}
    >
      {!props.isCampaignLevel && (
        <div className="gamemodeSettings">
          <OnlyConnectGamemodeSettings
            gamemodeSettings={gamemodeSettings}
            handleSimpleGamemodeSettingsChange={handleSimpleGamemodeSettingsChange}
            handleTimerToggle={handleTimerToggle}
            setMostRecentTotalSeconds={setMostRecentTotalSeconds}
            setRemainingSeconds={setRemainingSeconds}
          ></OnlyConnectGamemodeSettings>
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
