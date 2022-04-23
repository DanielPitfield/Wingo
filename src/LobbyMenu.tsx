import React, { useState } from "react";
import { Page, pages } from "./App";
import { BsGearFill, BsInfoCircleFill } from "react-icons/bs";
import Star from "./images/star.png";
import GoldCoin from "./images/gold.png";
import { AllChallenges } from "./Challenges/AllChallenges";
import { SaveData, SettingsData } from "./SaveData";
import ProgressBar from "./ProgressBar";
import { Button } from "./Button";
import { Campaign } from "./Campaign/Campaign";
import { Theme } from "./Themes";
import { AreaConfig } from "./Campaign/Area";
import { LevelConfig } from "./Campaign/Level";
import { useNotificationChime } from "./Sounds";

interface Props {
  theme: Theme;
  settings: SettingsData;
  setTheme: (theme: Theme) => void;
  setPage: (page: Page) => void;
  setSelectedArea: (areaConfig: AreaConfig) => void;
  setSelectedCampaignLevel: (level: LevelConfig) => void;
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
  const [playNotificationChime] = useNotificationChime(props.settings);

  /**
   *
   * @param page
   * @returns
   */
  function renderGameModeTile(page: Page) {
    const pageInfo = pages.find((x) => x.page === page);

    return (
      <li className="widget">
        <span className="widget-title">
          {pageInfo?.shortTitle || pageInfo?.title || "(Unnamed)"}
          {pageInfo?.description && <BsInfoCircleFill className="icon tooltip-icon" />}
          <p className="tooltip">{pageInfo?.description}</p>
        </span>
        <div className="widget-button-wrapper">
          <Button mode="accept" data-game-mode={page} settings={props.settings} onClick={() => props.setPage(page)}>
            Play
          </Button>
          <Button
            mode="default"
            className="game_options"
            settings={props.settings}
            onClick={() => setOptionsConfig({ isConfigShown: true, Page: page })}
          >
            <BsGearFill />
          </Button>
        </div>
      </li>
    );
  }

  function renderConfigModal(page: Page): React.ReactNode {
    const pageInfo = pages.find((x) => x.page === page);

    return (
      <div className="modal">
        <div className="options_body">
          <div className="options_title">
            Options for <strong>{pageInfo?.title || page}</strong>
          </div>
          <Button
            mode="default"
            className="options_close"
            settings={props.settings}
            onClick={() => setOptionsConfig({ isConfigShown: false })}
          >
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
        <div className="sidebar campaign-sidebar">
          <Campaign
            onlyShowCurrentArea
            setSelectedArea={props.setSelectedArea}
            setSelectedCampaignLevel={props.setSelectedCampaignLevel}
            theme={props.theme}
            settings={props.settings}
            setTheme={props.setTheme}
            setPage={props.setPage}
          />
        </div>

        <div className="sidebar">
          <div className="sidebar-title">Letters</div>
          <ul className="widgets">
            {renderGameModeTile("wingo/daily")}
            {renderGameModeTile("wingo/repeat")}
            {renderGameModeTile("wingo/category")}
            {renderGameModeTile("wingo/increasing")}
            {renderGameModeTile("wingo/limitless")}
            {renderGameModeTile("wingo/puzzle")}
            {renderGameModeTile("wingo/interlinked")}
            {renderGameModeTile("countdown/letters")}
          </ul>
        </div>

        <div className="sidebar">
          <div className="sidebar-title">Numbers</div>
          <ul className="widgets">
            {renderGameModeTile("numbers/arithmetic_reveal")}
            {renderGameModeTile("numbers/arithmetic_drag/order")}
            {renderGameModeTile("numbers/arithmetic_drag/match")}
            {renderGameModeTile("countdown/numbers")}
            {renderGameModeTile("nubble")}
          </ul>
        </div>

        <div className="sidebar">
          <div className="sidebar-title">Puzzle</div>
          <ul className="widgets">
            {renderGameModeTile("puzzle/sequence")}
            {renderGameModeTile("only_connect/wall")}
            {renderGameModeTile("letters_categories")}
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
              data-animation-setting={props.settings.graphics.animation}
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
                {Math.min(challenge.target(), currentProgress)} / {challenge.target()} {challenge.unit}
              </ProgressBar>
              {isAcheived && !isRedeemed && (
                <Button
                  mode="default"
                  className="challenge-redeem-reward"
                  settings={props.settings}
                  onClick={() => {
                    challenge.isRedeemed = true;
                    props.addGold(challenge.reward().goldCoins);
                    playNotificationChime();
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
