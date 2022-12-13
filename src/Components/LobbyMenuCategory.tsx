import { GamemodeCategory, PageDescription } from "../Data/PageDescriptions";
import { SettingsData } from "../Data/SaveData/Settings";
import { LobbyMenuTile } from "./LobbyMenuTile";

interface LobbyMenuCategoryProps {
  category: GamemodeCategory;
  categoryGamemodesPages: PageDescription[];
  settings: SettingsData;
}

export const LobbyMenuCategory = (props: LobbyMenuCategoryProps) => {
  // If there are gamemodes for this category, render a sidebar with the category name
  if (props.categoryGamemodesPages.length > 0) {
    return (
      <div className="sidebar" key={props.category}>
        <div className="sidebar-title">{props.category}</div>
        <ul className="widgets">
          {props.categoryGamemodesPages.map((page) => {
            return <LobbyMenuTile key={page.title} page={page} settings={props.settings} />;
          })}
        </ul>
      </div>
    );
  }

  // No gamemodes for this category, don't even render a sidebar for the category
  return null;
};
