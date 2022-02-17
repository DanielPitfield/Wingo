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
        <li className="sidebar-link">
            <Button mode="default" onClick={() => props.setPage("wordle_daily")} label="Wordle (daily)" />
          </li>
          <li className="sidebar-link">
            <Button mode="default" onClick={() => props.setPage("wordle_repeat")} label="Wordle (repeat)" />
          </li>
          <li className="sidebar-link">
            <Button mode="default" onClick={() => props.setPage("wordle_limitless")} label="Wordle (limitless)" />
          </li>
          <li className="sidebar-link">
            <Button mode="default" onClick={() => props.setPage("wordle_puzzle")} label="Wordle (puzzle)" />
          </li>
          <li className="sidebar-link">
            <Button mode="default" onClick={() => props.setPage("home")} label="Back to Main Menu" />
          </li>
        </ul>
      </div>
    </div>
  );
};
