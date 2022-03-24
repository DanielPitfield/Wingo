import React from "react";
import { Page } from "./App";
import { AreaConfig } from "./Area";

// Define the game areas
// NOTE: Remmeber not to do the "repeat" mode!
const areas: AreaConfig[] = [
  {
    name: "Alpha",
    description: "Enjoy the tutorial",
    levels: [
      {
        description: "Start off easy with this simple Wordle!",
        levelProps: {
          mode: "repeat",
          defaultWordLength: 3,
          defaultnumGuesses: 6,
          keyboard: true,
          firstLetterProvided: true,
          puzzleLeaveNumBlanks: 0,
          puzzleRevealMs: 0,
          timerConfig: { isTimed: false },
        },
      },
    ],
  },
  { name: "Bravo", description: "", levels: [] },
  { name: "Charlie", description: "", levels: [] },
];

export const Campaign: React.FC<{
  setSelectedArea: (areaConfig: AreaConfig) => void;
  setPage: (page: Page) => void;
}> = (props) => {
  return (
    <div className="campaign">
      {areas.map((area) => (
        <button
          className="area-button"
          key={area.name}
          onClick={() => {
            props.setSelectedArea(area);
            props.setPage("campaign-area");
          }}
        >
          <strong className="area-name">{area.name}</strong>
          <span className="description">{area.description}</span>
          <span className="level-count">{area.levels.length} levels</span>
        </button>
      ))}
    </div>
  );
};
