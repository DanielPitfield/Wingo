import { AllChallenges } from "../Data/Challenges/AllChallenges";
import { Challenge } from "../Components/Challenge";
import Campaign from "./Campaign";
import { Theme } from "../Data/Themes";
import { gamemodeCategories, pageDescriptions } from "../Data/PageDescriptions";
import { useNavigate } from "react-router";
import { SettingsData } from "../Data/SaveData/Settings";
import { getHistory } from "../Data/SaveData/GameHistory";
import LobbyMenuCategory from "../Components/LobbyMenuCategory";
import { useClickChime } from "../Data/Sounds";

interface LobbyMenuProps {
  theme: Theme;
  settings: SettingsData;
  setTheme: (theme: Theme) => void;
  addGold: (gold: number) => void;
}

const LobbyMenu = (props: LobbyMenuProps) => {
  const navigate = useNavigate();
  const history = getHistory();
  const [playClickSoundEffect] = useClickChime(props.settings);

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
          .map((category) => {
            // Get all the gamemodes within the category
            const categoryGamemodePages = pageDescriptions.filter(
              (page) => page.categoryType === category && page.isDisplayed
            );

            return (
              <LobbyMenuCategory
                key={category}
                category={category}
                categoryGamemodesPages={categoryGamemodePages}
                settings={props.settings}
              />
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
                onClick={() => {
                  playClickSoundEffect();
                  navigate("/Challenges");
                }}
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

export default LobbyMenu;
