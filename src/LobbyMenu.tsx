import React, { useState } from "react";
import { Page } from "./App";
import { BsGearFill } from "react-icons/bs";
import Star from "./images/star.png";
import GoldCoin from "./images/gold.png";
import { AllChallenges } from "./Challenges/AllChallenges";
import { SaveData } from "./SaveData";
import ProgressBar from "./ProgressBar";
import { Button } from "./Button";

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
  addGold: (gold: number) => void;
}

export const LobbyMenu: React.FC<Props> = (props) => {
  const [optionsConfig, setOptionsConfig] = useState<{ isConfigShown: false } | { isConfigShown: true; Page: Page }>({
    isConfigShown: false,
  });

  function renderGameModeTile(page: Page, displayName: string) {
    return (
      <li className="sidebar-link">
        <span className="game-mode-title">{displayName}</span>
        <div className="game-mode-button-wrapper">
          <Button mode="accept" data-game-mode={page} onClick={() => props.setPage(page)}>
            Play
          </Button>
          <Button
            mode="default"
            className="game_options"
            onClick={() => setOptionsConfig({ isConfigShown: true, Page: page })}
          >
            <BsGearFill />
          </Button>
        </div>
      </li>
    );
  }

  function renderConfigModal(page: Page): React.ReactNode {
    return (
      <div className="modal">
        <div className="options_body">
          <div className="options_title">Options</div>
          <Button mode="default" className="options_close" onClick={() => setOptionsConfig({ isConfigShown: false })}>
            X
          </Button>
          <label>
            <input
              checked={props.gameOptionToggles.find((x) => x.page === page)?.firstLetter || false}
              type="checkbox"
              onChange={(e) => props.firstLetterToggle(e.target.checked, page)}
            ></input>
            First Letter Provided
          </label>
          <label>
            <input
              checked={props.gameOptionToggles.find((x) => x.page === page)?.timer || false}
              type="checkbox"
              onChange={(e) => props.timerToggle(e.target.checked, page)}
            ></input>
            Timer
          </label>
          <label>
            <input
              checked={props.gameOptionToggles.find((x) => x.page === page)?.keyboard || false}
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
      <div className="games">
        <div className="sidebar">
          <div className="sidebar-title">WORDLE</div>
          <ul className="sidebar-links">
            {renderGameModeTile("wingo/daily", "Daily")}
            {renderGameModeTile("wingo/repeat", "Standard/Normal")}
            {renderGameModeTile("wingo/category", "Categories")}
            {renderGameModeTile("wingo/increasing", "Increasing Length")}
            {renderGameModeTile("wingo/limitless", "Limitless/Survival")}
            {renderGameModeTile("wingo/puzzle", "Puzzle Word")}
            {renderGameModeTile("wingo/interlinked", "Interlinked")}
          </ul>
        </div>

        <div className="sidebar">
          <div className="sidebar-title">NUMBERS</div>
          <ul className="sidebar-links">
            {renderGameModeTile("countdown/numbers", "Countdown Numbers")}
            {renderGameModeTile("nubble", "Nubble")}
          </ul>
        </div>

        <div className="sidebar">
          <div className="sidebar-title">OTHER</div>
          <ul className="sidebar-links">
            {renderGameModeTile("campaign", "Campaign")}
            {renderGameModeTile("countdown/letters", "Countdown Letters")}
            {renderGameModeTile("letters_categories", "Categories (5)")}
          </ul>
        </div>
      </div>
      {optionsConfig.isConfigShown && renderConfigModal(optionsConfig.Page)}

      <section className="challenges">
        <h2 className="challenges-title">Challenges</h2>
        {AllChallenges.map((challenge) => {
          const history = SaveData.getHistory();
          const isAcheived = challenge.isAcheived(history);
          const isRedeemed = challenge.isRedeemed;
          const currentProgress = challenge.currentProgress(history);

          const status: "superseded" | "in-progress" | "acheived" | "redeemed" = isRedeemed
            ? "redeemed"
            : isAcheived
            ? "acheived"
            : AllChallenges.some(
                (x) =>
                  x.internalClassName === challenge.internalClassName &&
                  x.target() < challenge.target() &&
                  !x.isAcheived(history)
              )
            ? "superseded"
            : "in-progress";

          const statusDescription = () => {
            switch (status) {
              case "redeemed":
                return "You have completed this challenge!";

              case "acheived":
                return "You have acheived this challenge! Click Redeem to get the reward";

              case "superseded":
                return "A similar challenge with a lower target has not been acheived yet";

              case "in-progress":
                return "Challenge in progress";
            }
          };

          if (status === "redeemed") {
            return null;
          }

          if (status === "superseded") {
            return null;
          }

          return (
            <div
              className={["challenge", isAcheived && !isRedeemed ? "shimmer" : ""].join(" ")}
              key={challenge.id()}
              data-status={status}
              title={statusDescription()}
            >
              <img className="challenge-icon" src={Star} width={32} height={32} alt="" />
              <h3 className="challenge-title">{challenge.userFacingTitle}</h3>
              <p className="challenge-description">{challenge.description()}</p>
              <p className="challenge-reward">
                <img className="challenge-reward-icon" height={18} width={18} src={GoldCoin} alt="" />
                {challenge.reward().goldCoins}
              </p>
              <ProgressBar
                progress={Math.min(challenge.target(), currentProgress)}
                total={challenge.target()}
                display={{ type: "solid", color: "#ffd613" }}
              >
                {currentProgress} / {challenge.target()} {challenge.unit}
              </ProgressBar>
              {isAcheived && !isRedeemed && (
                <Button
                  mode="default"
                  className="challenge-redeem-reward"
                  onClick={() => {
                    challenge.isRedeemed = true;
                    props.addGold(challenge.reward().goldCoins);
                  }}
                >
                  Redeem
                </Button>
              )}
            </div>
          );
        }).filter((x) => x)}
      </section>
    </div>
  );
};
