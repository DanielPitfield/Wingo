import React from "react";
import { Page, pages } from "../App";
import { BsInfoCircleFill } from "react-icons/bs";
import { AllChallenges } from "../Data/Challenges/AllChallenges";
import { SaveData, SettingsData } from "../Data/SaveData";
import { Challenge } from "../Components/Challenge";
import { Button } from "../Components/Button";
import { Campaign } from "./Campaign";
import { Theme } from "../Data/Themes";
import { AreaConfig } from "./Area";
import { LevelConfig } from "../Components/Level";
import { FiPlay } from "react-icons/fi";

interface Props {
  theme: Theme;
  settings: SettingsData;
  setTheme: (theme: Theme) => void;
  setPage: (page: Page) => void;
  setSelectedArea: (areaConfig: AreaConfig) => void;
  setSelectedCampaignLevel: (level: LevelConfig) => void;
  addGold: (gold: number) => void;
}

export const LobbyMenu: React.FC<Props> = (props) => {
  const history = SaveData.getHistory();

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
            <FiPlay />
            Play
          </Button>
        </div>
      </li>
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
          <div className="sidebar-title">Wingo</div>
          <ul className="widgets">
            {renderGameModeTile("wingo/repeat")}
            {renderGameModeTile("wingo/puzzle")}
            {renderGameModeTile("wingo/increasing")}
            {renderGameModeTile("wingo/limitless")}
            {renderGameModeTile("wingo/category")}
            {renderGameModeTile("wingo/interlinked")}
            {renderGameModeTile("wingo/crossword")}
          </ul>
        </div>

        <div className="sidebar">
          <div className="sidebar-title">Letters</div>
          <ul className="widgets">
            {renderGameModeTile("only_connect/wall")}
            {renderGameModeTile("countdown/letters")}
            {renderGameModeTile("countdown/conundrum")}
            {renderGameModeTile("letters_categories")}
            {renderGameModeTile("verbal_reasoning/sameLetters")}
            {renderGameModeTile("verbal_reasoning/word_codes/question")}
            {renderGameModeTile("verbal_reasoning/word_codes/match")}
            {renderGameModeTile("wingo/crossword/fit")}
          </ul>
        </div>

        <div className="sidebar">
          <div className="sidebar-title">Numbers</div>
          <ul className="widgets">
            {renderGameModeTile("numbers/arithmetic_reveal")}
            {renderGameModeTile("nubble")}
            {renderGameModeTile("countdown/numbers")}
            {renderGameModeTile("numbers/arithmetic_drag/order")}
            {renderGameModeTile("numbers/arithmetic_drag/match")}
            {renderGameModeTile("verbal_reasoning/number_sets")}
            {renderGameModeTile("verbal_reasoning/algebra")}
          </ul>
        </div>

        <div className="sidebar">
          <div className="sidebar-title">Puzzle</div>
          <ul className="widgets">{renderGameModeTile("puzzle/sequence")}</ul>
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
