import { AllChallenges } from "../Data/Challenges/AllChallenges";
import { Challenge } from "../Components/Challenge";
import { Campaign } from "./Campaign";
import { Theme } from "../Data/Themes";
import { gamemodeCategories, pageDescriptions } from "../Data/PageDescriptions";
import { useNavigate } from "react-router-dom";
import { SettingsData } from "../Data/SaveData/Settings";
import { getHistory } from "../Data/SaveData/GameHistory";
import { LobbyMenuTile } from "../Components/LobbyMenuTile";

interface Props {
  theme: Theme;
  settings: SettingsData;
  setTheme: (theme: Theme) => void;
  addGold: (gold: number) => void;
}

export const LobbyMenu = (props: Props) => {
  const navigate = useNavigate();
  const history = getHistory();

  return (
    <div className="home">
      <div className="games">
        <div className="sidebar campaign-sidebar">
          <Campaign
            onlyShowCurrentArea={true}
            theme={props.theme}
            settings={props.settings}
            setTheme={props.setTheme}
          />
        </div>

        {gamemodeCategories
          .filter((category) => category !== null)
          // For each category
          .map((category, index) => {
            // Get all the gamemodes within the category
            const gamemodePages = pageDescriptions.filter((page) => page.categoryType === category && page.isDisplayed);

            // If there are gamemodes for this category, render a sidebar with the category name
            if (gamemodePages.length > 0) {
              return (
                <div className="sidebar" key={`${category}${index}`}>
                  <div className="sidebar-title">{category}</div>
                  <ul className="widgets">
                    {gamemodePages.map((page) => {
                      return <LobbyMenuTile key={page.title} page={page} settings={props.settings} />;
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
                onClick={() => navigate("/Challenges")}
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
