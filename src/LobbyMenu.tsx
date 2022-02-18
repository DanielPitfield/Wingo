import React from "react";
import { Page } from "./App";
import { Button } from "./Button";

export const LobbyMenu: React.FC<{ setPage: (page: Page) => void }> = (
  props
) => {
  function renderGameModeTile(page: Page, displayName: string) {
    return (
      <li className="sidebar-link">
        <button className="game-mode-button" data-game-mode={page} onClick={() => props.setPage(page)}>
          <span className="game-mode-title">{displayName}</span>
        </button>
      </li>
    );
  }

  return (
    <div className="home">
      <div className="sidebar">
        <h1 className="sidebar-title">WORDLE</h1>
        <ul className="sidebar-links">
          {renderGameModeTile("wordle_daily", "Daily", )}
          {renderGameModeTile("wordle_repeat", "Standard/Normal")}
          {renderGameModeTile("wordle_limitless", "Limitless/Survival")}
          {renderGameModeTile("wordle_puzzle", "Puzzle Word")}
        </ul>
      </div>

      <div className="sidebar">
        <h1 className="sidebar-title">NUMBERS</h1>
        <ul className="sidebar-links">
          {renderGameModeTile("numbo", "Numbo")}
          {renderGameModeTile("nubble", "Nubble")}
        </ul>
      </div>

      <div className="sidebar">
        <h1 className="sidebar-title">OTHER</h1>
        <ul className="sidebar-links">
          {renderGameModeTile("numbo", "Numbo")}
          {renderGameModeTile("nubble", "Nubble")}
        </ul>
      </div>
    </div>
  );
};
