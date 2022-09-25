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
import { gamemodeCategories, pageDescriptions } from "../Data/PageDescriptions";
import { useNavigate } from "react-router-dom";

interface Props {
  theme: Theme;
  settings: SettingsData;
  setTheme: (theme: Theme) => void;
  setSelectedArea: (areaConfig: AreaConfig) => void;
  setSelectedCampaignLevel: (level: LevelConfig) => void;
  addGold: (gold: number) => void;
}

export const LobbyMenu = (props: Props) => {
  const navigate = useNavigate();

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
          <Button mode="accept" data-game-mode={page} settings={props.settings} onClick={() => navigate(page)}>
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
          />
        </div>

        {gamemodeCategories
          .filter((category) => category !== null)
          // For each category
          .map((category) => {
            // Get all the gamemodes within the category
            const gamemodePages = pageDescriptions.filter((page) => page.categoryType === category && page.isDisplayed);

            // If there are gamemodes for this category, render a sidebar with the category name
            if (gamemodePages.length > 0) {
              return (
                <div className="sidebar">
                  <div className="sidebar-title">{category}</div>
                  <ul className="widgets">
                    {gamemodePages.map((page) => {
                      // And then render a tile for each gamemode (nested within this sidebar)
                      return renderGameModeTile(page.page);
                    })}
                  </ul>
                </div>
              );
            }

            // No gamemodes for this category, don't even render a sidebar for the category
            return null;
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
                onClick={() => navigate("/challenges")}
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
