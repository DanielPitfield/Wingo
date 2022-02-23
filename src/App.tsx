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

  /* TODO: Can the initial value be saveData.getItem("gold")

  Seems very risky to start it as 0
  Where's my gold gone??? reeeeeeeeeee

  A good failsafe:
  Record gold value when game session is started
  Prevent setting gold value to anything below this value (you can't lose coins!)
  */
  const [gold, setGold] = useState("0");

  useEffect(() => {
    const gold = saveData.getItem("gold");
    if (gold) {
      setGold(gold);
    } else {
      // 'gold' data item is not created yet
      console.log("No gold coin save data found");
      // Create a 'gold' data item
      saveData.setItem("gold", "0");
    }

    // TODO: Mask actual loading, rather than hard-coding seconds
    window.setTimeout(() => setLoadingState("loaded"), 2000);

    // Set home page after load
    window.setTimeout(() => setPage("lobby"), 2500); // Change to "home"
  }, []);

  function updateGoldCoins(value: number) {
    // String key value of current number of gold coins
    const gold = saveData.getItem("gold");
    // If there is a 'gold' data item
    if (gold) {
      const new_gold_value = (parseInt(gold) + value).toString();
      // Update the data item in local storage
      saveData.setItem("gold", new_gold_value);       
      // Update state
      setGold(new_gold_value);
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
            gold={gold}
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
            gold={gold}
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
            gold={gold}
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
            gold={gold}
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
            gold={gold}
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
