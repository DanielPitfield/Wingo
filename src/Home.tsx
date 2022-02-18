import React from "react";
import { Page } from "./App";
import { Button } from "./Button";
import { Logo } from "./Logo";

export const Home: React.FC<{ setPage: (page: Page) => void }> = (props) => {
  return (
    <div className="home">
      <div className="sidebar">
        <h1 className="sidebar-title">
          <Logo></Logo>
        </h1>
        <ul className="sidebar-links">
          <li className="sidebar-link">
            <Button mode="accept" onClick={() => props.setPage("lobby")}>Play</Button>
          </li>
        </ul>
      </div>
    </div>
  );
};
