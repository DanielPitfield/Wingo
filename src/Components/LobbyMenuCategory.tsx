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

  // How many gamemodes should be shown on the carousel at any one time (also the minimum number in order for a carousel to be shown)?
  const NUM_ITEMS_PER_VIEW = 3;

  // No gamemodes for this category, don't render a carousel
  if (props.categoryGamemodesPages.length <= 0) {
    return null;
  }

  // Don't need a carousel, just show the tiles normally
  if (props.categoryGamemodesPages.length <= NUM_ITEMS_PER_VIEW) {
    return (
      <div className="sidebar" key={props.category}>
        <div className="sidebar-title">{props.category}</div>
        <ul className="widgets default">
          <div className="carousel carousel-slider">
            <button type="button" aria-label="next slide / item" className="control-arrow control-prev"></button>
            {props.categoryGamemodesPages.map((page) => {
              return <LobbyMenuTile key={page.title} page={page} settings={props.settings} />;
            })}
            <button type="button" aria-label="next slide / item" className="control-arrow control-next"></button>
          </div>
        </ul>
      </div>
    );
  }

  // Carousel
  return (
    <div className="sidebar" key={props.category}>
      <div className="sidebar-title">{props.category}</div>
      <ul className="widgets carousel">
        <Carousel
          onClickItem={(index: number, _) => navigate(props.categoryGamemodesPages[index].path)}
          showIndicators={false}
          showThumbs={false}
          showStatus={false}
          centerMode
          centerSlidePercentage={Math.floor(100 / NUM_ITEMS_PER_VIEW)}
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
