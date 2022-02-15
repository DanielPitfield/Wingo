import React from "react";
import { Page } from "./App";
import { Button } from "./Button";

export const LobbyMenu: React.FC<{ setPage: (page: Page) => void }> = (props) => {
  return (
    <div className="home">
      <div className="sidebar">
        <h1 className="sidebar-title">
          Minigames
        </h1>
        <ul className="sidebar-links">
          <li>
            <Button mode="default" onClick={() => props.setPage("wordle_repeatable")} label="Wordle (repeatable)" />
          </li>
          <li>
            <Button mode="default" onClick={() => props.setPage("home")} label="Back to Main Menu" />
          </li>
        </ul>
      </div>
    </div>
  );
};
