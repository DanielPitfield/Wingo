import React, { useState, useEffect } from "react";
import { Home } from "./Home";
import { SplashScreen } from "./SplashScreen";
import { LobbyMenu } from "./LobbyMenu";
import WordleConfig from "./WordleConfig";
import { Button } from "./Button";
import NubbleConfig from "./Nubble/NubbleConfig";
import GoldCoin from "./images/gold.png";
import { SaveData } from "./SaveData";
import CountdownLettersConfig from "./CountdownLetters/CountdownLettersConfig";
import CountdownNumbersConfig from "./CountdownNumbers/CountdownNumbersConfig";

const wordLength = 5;
const numGuesses = 6;

const wordLength_increasing = 4;
const wordLength_limitless = 4;
const wordLength_puzzle = 10;
const wordLength_countdown_letters = 9;

const numGuesses_puzzle = 1;
const puzzleRevealMs = 2000;
const puzzleLeaveNumBlanks = 3;

const countdown_numbers_NumOperands = 6;
const countdown_numbers_ExpressionLength = 5;
const countdown_numbers_NumGuesses = 5;

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
  | "countdown_numbers"
  | "nubble";

export const App: React.FC = () => {
  const saveData = window.localStorage;

  const [loadingState, setLoadingState] = useState<"loading" | "loaded">("loading");
  const [page, setPage] = useState<Page>("splash-screen");

  const [gameOptionToggles, setgameOptionToggles] = useState<
    {
      page: Page;
      firstLetter: boolean;
      timer: boolean;
      keyboard: boolean;
    }[]
  >([
    {
      page: "wordle_daily",
      firstLetter: false,
      timer: false,
      keyboard: true,
    },
    {
      page: "wordle_repeat",
      firstLetter: false,
      timer: false,
      keyboard: true,
    },
    {
      page: "wordle_increasing",
      firstLetter: false,
      timer: false,
      keyboard: true,
    },
    {
      page: "wordle_limitless",
      firstLetter: false,
      timer: false,
      keyboard: true,
    },
    {
      page: "wordle_puzzle",
      firstLetter: false,
      timer: false,
      keyboard: true,
    },
    {
      page: "wordle_interlinked",
      firstLetter: false,
      timer: false,
      keyboard: true,
    },
    {
      page: "countdown_letters",
      firstLetter: false,
      timer: true,
      keyboard: true,
    },
    {
      page: "countdown_numbers",
      firstLetter: false,
      timer: true,
      keyboard: false,
    },
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
            keyboardToggle={(value, Page) => {
              setgameOptionToggles(
                gameOptionToggles.map((x) => {
                  if (x.page === Page) {
                    x.keyboard = value;
                  }
                  return x;
                })
              );
            }}
            setPage={setPage}
            gameOptionToggles={gameOptionToggles}
          />
        );

      case "wordle_daily":
        return (
          <WordleConfig
            {...commonProps}
            mode="daily"
            firstLetterProvided={gameOptionToggles.find((x) => x.page === "wordle_daily")?.firstLetter || false}
            timerConfig={
              gameOptionToggles.find((x) => x.page === "wordle_daily")?.timer
                ? { isTimed: true, seconds: 30 }
                : { isTimed: false }
            }
            keyboard={gameOptionToggles.find((x) => x.page === "wordle_daily")?.keyboard || false}
            defaultWordLength={wordLength}
          />
        );

      case "wordle_repeat":
        return (
          <WordleConfig
            {...commonProps}
            mode="repeat"
            firstLetterProvided={gameOptionToggles.find((x) => x.page === "wordle_repeat")?.firstLetter || false}
            timerConfig={
              gameOptionToggles.find((x) => x.page === "wordle_repeat")?.timer
                ? { isTimed: true, seconds: 30 } // TODO: Confgiure timer value
                : { isTimed: false }
            }
            keyboard={gameOptionToggles.find((x) => x.page === "wordle_repeat")?.keyboard || false}
            defaultWordLength={wordLength}
          />
        );

      case "wordle_increasing":
        return (
          <WordleConfig
            {...commonProps}
            mode="increasing"
            firstLetterProvided={gameOptionToggles.find((x) => x.page === "wordle_increasing")?.firstLetter || false}
            timerConfig={
              gameOptionToggles.find((x) => x.page === "wordle_increasing")?.timer
                ? { isTimed: true, seconds: 30 }
                : { isTimed: false }
            }
            keyboard={gameOptionToggles.find((x) => x.page === "wordle_increasing")?.keyboard || false}
            defaultWordLength={wordLength_increasing}
          />
        );

      case "wordle_limitless":
        return (
          <WordleConfig
            {...commonProps}
            mode="limitless"
            firstLetterProvided={gameOptionToggles.find((x) => x.page === "wordle_limitless")?.firstLetter || false}
            timerConfig={
              gameOptionToggles.find((x) => x.page === "wordle_limitless")?.timer
                ? { isTimed: true, seconds: 30 }
                : { isTimed: false }
            }
            keyboard={gameOptionToggles.find((x) => x.page === "wordle_limitless")?.keyboard || false}
            defaultWordLength={wordLength_limitless}
          />
        );

      case "wordle_puzzle":
        return (
          <WordleConfig
            {...commonProps}
            mode="puzzle"
            firstLetterProvided={gameOptionToggles.find((x) => x.page === "wordle_puzzle")?.firstLetter || false}
            timerConfig={
              gameOptionToggles.find((x) => x.page === "wordle_puzzle")?.timer
                ? { isTimed: true, seconds: 30 }
                : { isTimed: false }
            }
            keyboard={gameOptionToggles.find((x) => x.page === "wordle_puzzle")?.keyboard || false}
            defaultWordLength={wordLength_puzzle}
            defaultnumGuesses={numGuesses_puzzle}
          />
        );

      case "wordle_interlinked":
        return (
          <WordleConfig
            {...commonProps}
            mode="interlinked"
            firstLetterProvided={gameOptionToggles.find((x) => x.page === "wordle_interlinked")?.firstLetter || false}
            timerConfig={
              gameOptionToggles.find((x) => x.page === "wordle_interlinked")?.timer
                ? { isTimed: true, seconds: 30 }
                : { isTimed: false }
            }
            keyboard={gameOptionToggles.find((x) => x.page === "wordle_interlinked")?.keyboard || false}
            defaultWordLength={wordLength}
          />
        );

      case "countdown_letters":
        return (
          <CountdownLettersConfig
            mode={"casual"}
            timerConfig={
              gameOptionToggles.find((x) => x.page === "countdown_letters")?.timer
                ? { isTimed: true, seconds: 30 }
                : { isTimed: false }
            }
            keyboard={gameOptionToggles.find((x) => x.page === "countdown_letters")?.keyboard || false}
            defaultWordLength={wordLength_countdown_letters}
            page={page}
            setPage={setPage}
          />
        );

        case "countdown_numbers":
        return (
          <CountdownNumbersConfig
            mode={"casual"}
            timerConfig={
              gameOptionToggles.find((x) => x.page === "countdown_numbers")?.timer
                ? { isTimed: true, seconds: 30 }
                : { isTimed: false }
            }
            defaultNumOperands={countdown_numbers_NumOperands}
            defaultExpressionLength={countdown_numbers_ExpressionLength}
            defaultNumGuesses={countdown_numbers_NumGuesses}
            page={page}
            setPage={setPage}
          />
        );

      case "nubble":
        return (
          <NubbleConfig
            numDice={4}
            diceMin={1}
            diceMax={6}
            gridSize={100}
            gridShape={"square"}
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
              <Button mode="default" className="back-button" onClick={() => setPage("lobby")}>
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
