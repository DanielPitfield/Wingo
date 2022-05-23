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
import { FiPlay } from "react-icons/fi";

interface Props {
  theme: Theme;
  settings: SettingsData;
  setTheme: (theme: Theme) => void;
  setPage: (page: Page) => void;
  setSelectedArea: (areaConfig: AreaConfig) => void;
  setSelectedCampaignLevel: (level: LevelConfig) => void;
  wordLengthValue: (value: number, page: Page) => void;
  firstLetterToggle: (value: boolean, page: Page) => void;
  showHintToggle: (value: boolean, page: Page) => void;
  timerToggle: (value: boolean, page: Page) => void;
  gameOptionToggles: {
    page: Page;
    wordLength?: number;
    firstLetter?: boolean;
    showHint?: boolean;
    timer?: boolean;
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
    // Does the page have game options/settings?
    const hasSettings = props.gameOptionToggles.find((x) => x.page === page) !== undefined;

    return (
      <li className="widget">
        <span className="widget-title">
          {pageInfo?.shortTitle || pageInfo?.title || "(Unnamed)"}
          {pageInfo?.description && <BsInfoCircleFill className="icon tooltip-icon" />}
          <p className="tooltip">{pageInfo?.description}</p>
        </span>
        <div className="widget-button-wrapper">
          <Button mode="accept" data-game-mode={page} settings={props.settings} onClick={() => props.setPage(page)}>
            <FiPlay /> Play
          </Button>
          {hasSettings && (
            <Button
              mode="default"
              className="game_options"
              settings={props.settings}
              onClick={() => setOptionsConfig({ isConfigShown: true, Page: page })}
            >
              <BsGearFill />
            </Button>
          )}
        </div>
      </li>
    );
  }

  function renderConfigModal(page: Page): React.ReactNode {
    const pageInfo = pages.find((x) => x.page === page);
    // Does the page have game options/settings?
    const hasSettings = props.gameOptionToggles.find((x) => x.page === page) !== undefined;

    // Don't need a config modal (for a page with nothing to configure)
    if (!hasSettings) {
      return;
    }

    return (
      <Modal
        mode="default"
        name="options"
        title={
          <>
            Options for <strong>{pageInfo?.title || page}</strong>
          </>
        }
        onClose={() => setOptionsConfig({ isConfigShown: false })}
      >
        {props.gameOptionToggles.find((x) => x.page === page)?.wordLength !== undefined && (
          <label>
            <input
              type="number"
              value={props.gameOptionToggles.find((x) => x.page === page)?.wordLength}
              min={4}
              max={11}
              onChange={(e) => props.wordLengthValue(parseInt(e.target.value), page)}
            ></input>
            Word Length
          </label>
        )}
        {props.gameOptionToggles.find((x) => x.page === page)?.firstLetter !== undefined && (
          <label>
            <input
              checked={props.gameOptionToggles.find((x) => x.page === page)?.firstLetter}
              type="checkbox"
              onChange={(e) => props.firstLetterToggle(e.target.checked, page)}
            ></input>
            First Letter Provided
          </label>
        )}
        {props.gameOptionToggles.find((x) => x.page === page)?.showHint !== undefined && (
          <label>
            <input
              checked={props.gameOptionToggles.find((x) => x.page === page)?.showHint}
              type="checkbox"
              onChange={(e) => props.showHintToggle(e.target.checked, page)}
            ></input>
            Hints
          </label>
        )}
        {props.gameOptionToggles.find((x) => x.page === page)?.timer !== undefined && (
          <label>
            <input
              checked={props.gameOptionToggles.find((x) => x.page === page)?.timer}
              type="checkbox"
              onChange={(e) => props.timerToggle(e.target.checked, page)}
            ></input>
            Timer
          </label>
        )}
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
          <div className="sidebar-title">Daily / Weekly</div>
          <ul className="widgets">
            {renderGameModeTile("wingo/daily")}
            {renderGameModeTile("wingo/crossword/daily")}
            {renderGameModeTile("wingo/crossword/weekly")}
          </ul>
        </div>

        <div className="sidebar">
          <div className="sidebar-title">Letters</div>
          <ul className="widgets">
            {renderGameModeTile("wingo/repeat")}
            {renderGameModeTile("wingo/category")}
            {renderGameModeTile("wingo/increasing")}
            {renderGameModeTile("wingo/limitless")}
            {renderGameModeTile("wingo/puzzle")}
            {renderGameModeTile("wingo/interlinked")}
            {renderGameModeTile("wingo/crossword")}
            {renderGameModeTile("wingo/crossword/fit")}
            {renderGameModeTile("countdown/letters")}
            {renderGameModeTile("countdown/conundrum")}
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
            {renderGameModeTile("verbal_reasoning/word_codes")}
            {renderGameModeTile("verbal_reasoning/word_codes/match")}
            {renderGameModeTile("letters_categories")}
          </ul>
        </div>

        <div className="sidebar">
          <div className="sidebar-title">Gameshow Presets</div>
          <ul className="widgets">
            {renderGameModeTile("lingo/gameshow")}
            {renderGameModeTile("countdown/gameshow")}
            {renderGameModeTile("random")}
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
