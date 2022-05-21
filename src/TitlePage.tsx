import React from "react";
import { Page } from "./App";
import { Button } from "./Button";
import { Logo } from "./Logo";
import { SettingsData } from "./SaveData";
import BackgroundSrc from "./images/background.png";
import { FiCodesandbox, FiPlay, FiSettings, FiShuffle } from "react-icons/fi";

export const TitlePage: React.FC<{ setPage: (page: Page) => void; settings: SettingsData }> = (props) => {
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
