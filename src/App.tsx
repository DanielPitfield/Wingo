import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { Home } from "./Home";
import { SplashScreen } from "./SplashScreen";
import { LobbyMenu } from "./LobbyMenu";
import Wordle from "./Wordle";

const wordLength = 5;
const numGuesses = 6;

export type Page = "splash-screen" | "home" | "lobby" | "wordle_daily" | "wordle_repeat";

export const App: React.FC = () => {
  const [loadingState, setLoadingState] = useState<"loading" | "loaded">("loading");
  const [page, setPage] = useState<Page>("splash-screen");

  useEffect(() => {
    // TODO: Mask actual loading, rather than hard-coding seconds
    window.setTimeout(() => setLoadingState("loaded"), 2000);

    // Set home page after load
    window.setTimeout(() => setPage("home"), 2500);
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
        return <Wordle mode="daily" wordLength={wordLength} numGuesses={numGuesses} setPage={setPage} />;

      case "wordle_repeat":
        return <Wordle mode="repeat" wordLength={wordLength} numGuesses={numGuesses} setPage={setPage} />;
    }
  })();

  return <div className="app">{pageComponent}</div>;
};
