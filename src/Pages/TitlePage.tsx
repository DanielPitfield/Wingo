import React from "react";
import { PageName } from "../PageNames";
import { Button } from "../Components/Button";
import { Logo } from "../Components/Logo";
import { SettingsData } from "../Data/SaveData";
import BackgroundSrc from "../Data/Images/background.png";
import { FiCodesandbox, FiPlay, FiSettings, FiShuffle } from "react-icons/fi";

export const TitlePage: React.FC<{ setPage: (page: PageName) => void; settings: SettingsData }> = (props) => {
  return (
    <div className="title-page" style={{ backgroundImage: `url(${BackgroundSrc})` }}>
      <div className="sidebar">
        <div className="sidebar-header">
          <Logo settings={props.settings} />
          <h2 className="sidebar-title">A game of letters, numbers and puzzles!</h2>
        </div>
        <ul className="sidebar-links">
          <li className="sidebar-link">
            <Button mode="accept" onClick={() => props.setPage("campaign")}>
              <FiPlay /> Campaign
            </Button>
          </li>
          <li className="sidebar-link">
            <Button mode="default" onClick={() => props.setPage("random")}>
              <FiShuffle /> Quick game
            </Button>
          </li>
          <li className="sidebar-link">
            <Button mode="default" onClick={() => props.setPage("home")}>
              <FiCodesandbox /> Custom game
            </Button>
          </li>
          <li className="sidebar-link spacer"></li>
          <li className="sidebar-link">
            <Button mode="default" onClick={() => props.setPage("settings")}>
              <FiSettings /> Settings
            </Button>
          </li>
        </ul>
      </div>
    </div>
  );
};
