import React from "react";
import { Page } from "./MainMenu";
import { Button } from "./Button";

export const Home: React.FC<{ setPage: (page: Page) => void }> = (props) => {
  return (
    <div className="home">
      <div className="sidebar">
        <h1 className="sidebar-title">
          Wingo
        </h1>
        <ul className="sidebar-links">
          <li className="sidebar-link">
            <Button mode="accept" onClick={() => props.setPage("lobby")} label="Play" />
          </li>
        </ul>
      </div>
    </div>
  );
};
