import React, { useState } from "react";
import { Page } from "./App";
import { BsGearFill } from "react-icons/bs";
import { AllChallenges } from "./Challenges/AllChallenges";
import { SaveData } from "./SaveData";
import ProgressBar from "./ProgressBar";

interface Props {
  setPage: (page: Page) => void;
  firstLetterToggle: (value: boolean, page: Page) => void;
  timerToggle: (value: boolean, page: Page) => void;
  keyboardToggle: (value: boolean, page: Page) => void;
  gameOptionToggles: {
    page: Page;
    firstLetter: boolean;
    timer: boolean;
    keyboard: boolean;
  }[];
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
          >
            <BsGearFill />
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

  function renderConfigModal(page: Page): React.ReactNode {
    return (
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
              checked={
                props.gameOptionToggles.find((x) => x.page === page)
                  ?.firstLetter || false
              }
              type="checkbox"
              onChange={(e) => props.firstLetterToggle(e.target.checked, page)}
            ></input>
            First Letter Provided
          </label>
          <label>
            <input
              checked={
                props.gameOptionToggles.find((x) => x.page === page)
                  ?.timer || false
              }
              type="checkbox"
              onChange={(e) => props.timerToggle(e.target.checked, page)}
            ></input>
            Timer
          </label>
          <label>
            <input
              checked={
                props.gameOptionToggles.find((x) => x.page === page)
                  ?.keyboard || false
              }
              type="checkbox"
              onChange={(e) => props.keyboardToggle(e.target.checked, page)}
            ></input>
            Keyboard
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      <div className="sidebar">
        <div className="sidebar-title">WORDLE</div>
        <ul className="sidebar-links">
          {renderGameModeTile("wordle_daily", "Daily")}
          {renderGameModeTile("wordle_repeat", "Standard/Normal")}
          {renderGameModeTile("wordle_category", "Categories")}
          {renderGameModeTile("wordle_increasing", "Increasing Length")}
          {renderGameModeTile("wordle_limitless", "Limitless/Survival")}
          {renderGameModeTile("wordle_puzzle", "Puzzle Word")}
          {renderGameModeTile("wordle_interlinked", "Interlinked")}
        </ul>
      </div>

      <div className="sidebar">
        <div className="sidebar-title">NUMBERS</div>
        <ul className="sidebar-links">
          {renderGameModeTile("countdown_numbers", "Countdown Numbers")}
          {renderGameModeTile("nubble", "Nubble")}
        </ul>
      </div>

      <div className="sidebar">
        <div className="sidebar-title">OTHER</div>
        <ul className="sidebar-links">
          {renderGameModeTile("countdown_letters", "Countdown Letters")}
        </ul>
      </div>

      {optionsConfig.isConfigShown && renderConfigModal(optionsConfig.Page)}

      <section className="challenges">
        <h2 className="challenges-title">Challenges</h2>
        {AllChallenges.map((challenge) => {
          const history = SaveData.getHistory();
          const isAcheived = challenge.isAcheived(history);
          const currentProgress = challenge.currentProgress(history);

          return (
            <div className="challenge" data-is-acheived={isAcheived}>
              <h3 className="challenge-title">{challenge.title}</h3>
              <p className="challenge-description">{challenge.description}</p>
              {currentProgress} / {challenge.target}{" "}
              <ProgressBar
                progress={Math.min(challenge.target, currentProgress)}
                total={challenge.target}
              />
            </div>
          );
        })}
      </section>
    </div>
  );
};
