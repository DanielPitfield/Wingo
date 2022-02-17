import React from "react";
import { Page } from "./App";
import { Button } from "./Button";

export const LobbyMenu: React.FC<{ setPage: (page: Page) => void }> = (props) => {
  return (
    <div className="home">
      <div className="sidebar">
        <h1 className="sidebar-title">
          WORDLE
        </h1>
        <ul className="sidebar-links">
        <li className="sidebar-link">
            <Button mode="default" onClick={() => props.setPage("wordle_daily")} label="Daily" />
          </li>
          <li className="sidebar-link">
            <Button mode="default" onClick={() => props.setPage("wordle_repeat")} label="Standard/Normal" />
          </li>
          <li className="sidebar-link">
            <Button mode="default" onClick={() => props.setPage("wordle_limitless")} label="Limitless/Survival" />
          </li>
          <li className="sidebar-link">
            <Button mode="default" onClick={() => props.setPage("wordle_puzzle")} label="Puzzle Word" />
          </li>
        </ul>
      </div>

      <div className="sidebar">
        <h1 className="sidebar-title">
          NUMBERS
        </h1>
        <ul className="sidebar-links">
        <li className="sidebar-link">
            <Button mode="default" onClick={() => props.setPage("numbo")} label="Numbo" />
          </li>
          <li className="sidebar-link">
            <Button mode="default" onClick={() => props.setPage("nubble")} label="Nubble" />
          </li>
        </ul>
      </div>

      <div className="sidebar">
        <h1 className="sidebar-title">
          OTHER
        </h1>
        <ul className="sidebar-links">
        <li className="sidebar-link">
            <Button mode="default" onClick={() => props.setPage("numbo")} label="Numbo" />
          </li>
          <li className="sidebar-link">
            <Button mode="default" onClick={() => props.setPage("nubble")} label="Nubble" />
          </li>
        </ul>
      </div>
    </div>
  );
};
