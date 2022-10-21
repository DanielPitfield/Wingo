import { Themes } from "../Themes";
import { AreaConfig } from "../../Pages/Area";
import { commonWingoSettings } from "../DefaultGamemodeSettings";

// TODO: Is there a way for the list of levels to be the components to return themselves (e.g a WingoConfig with these specified settings)

export const area: AreaConfig = {
  name: "Tutorial",
  theme: Themes.GenericWingo,
  unlock_level: {
    type: "unlock-level",
    hint: (
      <>
        Every area must first be unlocked by guessing the name of the area
        <br />
        Since this is the tutorial, we'll tell you that the answer is: <strong>START</strong>
        <br />
        Try entering the word <strong>START</strong>
      </>
    ),
    level: {
      gameCategory: "Wingo",
      page: "/Wingo/Repeat",
      levelProps: {
        mode: "repeat",
        targetWord: "start",
        // TODO: Why is the LevelConfig type not being enforced, you can add any property you want here?
        gamemodeSettings: {
          ...commonWingoSettings,
        },
      },
    },
  },
  levels: [
    {
      type: "level",
      hint: <>To acquire new knowledge</>,
      levelButtonCoords: {
        x: 10,
        y: 10,
      },
      level: {
        gameCategory: "Wingo",
        page: "/Wingo/Repeat",
        levelProps: {
          mode: "repeat",
          targetWord: "learn",
          gamemodeSettings: {
            ...commonWingoSettings,
          },
        },
      },
    },
  ],
};
