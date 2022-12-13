import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useNavigate } from "react-router-dom";
import { GamemodeCategory, PageDescription } from "../Data/PageDescriptions";
import { SettingsData } from "../Data/SaveData/Settings";
import LobbyMenuTile from "./LobbyMenuTile";

interface LobbyMenuCategoryProps {
  category: GamemodeCategory;
  categoryGamemodesPages: PageDescription[];
  settings: SettingsData;
}

const LobbyMenuCategory = (props: LobbyMenuCategoryProps) => {
  const navigate = useNavigate();

  // No gamemodes for this category, don't render a carousel
  if (props.categoryGamemodesPages.length <= 0) {
    return null;
  }

  return (
    <div className="sidebar" key={props.category}>
      <div className="sidebar-title">{props.category}</div>
      <ul className="widgets">
        <Carousel
          onClickItem={(index: number, _) => navigate(props.categoryGamemodesPages[index].path)}
          showIndicators={false}
          showThumbs={false}
          showStatus={false}
          centerMode
          centerSlidePercentage={33}
          useKeyboardArrows
          infiniteLoop
        >
          {props.categoryGamemodesPages.map((page) => {
            return <LobbyMenuTile key={page.title} page={page} settings={props.settings} />;
          })}
        </Carousel>
      </ul>
    </div>
  );
};

export default LobbyMenuCategory;
