import React, { useState } from "react";
import { Page, pages } from "./App";
import { BsGearFill, BsInfoCircleFill } from "react-icons/bs";
import { AllChallenges } from "./Challenges/AllChallenges";
import { SaveData, SettingsData } from "./SaveData";
import { Challenge } from "./Challenges/Challenge";
import { Button } from "./Button";
import { Campaign } from "./Campaign/Campaign";
import { Theme } from "./Themes";
import { AreaConfig } from "./Campaign/Area";
import { LevelConfig } from "./Campaign/Level";
import { Modal } from "./Modal";

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
  const history = SaveData.getHistory();

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
      <Modal
        mode="default"
        title={
          <>
            Options for <strong>{pageInfo?.title || page}</strong>
          </>
        }
        onClose={() => setOptionsConfig({ isConfigShown: false })}
      >
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
      </Modal>
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
            {renderGameModeTile("wingo/crossword")}
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
            {renderGameModeTile("verbal_reasoning/match")}
            {renderGameModeTile("verbal_reasoning/number_sets")}
            {renderGameModeTile("verbal_reasoning/algebra")}
            {renderGameModeTile("verbal_reasoning/word_codes/match")}
            {renderGameModeTile("letters_categories")}
          </ul>
        </div>
      </div>
      {optionsConfig.isConfigShown && renderConfigModal(optionsConfig.Page)}

      <section className="challenges">
        <h2 className="challenges-title">Challenges</h2>
        {AllChallenges.map((challenge) => {
          const { status } = challenge.getStatus(history);

          return {
            status,
            element: (
              <Challenge
                key={challenge.id()}
                mode="default"
                challenge={challenge}
                settings={props.settings}
                onClick={() => props.setPage("challenges")}
                addGold={props.addGold}
              />
            ),
          };
        })
          // Filter out challenges that are already "redeemed", or "superseded" (a similar challenge with a lower target has not been acheived yet)
          .filter((challenge) => challenge.status !== "redeemed" && challenge.status !== "superseded")

          // Sort by the status alphabetically (i.e. "achieved" will be rendered before "in-progress"),
          // meaning redeemable challenges appear at the top
          .sort((a, b) => a.status.localeCompare(b.status))

          // Render the JSX element
          .map((challenge) => challenge.element)}
      </section>
    </div>
  );
};
