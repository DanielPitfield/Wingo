import { GamemodeCategories, pageDescriptions } from "../Data/PageDescriptions";
import { PageName } from "../Data/PageNames";
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
  setPage: (page: PageName) => void;
  setSelectedArea: (areaConfig: AreaConfig) => void;
  setSelectedCampaignLevel: (level: LevelConfig) => void;
  addGold: (gold: number) => void;
}

export const LobbyMenu = (props: Props) => {
  const history = SaveData.getHistory();

  function renderGameModeTile(page: PageName) {
    const pageInfo = pageDescriptions.find((x) => x.page === page);

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

        {GamemodeCategories.filter((category) => category !== null).map((category) => {
          // For each gamemode category, render a sidebar with the category name
          return (
            <div className="sidebar">
              <div className="sidebar-title">{category}</div>
              <ul className="widgets">
                {pageDescriptions
                  .filter((page) => page.categoryType === category && page.isDisplayed)
                  .map((page) => {
                    // Get all the gamemodes within this category and render a tile for each of them
                    return renderGameModeTile(page.page);
                  })}
              </ul>
            </div>
          );
        })}
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
