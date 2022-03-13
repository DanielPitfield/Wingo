import React, { useState, useEffect } from "react";
import { Home } from "./Home";
import { SplashScreen } from "./SplashScreen";
import { LobbyMenu } from "./LobbyMenu";
import WordleConfig from "./WordleConfig";
import { Button } from "./Button";
import NubbleConfig from "./Nubble/NubbleConfig";
import GoldCoin from "./images/gold.png";
import { SaveData } from "./SaveData";

const wordLength = 5;
const numGuesses = 6;
const numGuesses_countdown_letters = 1;

const wordLength_increasing = 4;
const wordLength_limitless = 4;
const wordLength_puzzle = 10;
const wordLength_countdown_letters = 9;

const numGuesses_puzzle = 1;
const puzzleRevealMs = 2000;
const puzzleLeaveNumBlanks = 3;

export type Page =
  | "splash-screen"
  | "home"
  | "lobby"
  | "wordle_daily"
  | "wordle_repeat"
  | "wordle_increasing"
  | "wordle_limitless"
  | "wordle_puzzle"
  | "wordle_interlinked"
  | "countdown_letters"
  | "numbo"
  | "nubble";

export const App: React.FC = () => {
  const saveData = window.localStorage;

  const [loadingState, setLoadingState] = useState<"loading" | "loaded">(
    "loading"
  );
  const [page, setPage] = useState<Page>("splash-screen");

  const [gameOptionToggles, setgameOptionToggles] = useState<
    { page: Page; firstLetter: boolean; timer: boolean }[]
  >([
    { page: "wordle_daily", firstLetter: false, timer: false },
    { page: "wordle_repeat", firstLetter: false, timer: false },
    { page: "wordle_increasing", firstLetter: false, timer: false },
    { page: "wordle_limitless", firstLetter: false, timer: false },
    { page: "wordle_puzzle", firstLetter: false, timer: false },
    { page: "wordle_interlinked", firstLetter: false, timer: false },
    { page: "countdown_letters", firstLetter: false, timer: false },
  ]);

  useEffect(() => {
    // TODO: Mask actual loading, rather than hard-coding seconds
    window.setTimeout(() => setLoadingState("loaded"), 2000);

    // Set home page after load
    window.setTimeout(() => setPage("lobby"), 2500);
  }, [saveData]);

  const pageComponent = (() => {
    const commonProps = {
      saveData: saveData,
      defaultnumGuesses: numGuesses,
      puzzleRevealMs: puzzleRevealMs,
      puzzleLeaveNumBlanks: puzzleLeaveNumBlanks,
      page: page,
      setPage: setPage,
    };

    switch (page) {
      case "splash-screen":
        return <SplashScreen loadingState={loadingState} />;

      case "home":
        return <Home setPage={setPage} />;

      case "lobby":
        return (
          <LobbyMenu
            /**
             * Updates game type configurations
             * @param value Checkbox checked (true) or not checked (false)
             * @param Page The page for the game type which options have just changed
             */
            firstLetterToggle={(value, Page) => {
              setgameOptionToggles(
                gameOptionToggles.map((x) => {
                  if (x.page === Page) {
                    x.firstLetter = value;
                  }
                  return x;
                })
              );
            }}
            timerToggle={(value, Page) => {
              setgameOptionToggles(
                gameOptionToggles.map((x) => {
                  if (x.page === Page) {
                    x.timer = value;
                  }
                  return x;
                })
              );
            }}
            setPage={setPage}
          />
        );

      case "wordle_daily":
        return (
          <WordleConfig
            {...commonProps}
            mode="daily"
            firstLetterProvided={
              gameOptionToggles.find((x) => x.page === "wordle_daily")
                ?.firstLetter || false
            }
            timerConfig={
              gameOptionToggles.find((x) => x.page === "wordle_daily")?.timer
                ? { isTimed: true, seconds: 30 }
                : { isTimed: false }
            }
            defaultWordLength={wordLength}
          />
        );

      case "wordle_repeat":
        return (
          <WordleConfig
            {...commonProps}
            mode="repeat"
            firstLetterProvided={
              gameOptionToggles.find((x) => x.page === "wordle_repeat")
                ?.firstLetter || false
            }
            timerConfig={
              gameOptionToggles.find((x) => x.page === "wordle_repeat")?.timer
                ? { isTimed: true, seconds: 30 } // TODO: Confgiure timer value
                : { isTimed: false }
            }
            defaultWordLength={wordLength}
          />
        );

      case "wordle_increasing":
        return (
          <WordleConfig
            {...commonProps}
            mode="increasing"
            firstLetterProvided={
              gameOptionToggles.find((x) => x.page === "wordle_increasing")
                ?.firstLetter || false
            }
            timerConfig={
              gameOptionToggles.find((x) => x.page === "wordle_increasing")
                ?.timer
                ? { isTimed: true, seconds: 30 }
                : { isTimed: false }
            }
            defaultWordLength={wordLength_increasing}
          />
        );

      case "wordle_limitless":
        return (
          <WordleConfig
            {...commonProps}
            mode="limitless"
            firstLetterProvided={
              gameOptionToggles.find((x) => x.page === "wordle_limitless")
                ?.firstLetter || false
            }
            timerConfig={
              gameOptionToggles.find((x) => x.page === "wordle_limitless")
                ?.timer
                ? { isTimed: true, seconds: 30 }
                : { isTimed: false }
            }
            defaultWordLength={wordLength_limitless}
          />
        );

      case "wordle_puzzle":
        return (
          <WordleConfig
            {...commonProps}
            mode="puzzle"
            firstLetterProvided={
              gameOptionToggles.find((x) => x.page === "wordle_puzzle")
                ?.firstLetter || false
            }
            timerConfig={
              gameOptionToggles.find((x) => x.page === "wordle_puzzle")?.timer
                ? { isTimed: true, seconds: 30 }
                : { isTimed: false }
            }
            defaultWordLength={wordLength_puzzle}
            defaultnumGuesses={numGuesses_puzzle}
          />
        );

      case "wordle_interlinked":
        return (
          <WordleConfig
            {...commonProps}
            mode="interlinked"
            firstLetterProvided={
              gameOptionToggles.find((x) => x.page === "wordle_interlinked")
                ?.firstLetter || false
            }
            timerConfig={
              gameOptionToggles.find((x) => x.page === "wordle_interlinked")
                ?.timer
                ? { isTimed: true, seconds: 30 }
                : { isTimed: false }
            }
            defaultWordLength={wordLength}
          />
        );

        case "countdown_letters":
        return (
          <WordleConfig
            {...commonProps}
            mode="countdown_letters"
            firstLetterProvided={
              gameOptionToggles.find((x) => x.page === "countdown_letters")
                ?.firstLetter || false
            }
            timerConfig={
              gameOptionToggles.find((x) => x.page === "countdown_letters")
                ?.timer
                ? { isTimed: true, seconds: 30 }
                : { isTimed: false }
            }
            defaultWordLength={wordLength_countdown_letters}
            defaultnumGuesses={numGuesses_countdown_letters}
          />
        );

      case "nubble":
        return (
          <NubbleConfig
            numDice={4}
            diceMin={1}
            diceMax={6}
            gridSize={100}
            numTeams={2}
            timeLengthMins={5}
          ></NubbleConfig>
        );
    }
  })();

  return (
    <div className="app">
      {page !== "home" && page !== "splash-screen" && (
        <div className="toolbar">
          <div className="gold_counter">
            <img className="gold_coin_image" src={GoldCoin} alt="Gold" />
            {SaveData.readGold()}
          </div>
          {page !== "lobby" && (
            <nav className="navigation">
              <Button
                mode="default"
                className="back-button"
                onClick={() => setPage("lobby")}
              >
                Back
              </Button>
            </nav>
          )}
        </div>
      )}
      {pageComponent}
    </div>
  );
};
