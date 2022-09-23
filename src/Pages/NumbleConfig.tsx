import React, { useState } from "react";
import { PageName } from "../Data/PageNames";
import { SaveData, SettingsData } from "../Data/SaveData";
import { Theme } from "../Data/Themes";
import Numble from "./Numble";
import { DEFAULT_NUMBLE_GUESS_TIMER_VALUE } from "../Data/DefaultGamemodeSettings";
import { getGamemodeDefaultTimerValue } from "../Helper Functions/getGamemodeDefaultTimerValue";
import { getNextTeamNumberWithRemainingTime } from "../Helper Functions/getNextTeamWithRemainingTime";
import { MAX_NUM_NUMBLE_TEAMS } from "../Components/GamemodeSettingsOptions/NumbleGamemodeSettings";

export const numbleGridShapes = ["square", "hexagon"] as const;
export type numbleGridShape = typeof numbleGridShapes[number];

export const numbleGridSizes = [25, 64, 100] as const;
export type numbleGridSize = typeof numbleGridSizes[number];

export interface NumbleConfigProps {
  campaignConfig:
    | {
        isCampaignLevel: true;
        // What score must be achieved to pass the campaign level?
        targetScore: number;
        // How many pins can be selected before game ends?
        maxNumSelectedPins: number;
      }
    | { isCampaignLevel: false };

  gamemodeSettings: {
    numDice: number;
    // The lowest value which can be the number shown on a dice
    diceMin: number;
    diceMax: number;
    gridShape: numbleGridShape;
    gridSize: numbleGridSize;
    numTeams: number;
    // When a number which can't be made with the dice numbers is picked, does the game end?
    isGameOverOnIncorrectPick: boolean;
    // How long to make a guess after the dice have been rolled?
    guessTimerConfig:
      | {
          isTimed: true;
          seconds: number;
          // Can specify whether game ends when this guess timer runs out or if just some points are lost
          timerBehaviour: { isGameOverWhenNoTimeLeft: true } | { isGameOverWhenNoTimeLeft: false; pointsLost: number };
        }
      | { isTimed: false };
    // How long overall until the game ends?
    timerConfig: { isTimed: true; seconds: number } | { isTimed: false };
  };
}

interface Props extends NumbleConfigProps {
  page: PageName;
  theme: Theme;
  settings: SettingsData;
  setPage: (page: PageName) => void;
  setTheme: (theme: Theme) => void;
  addGold: (gold: number) => void;
  onComplete: (wasCorrect: boolean) => void;
}

export type NumbleStatus =
  | "dice-rolling"
  | "dice-rolled-awaiting-pick"
  | "picked-awaiting-dice-roll"
  | "game-over-incorrect-tile"
  | "game-over-target-score"
  | "game-over-no-more-pins"
  | "game-over-timer-ended";

const NumbleConfig = (props: Props) => {
  const [gamemodeSettings, setGamemodeSettings] = useState<NumbleConfigProps["gamemodeSettings"]>(
    props.gamemodeSettings
  );

  // The team number of the team that is choosing a pin next
  const [currentTeamNumber, setCurrentTeamNumber] = useState(0);

  const [status, setStatus] = useState<NumbleStatus>("dice-rolled-awaiting-pick");

  const INITIAL_GUESS_TIMER_VALUE =
    props.gamemodeSettings?.guessTimerConfig?.isTimed === true
      ? props.gamemodeSettings?.guessTimerConfig.seconds
      : DEFAULT_NUMBLE_GUESS_TIMER_VALUE;

  const [remainingGuessTimerSeconds, setRemainingGuessTimerSeconds] = useState(INITIAL_GUESS_TIMER_VALUE);

  const INITIAL_TEAM_TIMER_VALUE =
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig.seconds
      : getGamemodeDefaultTimerValue(props.page);

  // Each team starts with the same initial amount of time
  const initialTeamTimers = Array.from({ length: gamemodeSettings.numTeams }).map((_, i) => ({
    teamNumber: i,
    remainingSeconds: INITIAL_TEAM_TIMER_VALUE,
    totalSeconds: INITIAL_TEAM_TIMER_VALUE,
  }));

  const [teamTimers, setTeamTimers] = useState(initialTeamTimers);

  // Determine and set the next team to play
  const nextTeamTurn = () => {
    const newCurrentTeamNumber = getNextTeamNumberWithRemainingTime(currentTeamNumber, teamTimers);

    // No team with time left
    if (!newCurrentTeamNumber) {
      setStatus("game-over-timer-ended");
      return;
    }

    setCurrentTeamNumber(newCurrentTeamNumber);

    if (gamemodeSettings.guessTimerConfig.isTimed) {
      setRemainingGuessTimerSeconds(gamemodeSettings.guessTimerConfig.seconds);
    }

    // Next team rolls their own dice values
    setStatus("picked-awaiting-dice-roll");
  };

  // Guess Timer
  React.useEffect(() => {
    if (!gamemodeSettings.guessTimerConfig.isTimed) {
      return;
    }

    // Only decrease time when dice have been rolled and a pick must be made
    if (status !== "dice-rolled-awaiting-pick") {
      return;
    }

    // Ran out of time making guess
    if (remainingGuessTimerSeconds <= 0) {
      // Game ends when you run out of time is OFF
      if (!gamemodeSettings.guessTimerConfig.timerBehaviour.isGameOverWhenNoTimeLeft) {
        // Penalty will now get applied (invoked by Numble timer useEffect()s)

        // Dice must be rolled again (ran out of time to use current roll)
        setStatus("picked-awaiting-dice-roll");

        // Move on to next team (if multiplayer)
        if (gamemodeSettings.numTeams > 1) {
          nextTeamTurn();
        }

        return;
      }

      // Set current team's remaining time to zero
      const newTeamTimers = teamTimers.map((teamTimerInfo) => {
        if (teamTimerInfo.teamNumber === currentTeamNumber) {
          return { ...teamTimerInfo, remainingSeconds: 0 };
        }
        return teamTimerInfo;
      });
      updateTeamTimers(newTeamTimers);

      // Game ends when you run out of time is ON
      if (gamemodeSettings.numTeams === 1) {
        // End game using status
        setStatus("game-over-timer-ended");
        return;
      }

      if (gamemodeSettings.numTeams > 1) {
        nextTeamTurn();
      }
    }

    const guessTimer = setInterval(() => {
      if (remainingGuessTimerSeconds > 0) {
        setRemainingGuessTimerSeconds(remainingGuessTimerSeconds - 1);
      }
    }, 1000);

    return () => {
      clearInterval(guessTimer);
    };
  }, [setRemainingGuessTimerSeconds, remainingGuessTimerSeconds, gamemodeSettings.guessTimerConfig.isTimed, status]);

  // Game Timer
  React.useEffect(() => {
    if (!gamemodeSettings.timerConfig.isTimed) {
      return;
    }

    // Only decrease time when dice have been rolled and a pick must be made
    if (status !== "dice-rolled-awaiting-pick") {
      return;
    }

    // Ran out of total time
    if (teamTimers[currentTeamNumber].remainingSeconds <= 0) {
      if (gamemodeSettings.numTeams === 1) {
        // End game using status
        setStatus("game-over-timer-ended");
        return;
      }

      nextTeamTurn();
    }

    const timer = setInterval(() => {
      // The team to play next has time left
      if (teamTimers[currentTeamNumber].remainingSeconds > 0) {
        // Start decrementing their remaining time
        const newTeamTimers = teamTimers.map((teamTimerInfo) => {
          if (teamTimerInfo.teamNumber === currentTeamNumber) {
            return { ...teamTimerInfo, remainingSeconds: teamTimerInfo.remainingSeconds - 1 };
          }
          return teamTimerInfo;
        });
        setTeamTimers(newTeamTimers);
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [setTeamTimers, teamTimers, gamemodeSettings.timerConfig.isTimed, status]);

  React.useEffect(() => {
    if (props.campaignConfig.isCampaignLevel) {
      return;
    }

    // Save the latest gamemode settings
    SaveData.setNumbleConfigGamemodeSettings(gamemodeSettings);
  }, [gamemodeSettings]);

  // Validate the value of props.gamemodeSettings.numTeams
  React.useEffect(() => {
    const newGamemodeSettings = {
      ...gamemodeSettings,
      numTeams: props.campaignConfig.isCampaignLevel
        ? // Always 1 team when a campaign level
          1
        : // No more than 4 teams
          Math.min(MAX_NUM_NUMBLE_TEAMS, props.gamemodeSettings.numTeams),
    };
    setGamemodeSettings(newGamemodeSettings);
  }, [props.gamemodeSettings.numTeams, props.campaignConfig.isCampaignLevel]);

  function updateTeamTimers(
    newTeamTimers: {
      teamNumber: number;
      remainingSeconds: number;
      totalSeconds: number;
    }[]
  ) {
    setTeamTimers(newTeamTimers);
  }

  function updateRemainingGuessTimerSeconds(newGuessTimerSeconds: number) {
    setRemainingGuessTimerSeconds(newGuessTimerSeconds);
  }

  function updateGamemodeSettings(newGamemodeSettings: NumbleConfigProps["gamemodeSettings"]) {
    setGamemodeSettings(newGamemodeSettings);
  }

  return (
    <Numble
      campaignConfig={props.campaignConfig}
      gamemodeSettings={gamemodeSettings}
      status={status}
      setStatus={setStatus}
      currentTeamNumber={currentTeamNumber}
      setCurrentTeamNumber={setCurrentTeamNumber}
      updateGamemodeSettings={updateGamemodeSettings}
      remainingGuessTimerSeconds={remainingGuessTimerSeconds}
      updateRemainingGuessTimerSeconds={updateRemainingGuessTimerSeconds}
      teamTimers={teamTimers}
      updateTeamTimers={updateTeamTimers}
      nextTeamTurn={nextTeamTurn}
      onComplete={props.onComplete}
      theme={props.theme}
      settings={props.settings}
    ></Numble>
  );
};

export default NumbleConfig;
