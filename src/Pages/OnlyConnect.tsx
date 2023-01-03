import React, { useState } from "react";
import Button from "../Components/Button";
import MessageNotification from "../Components/MessageNotification";
import ProgressBar, { GreenToRedColorTransition } from "../Components/ProgressBar";
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
import { SettingsData } from "../Data/SaveData/Settings";
import { setMostRecentOnlyConnectGamemodeSettings } from "../Data/SaveData/MostRecentGamemodeSettings";
import { useCountdown } from "usehooks-ts";

export interface OnlyConnectProps {
  gamemodeSettings: {
    numGroups: number;
    groupSize: number;
    // How many times can you check your attempts, once there are only two groups remaining?
    startingNumGuesses: number;
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
    setMostRecentOnlyConnectGamemodeSettings(gamemodeSettings);
  }, [gamemodeSettings]);

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

      // Clear selection
      setGridWords(
        gridWords.map((gridWord) => {
          if (selectedWords.some((x) => x.word === gridWord.word)) {
            gridWord.rowNumber = null;
          }

          return gridWord;
        })
      );

      setInProgress(false);
    }
  }, [inProgress, gamemodeSettings.timerConfig.isTimed, remainingSeconds]);

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
      .map((gridWord, index) => {
        // Word is in the current selection (selected words)
        const inSelection = selectedWords.some((y) => y.word === gridWord.word);
        // The category of the gridWord is the same as the category of the first word in the selection
        const isCorrect = gridWords[index].categoryName === category;

        if (inSelection && isCorrect) {
          // Update the boolean flag to say it is part of a complete group
          gridWord.inCompleteGroup = true;
          // Add the row number of the completed group
          gridWord.rowNumber = numCompletedGroups + 1;
        }

        return gridWord;
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
  }, [selectedWords]);

  React.useEffect(() => {
    // Clear selection any time the grid updates
    setSelectedWords([]);
  }, [gridWords]);

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

    // Selection is already full
    if (selectedWords.length >= gamemodeSettings.groupSize) {
      return;
    }

    // Word is already selected
    if (selectedWords.includes(gridItem)) {
      // Remove word from selection (de-select)
      setSelectedWords(selectedWords.filter((x) => x !== gridItem));
      return;
    }

    // Add word to selection
    const newSelectedWords = selectedWords.slice();
    newSelectedWords.push(gridItem);
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

  const Grid = () => {
    const Grid = Array.from({ length: gamemodeSettings.numGroups }).map((_, index) => populateRow(index));
    return <div className="only_connect_wall">{Grid}</div>;
  };

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

  const Outcome = () => {
    if (inProgress) {
      return null;
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
  };

  function ResetGame() {
    if (!inProgress) {
      // All groups correctly found
      const wasCorrect = numCompletedGroups === gamemodeSettings.numGroups;
      props.onComplete(wasCorrect);
    }

    setInProgress(true);
    setGridWords(getOnlyConnectGridWords(gamemodeSettings.numGroups, gamemodeSettings.groupSize));
    setNumCompletedGroups(0);
    setRemainingGuesses(gamemodeSettings.startingNumGuesses);

    if (gamemodeSettings.timerConfig.isTimed) {
      // Reset the timer if it is enabled in the game options
      resetCountdown();
    }
  }

  const handleTimerToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newGamemodeSettings: OnlyConnectProps["gamemodeSettings"] = {
      ...gamemodeSettings,
      timerConfig: e.target.checked ? { isTimed: true, seconds: totalSeconds } : { isTimed: false },
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
            resetCountdown={resetCountdown}
            setTotalSeconds={setTotalSeconds}
            onLoadPresetGamemodeSettings={setGamemodeSettings}
            onShowOfAddPresetModal={() => {}}
            onHideOfAddPresetModal={() => {}}
          />
        </div>
      )}

      <Outcome />

      {Boolean(inProgress && numCompletedGroups === gamemodeSettings.numGroups - 2) && (
        <MessageNotification type="default">{`Guesses left: ${remainingGuesses}`}</MessageNotification>
      )}

      <Grid />

      {gamemodeSettings.timerConfig.isTimed && (
        <div>
          <ProgressBar
            progress={remainingSeconds}
            total={gamemodeSettings.timerConfig.seconds}
            display={{ type: "transition", colorTransition: GreenToRedColorTransition }}
          />
        </div>
      )}
    </div>
  );
};

export default OnlyConnect;
