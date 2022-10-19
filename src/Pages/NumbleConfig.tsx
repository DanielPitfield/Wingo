import React, { useState } from "react";

import { Theme } from "../Data/Themes";
import Numble from "./Numble";
import { DEFAULT_NUMBLE_GUESS_TIMER_VALUE } from "../Data/DefaultGamemodeSettings";
import { getGamemodeDefaultTimerValue } from "../Helpers/getGamemodeDefaultTimerValue";
import { getNextTeamNumberWithRemainingTime } from "../Helpers/getNextTeamWithRemainingTime";
import { MAX_NUM_NUMBLE_TEAMS } from "../Components/GamemodeSettingsOptions/NumbleGamemodeSettings";
import { useLocation } from "react-router-dom";
import { PagePath } from "../Data/PageNames";
import { SettingsData } from "../Data/SaveData/Settings";
import { setMostRecentNumbleConfigGamemodeSettings } from "../Data/SaveData/MostRecentGamemodeSettings";
import { useCountdown } from "usehooks-ts";
import { useCorrectChime, useFailureChime, useLightPingChime, useClickChime } from "../Data/Sounds";

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
  theme: Theme;
  settings: SettingsData;
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
  const location = useLocation().pathname as PagePath;

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

  // The starting/total time of the guess timer
  const [totalSeconds, setTotalSeconds] = useState(INITIAL_GUESS_TIMER_VALUE);

  // How many seconds left on the guess timer?
  const [remainingSeconds, { startCountdown, stopCountdown, resetCountdown }] = useCountdown({
    countStart: totalSeconds,
    intervalMs: 1000,
  });

  const INITIAL_TEAM_TIMER_VALUE =
    props.gamemodeSettings?.timerConfig?.isTimed === true
      ? props.gamemodeSettings?.timerConfig?.seconds
      : getGamemodeDefaultTimerValue(location);

  // Each team starts with the same initial amount of time
  const initialTeamTimers = Array.from({ length: gamemodeSettings.numTeams }).map((_, i) => ({
    teamNumber: i,
    remainingSeconds: INITIAL_TEAM_TIMER_VALUE,
    totalSeconds: INITIAL_TEAM_TIMER_VALUE,
  }));

  const [teamTimers, setTeamTimers] = useState(initialTeamTimers);

  // Sounds
  const [playCorrectChimeSoundEffect] = useCorrectChime(props.settings);
  const [playFailureChimeSoundEffect] = useFailureChime(props.settings);
  const [playLightPingSoundEffect] = useLightPingChime(props.settings);
  const [playClickSoundEffect] = useClickChime(props.settings);

  // Determine and set the next team to play
  const nextTeamTurn = () => {
    const newCurrentTeamNumber = getNextTeamNumberWithRemainingTime(currentTeamNumber, teamTimers);

    // No team with time left
    if (newCurrentTeamNumber === null) {
      setStatus("game-over-timer-ended");
      return;
    }

    setCurrentTeamNumber(newCurrentTeamNumber);

    if (gamemodeSettings.guessTimerConfig.isTimed) {
      resetCountdown();
    }

    // Next team rolls their own dice values
    setStatus("picked-awaiting-dice-roll");
  };

  // Start global timer
  React.useEffect(() => {
    // No need for a global timer if guess timer and team timers are both disabled
    if (!gamemodeSettings.guessTimerConfig.isTimed && !gamemodeSettings.timerConfig.isTimed) {
      return;
    }

    // Only decrease time when dice have been rolled and a pick must be made
    if (status !== "dice-rolled-awaiting-pick") {
      return;
    }

    startCountdown();
  }, [gamemodeSettings.guessTimerConfig.isTimed, gamemodeSettings.timerConfig.isTimed, status, totalSeconds]);

  // Handle guess timer
  React.useEffect(() => {
    // Check remaining seconds on timer
    if (remainingSeconds <= 0) {
      stopCountdown();
      playFailureChimeSoundEffect();
    }

    // Only decrease time when dice have been rolled and a pick must be made
    if (status !== "dice-rolled-awaiting-pick") {
      return;
    }

    if (!gamemodeSettings.guessTimerConfig.isTimed) {
      return;
    }

    // Ran out of time making guess and game ends when you run out of time is OFF
    if (remainingSeconds <= 0 && !gamemodeSettings.guessTimerConfig.timerBehaviour.isGameOverWhenNoTimeLeft) {
      // Penalty will now get applied (invoked by Numble timer useEffect()s)

      // Dice must be rolled again (ran out of time to use current roll)
      setStatus("picked-awaiting-dice-roll");
      nextTeamTurn();
      return;
    }

    // Ran out of time making guess and game ends when you run out of time is ON
    if (remainingSeconds <= 0 && gamemodeSettings.guessTimerConfig.timerBehaviour.isGameOverWhenNoTimeLeft) {
      // Set current team's remaining time to zero
      const newTeamTimers = teamTimers.map((teamTimerInfo) => {
        if (teamTimerInfo.teamNumber === currentTeamNumber) {
          return { ...teamTimerInfo, remainingSeconds: 0 };
        }
        return teamTimerInfo;
      });

      setTeamTimers(newTeamTimers);
      nextTeamTurn();
      return;
    }
  }, [gamemodeSettings.guessTimerConfig.isTimed, status, teamTimers, remainingSeconds]);

  // TODO: Infinite loops, should be able to implement one global timer which can handle/direct both guess timer and team timers

  // Handle team timers
  React.useEffect(() => {
    if (remainingSeconds <= 0) {
      stopCountdown();
      playFailureChimeSoundEffect();
    }

    // Only decrease time when dice have been rolled and a pick must be made
    if (status !== "dice-rolled-awaiting-pick") {
      return;
    }

    // If team timer(s) is/are disabled, early return here
    if (!gamemodeSettings.timerConfig.isTimed) {
      return;
    }

    // Current team ran out of total time
    if (teamTimers[currentTeamNumber].remainingSeconds <= 0) {
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
  }, [gamemodeSettings.timerConfig.isTimed, status, teamTimers, remainingSeconds]);

  React.useEffect(() => {
    if (props.campaignConfig.isCampaignLevel) {
      return;
    }

    // Save the latest gamemode settings
    setMostRecentNumbleConfigGamemodeSettings(gamemodeSettings);
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
      remainingSeconds={remainingSeconds}
      totalSeconds={totalSeconds}
      resetCountdown={resetCountdown}
      setTotalSeconds={setTotalSeconds}
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
