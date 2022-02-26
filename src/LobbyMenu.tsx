import React, { useState } from "react";
import { Page } from "./App";
import { BsGearFill } from "react-icons/bs";

interface Props {
  setPage: (page: Page) => void;
  firstLetterToggle: (value: boolean, page: Page) => void;
  timerToggle: (value: boolean, page: Page) => void;
}

export const LobbyMenu: React.FC<Props> = (props) => {
  const [optionsConfig, setOptionsConfig] = useState<
    { isConfigShown: false } | { isConfigShown: true; Page: Page }
  >({ isConfigShown: false });

  function renderGameModeTile(page: Page, displayName: string) {
    return (
      <li className="sidebar-link">
        <span className="game-mode-title">{displayName}</span>
        <div className="game-mode-button-wrapper">
          <button
            className="game_options"
            onClick={() =>
              setOptionsConfig({ isConfigShown: true, Page: page })
            }
          ><BsGearFill/>
          </button>
          <button
            className="game-mode-button"
            data-game-mode={page}
            onClick={() => props.setPage(page)}
          ></button>
        </div>
      </li>
    );
  }

  return (
    <div className="home">
      <div className="sidebar">
        <div className="sidebar-title">WORDLE</div>
        <ul className="sidebar-links">
          {renderGameModeTile("wordle_daily", "Daily")}
          {renderGameModeTile("wordle_repeat", "Standard/Normal")}
          {renderGameModeTile("wordle_increasing", "Increasing Length")}
          {renderGameModeTile("wordle_limitless", "Limitless/Survival")}
          {renderGameModeTile("wordle_puzzle", "Puzzle Word")}
          {renderGameModeTile("wordle_interlinked", "Interlinked")}
        </ul>
      </div>

      <div className="sidebar">
        <div className="sidebar-title">NUMBERS</div>
        <ul className="sidebar-links">
          {renderGameModeTile("numbo", "Numbo")}
          {renderGameModeTile("nubble", "Nubble")}
        </ul>
      </div>

      <div className="sidebar">
        <div className="sidebar-title">OTHER</div>
        <ul className="sidebar-links">
          {renderGameModeTile("numbo", "Numbo")}
          {renderGameModeTile("nubble", "Nubble")}
        </ul>
      </div>
      {optionsConfig.isConfigShown && (
        <div className="modal">
          <div className="options_body">
            <div className="options_title">Options</div>
            <button
              className="options_close"
              onClick={() => setOptionsConfig({ isConfigShown: false })}
            >
              X
            </button>
            <label>
              <input
                type="checkbox"
                onChange={(e) =>
                  props.firstLetterToggle(e.target.checked, optionsConfig.Page)
                }
              ></input>
              First Letter Provided
            </label>
            <label>
              <input
                type="checkbox"
                onChange={(e) =>
                  props.timerToggle(e.target.checked, optionsConfig.Page)
                }
              ></input>
              Timer
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
