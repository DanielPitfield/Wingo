import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { Home } from "./Home";
import { SplashScreen } from "./SplashScreen";
import { LobbyMenu } from "./LobbyMenu";
import WordleConfig from "./WordleConfig";
import { Button } from "./Button";
import NubbleConfig from "./Nubble/NubbleConfig";

const wordLength = 5;
const numGuesses = 6;
const puzzleRevealMs = 2000;
const puzzleLeaveNumBlanks = 3;

export type Page =
  | "splash-screen"
  | "home"
  | "lobby"
  | "wordle_daily"
  | "wordle_repeat"
  | "wordle_limitless"
  | "wordle_puzzle"
  | "wordle_interlinked"
  | "numbo"
  | "nubble";

export const App: React.FC = () => {
  const saveData = window.localStorage;

  const [loadingState, setLoadingState] = useState<"loading" | "loaded">(
    "loading"
  );
  const [page, setPage] = useState<Page>("splash-screen");

  useEffect(() => {
    // If 'gold' data item is not created yet
    if (!saveData.getItem("gold")) {
      console.log("No gold coin save data found");
      // Create a 'gold' data item
      saveData.setItem("gold", "0");
    } else {
      console.log("Gold (on launch): " + saveData.getItem("gold"));
    }

    // TODO: Mask actual loading, rather than hard-coding seconds
    window.setTimeout(() => setLoadingState("loaded"), 2000);

    // Set home page after load
    window.setTimeout(() => setPage("lobby"), 2500); // Change to "home"
  }, []);

  function updateGoldCoins(value: number) {
    // String key value of current number of gold coins
    const gold_storage_value = saveData.getItem("gold");
    // If there is a 'gold' data item
    if (gold_storage_value) {
      // Calculate new gold value
      const new_gold_storage_value = (
        parseInt(gold_storage_value) + value
      ).toString();
      // Update the data item in local storage
      saveData.setItem("gold", new_gold_storage_value);
      console.log("Gold (update): " + saveData.getItem("gold"));
    }
  }

  const pageComponent = (() => {
    switch (page) {
      case "splash-screen":
        return <SplashScreen loadingState={loadingState} />;

      case "home":
        return <Home setPage={setPage} />;

      case "lobby":
        return <LobbyMenu setPage={setPage} />;

      case "wordle_daily":
        return (
          <WordleConfig
            mode="daily"
            updateGoldCoins={updateGoldCoins}
            defaultWordLength={wordLength}
            numGuesses={numGuesses}
            puzzleRevealMs={puzzleRevealMs}
            puzzleLeaveNumBlanks={puzzleLeaveNumBlanks}
            setPage={setPage}
          />
        );

      case "wordle_repeat":
        return (
          <WordleConfig
            mode="repeat"
            updateGoldCoins={updateGoldCoins}
            defaultWordLength={wordLength}
            numGuesses={numGuesses}
            puzzleRevealMs={puzzleRevealMs}
            puzzleLeaveNumBlanks={puzzleLeaveNumBlanks}
            setPage={setPage}
          />
        );

      case "wordle_limitless":
        return (
          <WordleConfig
            mode="limitless"
            updateGoldCoins={updateGoldCoins}
            defaultWordLength={4}
            numGuesses={numGuesses}
            puzzleRevealMs={puzzleRevealMs}
            puzzleLeaveNumBlanks={puzzleLeaveNumBlanks}
            setPage={setPage}
          />
        );

      case "wordle_puzzle":
        return (
          <WordleConfig
            mode="puzzle"
            updateGoldCoins={updateGoldCoins}
            defaultWordLength={10}
            numGuesses={1}
            puzzleRevealMs={puzzleRevealMs}
            puzzleLeaveNumBlanks={puzzleLeaveNumBlanks}
            setPage={setPage}
          />
        );

      case "wordle_interlinked":
        return (
          <WordleConfig
            mode="interlinked"
            updateGoldCoins={updateGoldCoins}
            defaultWordLength={5}
            numGuesses={numGuesses}
            puzzleRevealMs={puzzleRevealMs}
            puzzleLeaveNumBlanks={puzzleLeaveNumBlanks}
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
            numTeams={2}
            timeLengthMins={5}
          ></NubbleConfig>
        );
    }
  })();

  return (
    <div className="app">
      {page !== "lobby" && page !== "home" && page !== "splash-screen" && (
        <nav className="navigation">
          <Button mode="default" onClick={() => setPage("lobby")}>
            Back
          </Button>
        </nav>
      )}
      {pageComponent}
    </div>
  );
};
