import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { Home } from "./Home";
import { SplashScreen } from "./SplashScreen";
import { LobbyMenu } from "./LobbyMenu";
import WordleConfig from "./WordleConfig";
import { Button } from "./Button";

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
  | "numbo"
  | "nubble";

export const App: React.FC = () => {
  const [loadingState, setLoadingState] = useState<"loading" | "loaded">(
    "loading"
  );
  const [page, setPage] = useState<Page>("splash-screen");

  useEffect(() => {
    // TODO: Mask actual loading, rather than hard-coding seconds
    window.setTimeout(() => setLoadingState("loaded"), 2000);

    // Set home page after load
    window.setTimeout(() => setPage("lobby"), 2500); // Change to "home"
  }, []);

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
            defaultWordLength={10}
            numGuesses={1}
            puzzleRevealMs={puzzleRevealMs}
            puzzleLeaveNumBlanks={puzzleLeaveNumBlanks}
            setPage={setPage}
          />
        );

      /*
        case "numbo":
        return (
          <Numbo></Numbo>
        );

        case "nubble":
        return (
          <Nubble></Nubble>
        );
        */
    }
  })();

  return (
    <div className="app">
      {page !== "lobby" && page !== "home" && page !== "splash-screen" && (
        <nav className="navigation">
          <Button
            mode="default"
            onClick={() => setPage("lobby")}
            label="Back"
          />
        </nav>
      )}
      {pageComponent}
    </div>
  );
};
