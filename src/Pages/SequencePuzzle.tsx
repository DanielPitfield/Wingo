import { CSSProperties, useEffect, useState } from "react";
import Button from "../Components/Button";
import MessageNotification from "../Components/MessageNotification";
import { SequencePuzzleTemplates } from "../Data/SequencePuzzleTemplates";
import { Theme, ThemeIcons } from "../Data/Themes";
import { LEVEL_FINISHING_TEXT } from "../Components/Level";
import { Difficulty } from "../Data/DefaultGamemodeSettings";
import { SettingsData } from "../Data/SaveData/Settings";

/** Config for a specific puzzle (exported for config from campaign) */
export type PuzzleConfigProps = {
  mode: "sequence";
  difficulty: Difficulty;
  correctAnswerDescription: string;
  sequence: {
    hint: SequencePuzzleStyling[];
    correctAnswer: SequencePuzzleStyling;
    incorrectAnswers: SequencePuzzleStyling[];
  };
};

/** Styling of the puzzle icons (defining the sequence) */
type SequencePuzzleStyling = {
  icon1: CSSProperties;
  icon2?: CSSProperties;
  icon3?: CSSProperties;
  icon4?: CSSProperties;
  icon5?: CSSProperties;
};

/** Properties of the component */
export interface SequencePuzzleProps {
  campaignConfig:
    | {
        isCampaignLevel: true;
        // What score must be achieved to pass the campaign level?
        targetScore: number;
      }
    | { isCampaignLevel: false };
  gamemodeSettings: {
    defaultPuzzle?: PuzzleConfigProps;
  };
}

interface Props extends SequencePuzzleProps {
  theme: Theme;
  settings: SettingsData;
  setTheme: (theme: Theme) => void;
  addGold: (gold: number) => void;
  onComplete: (wasCorrect: boolean) => void;
}

const SequencePuzzle = (props: Props) => {
  // Result of the guess
  const [result, setResult] = useState<"in-progress" | "correct" | "incorrect">("in-progress");

  // Current puzzle
  const [puzzle, setPuzzle] = useState<PuzzleConfigProps | undefined>(props.gamemodeSettings.defaultPuzzle);

  // Index at which to display the correct answer, among the incorrect answers
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);

  // Hold a mapping to swap the icon images (so the theme is not the same for many of the puzzles)
  // The mapping is from the icon to the icon image
  const [iconMapping, setIconMapping] = useState<{
    icon1: keyof ThemeIcons;
    icon2: keyof ThemeIcons;
    icon3: keyof ThemeIcons;
    icon4: keyof ThemeIcons;
    icon5: keyof ThemeIcons;
  }>();

  // Picks a random puzzle if one was not passed in through the props
  useEffect(() => {
    if (props.gamemodeSettings.defaultPuzzle) {
      setPuzzle(props.gamemodeSettings.defaultPuzzle);
    } else {
      setPuzzle({
        ...Object.values(SequencePuzzleTemplates)[
          Math.round(Math.random() * (Object.values(SequencePuzzleTemplates).length - 1))
        ],
      });
    }
  }, [props.gamemodeSettings.defaultPuzzle]);

  // Configures the icon mapping and answer option sort order on load
  useEffect(() => {
    if (result !== "in-progress") {
      return;
    }

    if (!puzzle) {
      return;
    }

    // Set the correct answer option index to be randomly among the incorrect answers
    setCorrectAnswerIndex(Math.floor(Math.random() * puzzle.sequence.incorrectAnswers.length));

    // Get a random array order of 1-5
    const randomOrder = [1, 2, 3, 4, 5].sort((_) => (Math.random() > 0.5 ? 1 : -1));

    // Hold a mapping to swap the icon images (so the theme is not the same for many of the puzzles)
    // The mapping is from the icon to the icon image
    setIconMapping({
      icon1: `icon${randomOrder[0]}Src` as keyof ThemeIcons,
      icon2: `icon${randomOrder[1]}Src` as keyof ThemeIcons,
      icon3: `icon${randomOrder[2]}Src` as keyof ThemeIcons,
      icon4: `icon${randomOrder[3]}Src` as keyof ThemeIcons,
      icon5: `icon${randomOrder[4]}Src` as keyof ThemeIcons,
    });
  }, [result, puzzle]);

  /**
   * Resets the game.
   */
  function ResetGame() {
    if (result !== "in-progress") {
      props.onComplete(result === "correct");
    }

    setResult("in-progress");
    setPuzzle({
      ...Object.values(SequencePuzzleTemplates)[
        Math.round(Math.random() * (Object.values(SequencePuzzleTemplates).length - 1))
      ],
    });
  }

  /**
   * Handler on click of an option.
   * @param isCorrect Whether the option is the correct answer.
   */
  function onAnswerOptionClick(isCorrect: boolean) {
    if (result === "in-progress") {
      setResult(isCorrect ? "correct" : "incorrect");
    }
  }

  /**
   * Renders a tile in the hint or answer option sequence.
   * @param id Unique ID of the tile.
   * @param styling Styling of the tile.
   * @param tileType Type of the tile.
   */
  function renderSequenceTile(
    id: string,
    styling: SequencePuzzleStyling,
    tileType: "hint" | "correct-answer-option" | "incorrect-answer-option"
  ): React.ReactNode {
    if (!puzzle || !iconMapping) {
      return null;
    }

    return (
      <div
        className="sequence-tile"
        key={id}
        onClick={() =>
          result === "in-progress" && tileType !== "hint" && onAnswerOptionClick(tileType === "correct-answer-option")
        }
        data-tile-type={tileType}
        data-is-readonly={result !== "in-progress"}
        data-is-correct-answer={tileType === "correct-answer-option"}
      >
        {styling.icon1 && (
          <div
            className="icon"
            data-icon-number="1"
            style={{ ...styling.icon1, backgroundImage: `url(${props.theme[iconMapping.icon1]})` }}
          ></div>
        )}
        {styling.icon2 && (
          <div
            className="icon"
            data-icon-number="2"
            style={{ ...styling.icon2, backgroundImage: `url(${props.theme[iconMapping.icon2]})` }}
          ></div>
        )}
        {styling.icon3 && (
          <div
            className="icon"
            data-icon-number="3"
            style={{ ...styling.icon3, backgroundImage: `url(${props.theme[iconMapping.icon3]})` }}
          ></div>
        )}
        {styling.icon4 && (
          <div
            className="icon"
            data-icon-number="4"
            style={{ ...styling.icon4, backgroundImage: `url(${props.theme[iconMapping.icon4]})` }}
          ></div>
        )}
        {styling.icon5 && (
          <div
            className="icon"
            data-icon-number="5"
            style={{ ...styling.icon5, backgroundImage: `url(${props.theme[iconMapping.icon5]})` }}
          ></div>
        )}
      </div>
    );
  }

  const Puzzle = () => {
    if (!puzzle) {
      return null;
    }

    switch (puzzle.mode) {
      case "sequence": {
        const answerOptions = puzzle.sequence.incorrectAnswers
          // Render each incorrect answer
          .map((styling, i) => renderSequenceTile(`incorrect-answer-option-${i}`, styling, "incorrect-answer-option"));

        answerOptions.splice(correctAnswerIndex, 0, [
          // Render the correct answer
          renderSequenceTile("correct-answer-option", puzzle.sequence.correctAnswer, "correct-answer-option"),
        ]);

        return (
          <>
            <div className="sequence">
              {puzzle.sequence.hint.map((styling, i) => renderSequenceTile(`sequence-${i}`, styling, "hint"))}
            </div>
            <div className="answer-options">{answerOptions}</div>
          </>
        );
      }
    }
  };

  /**
   * Renders the message to display (e.g. correct/incorrect).
   * @returns Message to display
   */
  const Notification = () => {
    if (!puzzle) {
      return null;
    }

    switch (result) {
      case "in-progress":
        return (
          <MessageNotification type="default">
            {(() => {
              switch (puzzle.mode) {
                case "sequence":
                  return "What comes next in the sequence?";
              }
            })()}
          </MessageNotification>
        );

      case "correct":
        return <MessageNotification type="success">Correct!</MessageNotification>;

      case "incorrect":
        return <MessageNotification type="error">Incorrect</MessageNotification>;
    }
  };

  return (
    <div className="App puzzle-config" style={{ backgroundImage: puzzle && `url(${props.theme.backgroundImageSrc})` }}>
      <Notification />
      {result !== "in-progress" && (
        <Button mode="accept" settings={props.settings} onClick={() => ResetGame()}>
          {props.campaignConfig.isCampaignLevel ? LEVEL_FINISHING_TEXT : "Restart"}
        </Button>
      )}
      <Puzzle />
    </div>
  );
};

export default SequencePuzzle;
