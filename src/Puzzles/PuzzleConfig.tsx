import { CSSProperties, useEffect, useState } from "react";
import { Button } from "../Button";
import { MessageNotification } from "../MessageNotification";
import { Puzzles } from "./Puzzles";

/* General theme for the whole puzzle */
type SequencePuzzleTheme = {
  backgroundImageSrc: string;
} & SequencePuzzleThemeIcons;

/* Theme for the individual icons */
type SequencePuzzleThemeIcons = {
  icon1Src: string;
  icon2Src: string;
  icon3Src: string;
  icon4Src: string;
  icon5Src: string;
};

/** Config for a specific puzzle (exported for config from campaign) */
export type PuzzleConfigProps = {
  type: "sequence";
  theme: SequencePuzzleTheme;
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
interface Props {
  defaultPuzzle?: PuzzleConfigProps;
  finishingButtonText?: string;
}

export const PuzzleConfig: React.FC<Props> = (props) => {
  // Result of the guess
  const [result, setResult] = useState<"in-progress" | "correct" | "incorrect">("in-progress");

  // Current puzzle
  const [puzzle, setPuzzle] = useState<PuzzleConfigProps | undefined>(props.defaultPuzzle);

  // Index at which to display the correct answer, among the incorrect answers
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);

  // Hold a mapping to swap the icon images (so the theme is not the same for many of the puzzles)
  // The mapping is from the icon to the icon image
  const [iconMapping, setIconMapping] = useState<{
    icon1: keyof SequencePuzzleThemeIcons;
    icon2: keyof SequencePuzzleThemeIcons;
    icon3: keyof SequencePuzzleThemeIcons;
    icon4: keyof SequencePuzzleThemeIcons;
    icon5: keyof SequencePuzzleThemeIcons;
  }>();

  // Picks a random puzzle if one was not passed in through the props
  useEffect(() => {
    if (props.defaultPuzzle) {
      setPuzzle(props.defaultPuzzle);
    } else {
      setPuzzle({ ...Puzzles[Math.round(Math.random() * (Puzzles.length - 1))] });
    }
  }, [props.defaultPuzzle]);

  // Configures the icon mapping and answer option sort order on load
  useEffect(() => {
    if (result !== "in-progress") {
      return;
    }

    if (!puzzle) {
      return;
    }

    // Set the correct answer option index to be randomly among the incorrect answers
    setCorrectAnswerIndex(Math.round(Math.random() * puzzle.sequence.incorrectAnswers.length));

    // Get a random array order of 1-5
    const randomOrder = [1, 2, 3, 4, 5].sort((_) => (Math.random() > 0.5 ? 1 : -1));

    // Hold a mapping to swap the icon images (so the theme is not the same for many of the puzzles)
    // The mapping is from the icon to the icon image
    setIconMapping({
      icon1: `icon${randomOrder[0]}Src` as keyof SequencePuzzleThemeIcons,
      icon2: `icon${randomOrder[1]}Src` as keyof SequencePuzzleThemeIcons,
      icon3: `icon${randomOrder[2]}Src` as keyof SequencePuzzleThemeIcons,
      icon4: `icon${randomOrder[3]}Src` as keyof SequencePuzzleThemeIcons,
      icon5: `icon${randomOrder[4]}Src` as keyof SequencePuzzleThemeIcons,
    });
  }, [result, puzzle]);

  /**
   * Resets the game.
   */
  function resetGame() {
    setResult("in-progress");
    setPuzzle({ ...Puzzles[Math.round(Math.random() * (Puzzles.length - 1))] });
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
            style={{ ...styling.icon1, backgroundImage: `url(${puzzle.theme[iconMapping.icon1]})` }}
          ></div>
        )}
        {styling.icon2 && (
          <div
            className="icon"
            data-icon-number="2"
            style={{ ...styling.icon2, backgroundImage: `url(${puzzle.theme[iconMapping.icon2]})` }}
          ></div>
        )}
        {styling.icon3 && (
          <div
            className="icon"
            data-icon-number="3"
            style={{ ...styling.icon3, backgroundImage: `url(${puzzle.theme[iconMapping.icon3]})` }}
          ></div>
        )}
        {styling.icon4 && (
          <div
            className="icon"
            data-icon-number="4"
            style={{ ...styling.icon4, backgroundImage: `url(${puzzle.theme[iconMapping.icon4]})` }}
          ></div>
        )}
        {styling.icon5 && (
          <div
            className="icon"
            data-icon-number="5"
            style={{ ...styling.icon5, backgroundImage: `url(${puzzle.theme[iconMapping.icon5]})` }}
          ></div>
        )}
      </div>
    );
  }

  /**
   * Renders the entire puzzle.
   * @returns Puzzle.
   */
  function renderPuzzle(): React.ReactNode {
    if (!puzzle) {
      return null;
    }

    switch (puzzle.type) {
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
  }

  /**
   * Renders the message to display (e.g. correct/incorrect).
   * @returns Message to display
   */
  function renderNotification(): React.ReactNode {
    if (!puzzle) {
      return null;
    }

    switch (result) {
      case "in-progress":
        return (
          <MessageNotification type="default">
            {(() => {
              switch (puzzle.type) {
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
  }

  return (
    <div className="App puzzle-config" style={{ backgroundImage: puzzle && `url(${puzzle.theme.backgroundImageSrc})` }}>
      {renderNotification()}
      {result !== "in-progress" && (
        <Button mode="accept" onClick={() => resetGame()}>
          {props.finishingButtonText || "Restart"}
        </Button>
      )}
      {renderPuzzle()}
    </div>
  );
};
