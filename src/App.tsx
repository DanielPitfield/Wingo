import React, { useState, useEffect } from "react";
import { SplashScreen } from "./SplashScreen";
import { LobbyMenu } from "./LobbyMenu";
import WordleConfig from "./WordleConfig";
import { Button } from "./Button";
import NubbleConfig from "./Nubble/NubbleConfig";
import GoldCoin from "./images/gold.png";
import { SaveData } from "./SaveData";
import CountdownLettersConfig from "./CountdownLetters/CountdownLettersConfig";
import CountdownNumbersConfig from "./CountdownNumbers/CountdownNumbersConfig";
import { Campaign } from "./Campaign/Campaign";
import { Area, AreaConfig } from "./Campaign/Area";
import { Level, LevelConfig } from "./Campaign/Level";
import LetterCategoriesConfig from "./LetterCategories/LetterCategoriesConfig";
import ArithmeticReveal from "./NumbersArithmetic/ArithmeticReveal";
import ArithmeticDrag from "./NumbersArithmetic/ArithmeticDrag";
import { PuzzleConfig } from "./Puzzles/PuzzleConfig";
import { Theme, Themes } from "./Themes";

const wordLength = 5;
const numGuesses = 6;

const wordLength_increasing = 4;
const wordLength_limitless = 4;
const wordLength_puzzle = 10;
const wordLength_countdown_letters = 9;

const numGuesses_puzzle = 1;
const puzzleRevealMs = 2000;
const puzzleLeaveNumBlanks = 3;

const countdown_numbers_NumOperands = 6;
const countdown_numbers_ExpressionLength = 5;
const countdown_numbers_NumGuesses = 5;

export type Page =
  | "splash-screen"
  | "home"
  | "wingo/daily"
  | "wingo/repeat"
  | "wingo/category"
  | "wingo/increasing"
  | "wingo/limitless"
  | "wingo/puzzle"
  | "wingo/interlinked"
  | "letters_categories"
  | "countdown/letters"
  | "countdown/numbers"
  | "numbers/arithmetic_reveal"
  | "numbers/arithmetic_drag"
  | "nubble"
  | "puzzle/sequence"
  | "campaign"
  | "campaign/area"
  | "campaign/area/level";

// This is needed for runtime; make sure it matches the Page type
export const pages: { page: Page; title: string; description?: string; shortTitle?: string }[] = [
  { page: "splash-screen", title: "Wingo" },
  { page: "home", title: "" },
  { page: "wingo/daily", title: "Daily Wingo", description: "Guess today's word", shortTitle: "Daily" },
  { page: "wingo/repeat", title: "Standard/Normal Wingo", description: "Guess a word", shortTitle: "Standard" },
  {
    page: "wingo/category",
    title: "Wingo Categories",
    description: "Guess a word related to a category",
    shortTitle: "Categories",
  },
  {
    page: "wingo/increasing",
    title: "Wingo Increasing Length",
    description: "Increase the word length to guess with every correct answer",
    shortTitle: "Increasing",
  },
  {
    page: "wingo/limitless",
    title: "Wingo Limitless/Survival",
    description: "Gain lives with correct, early answers; how long can you survive?",
    shortTitle: "Limitless",
  },
  {
    page: "wingo/puzzle",
    title: "Wingo Puzzle",
    description: "Use a cryptic clue to guess the word as fast as possible!",
    shortTitle: "Puzzle",
  },
  {
    page: "wingo/interlinked",
    title: "Wingo Interlinked",
    description: "Guess two or more words, interlinked by at least 1 letter",
    shortTitle: "Interlinked",
  },
  {
    page: "letters_categories",
    title: "Letters Categories",
    description: "Guess the word for each category",
    shortTitle: "Categories (5)",
  },
  {
    page: "countdown/letters",
    title: "Countdown Letters",
    description: "Find the highest scoring word from the list of random letters",
    shortTitle: "Countdown",
  },
  {
    page: "countdown/numbers",
    title: "Countdown Numbers",
    description: "Get the target number using a list of random numbers",
    shortTitle: "Countdown",
  },
  {
    page: "numbers/arithmetic_reveal",
    title: "Quick Maths",
    description: "Test your arithmetic with quickfire calculations",
    shortTitle: "Quick Maths",
  },
  {
    page: "numbers/arithmetic_drag",
    title: "Arithmetic order",
    description: "Put the arithmetic expressions in the correct order",
    shortTitle: "Order",
  },
  {
    page: "nubble",
    title: "Nubble",
    description: "Find the highest scoring number from a list of random numbers",
    shortTitle: "Nubble",
  },
  {
    page: "puzzle/sequence",
    title: "Sequence Puzzle",
    description: "Find what comes next in the sequence",
    shortTitle: "Sequence",
  },
  { page: "campaign", title: "Campaign", shortTitle: "Campaign" },
  { page: "campaign/area", title: "Campaign Areas", shortTitle: "Areas" },
  { page: "campaign/area/level", title: "Campaign Level", shortTitle: "Level" },
];

export const App: React.FC = () => {
  const saveData = window.localStorage;

  const [loadingState, setLoadingState] = useState<"loading" | "loaded">("loading");
  const [page, setPage] = useState<Page>("splash-screen");
  const [selectedCampaignArea, setSelectedCampaignArea] = useState<AreaConfig | null>(null);
  const [selectedCampaignLevel, setSelectedCampaignLevel] = useState<LevelConfig | null>(null);
  const [theme, setTheme] = useState<Theme>(Themes.GenericWingo);
  const [gold, setGold] = useState<number>(SaveData.readGold());

  const [gameOptionToggles, setgameOptionToggles] = useState<
    {
      page: Page;
      firstLetter: boolean;
      timer: boolean;
      keyboard: boolean;
    }[]
  >([
    {
      page: "wingo/daily",
      firstLetter: false,
      timer: false,
      keyboard: true,
    },
    {
      page: "wingo/repeat",
      firstLetter: false,
      timer: false,
      keyboard: true,
    },
    {
      page: "wingo/category",
      firstLetter: false,
      timer: false,
      keyboard: true,
    },
    {
      page: "wingo/increasing",
      firstLetter: false,
      timer: false,
      keyboard: true,
    },
    {
      page: "wingo/limitless",
      firstLetter: false,
      timer: false,
      keyboard: true,
    },
    {
      page: "wingo/puzzle",
      firstLetter: false,
      timer: false,
      keyboard: true,
    },
    {
      page: "wingo/interlinked",
      firstLetter: false,
      timer: false,
      keyboard: true,
    },
    {
      page: "countdown/letters",
      firstLetter: false,
      timer: true,
      keyboard: true,
    },
    {
      page: "letters_categories",
      firstLetter: false,
      timer: true,
      keyboard: true,
    },
    {
      page: "countdown/numbers",
      firstLetter: false,
      timer: true,
      keyboard: false,
    },
    {
      page: "numbers/arithmetic_reveal",
      firstLetter: false,
      timer: true,
      keyboard: false,
    },
    {
      page: "numbers/arithmetic_drag",
      firstLetter: false,
      timer: true,
      keyboard: false,
    },
  ]);

  useEffect(() => {
    const LOADING_TIMEOUT_MS = 1500;
    const FADE_OUT_DURATION_MS = 500;

    // TODO: Mask actual loading, rather than hard-coding seconds
    window.setTimeout(() => setLoadingState("loaded"), LOADING_TIMEOUT_MS);

    let pageFromUrl = getPageFromUrl();

    // Redirect to the campaign page if loaded from a level/area
    if (pageFromUrl === "campaign/area/level" || pageFromUrl === "campaign/area") {
      pageFromUrl = "campaign";
    }

    // Set home page after load
    window.setTimeout(() => setPage(pageFromUrl || "home"), LOADING_TIMEOUT_MS + FADE_OUT_DURATION_MS);
  }, [saveData]);

  useEffect(() => {
    SaveData.setGold(gold);
  }, [gold]);

  /**
   *
   * @returns
   */
  function getPageFromUrl(): Page | undefined {
    const urlPathWithoutLeadingTrailingSlashes = window.location.pathname.replace(/^\//g, "").replace(/\/$/g, "");

    return pages.find((page) => page.page === urlPathWithoutLeadingTrailingSlashes)?.page;
  }

  function onCompleteLevel(isUnlockLevel: boolean, level: LevelConfig) {
    if (selectedCampaignArea) {
      if (isUnlockLevel) {
        SaveData.addCompletedCampaignAreaUnloackLevel(selectedCampaignArea.name);
      } else {
        SaveData.addCompletedCampaignAreaLevel(selectedCampaignArea.name);
      }
    }
  }

  useEffect(() => {
    const DEFAULT_PAGE_TITLE = "Wingo";

    // If the page has changed (and its not the splash screen)
    if (getPageFromUrl() !== page && page !== "splash-screen") {
      // Update the URL in the browser to the new page
      window.history.pushState({}, "", `/${page}`);

      // Update the window title in the browser
      document.title = pages.find((x) => x.page === page)?.title || DEFAULT_PAGE_TITLE;
    }
  }, [page]);

  useEffect(() => {
    // On clicking 'Back' in the browser, update the page from the URL
    window.onpopstate = () => setPage(getPageFromUrl() || "home");
  }, []);

  function addGold(additionalGold: number) {
    setGold(gold + additionalGold);
  }

  const pageComponent = (() => {
    const commonWingoProps = {
      saveData: saveData,
      defaultnumGuesses: numGuesses,
      puzzleRevealMs: puzzleRevealMs,
      puzzleLeaveNumBlanks: puzzleLeaveNumBlanks,
      page: page,
      theme: Themes.GenericWingo,
      setPage: setPage,
      setTheme: setTheme,
      addGold: addGold,
    };

    switch (page) {
      case "splash-screen":
        return <SplashScreen loadingState={loadingState} />;

      case "home":
        return (
          <LobbyMenu
            setSelectedArea={setSelectedCampaignArea}
            setSelectedCampaignLevel={setSelectedCampaignLevel}
            setTheme={setTheme}
            theme={theme}
            /**
             * Updates game type configurations
             * @param value Checkbox checked (true) or not checked (false)
             * @param Page The page for the game type which options have just changed
             */
            firstLetterToggle={(value, page) =>
              setgameOptionToggles(
                gameOptionToggles.map((gameOption) => ({
                  ...gameOption,
                  firstLetter: gameOption.page === page ? value : gameOption.firstLetter,
                }))
              )
            }
            timerToggle={(value, page) =>
              setgameOptionToggles(
                gameOptionToggles.map((gameOption) => ({
                  ...gameOption,
                  timer: gameOption.page === page ? value : gameOption.timer,
                }))
              )
            }
            keyboardToggle={(value, page) =>
              setgameOptionToggles(
                gameOptionToggles.map((gameOption) => ({
                  ...gameOption,
                  keyboard: gameOption.page === page ? value : gameOption.keyboard,
                }))
              )
            }
            setPage={setPage}
            addGold={addGold}
            gameOptionToggles={gameOptionToggles}
          />
        );

      case "campaign":
        return (
          <Campaign
            theme={theme}
            setTheme={setTheme}
            setPage={setPage}
            setSelectedArea={setSelectedCampaignArea}
            setSelectedCampaignLevel={setSelectedCampaignLevel}
          />
        );

      case "campaign/area":
        return (
          selectedCampaignArea && (
            <Area
              area={selectedCampaignArea}
              setTheme={setTheme}
              setSelectedCampaignLevel={setSelectedCampaignLevel}
              setPage={setPage}
            />
          )
        );

      case "campaign/area/level":
        return (
          selectedCampaignLevel && (
            <Level
              level={selectedCampaignLevel}
              page={page}
              theme={theme}
              setPage={setPage}
              setTheme={setTheme}
              addGold={addGold}
              onCompleteLevel={onCompleteLevel}
            />
          )
        );

      case "wingo/daily":
        return (
          <WordleConfig
            {...commonWingoProps}
            mode="daily"
            firstLetterProvided={gameOptionToggles.find((x) => x.page === "wingo/daily")?.firstLetter || false}
            timerConfig={
              gameOptionToggles.find((x) => x.page === "wingo/daily")?.timer
                ? { isTimed: true, seconds: 30 }
                : { isTimed: false }
            }
            keyboard={gameOptionToggles.find((x) => x.page === "wingo/daily")?.keyboard || false}
            defaultWordLength={wordLength}
            enforceFullLengthGuesses={true}
          />
        );

      case "wingo/repeat":
        return (
          <WordleConfig
            {...commonWingoProps}
            mode="repeat"
            firstLetterProvided={gameOptionToggles.find((x) => x.page === "wingo/repeat")?.firstLetter || false}
            timerConfig={
              gameOptionToggles.find((x) => x.page === "wingo/repeat")?.timer
                ? { isTimed: true, seconds: 30 } // TODO: Confgiure timer value
                : { isTimed: false }
            }
            keyboard={gameOptionToggles.find((x) => x.page === "wingo/repeat")?.keyboard || false}
            defaultWordLength={wordLength}
            enforceFullLengthGuesses={false}
          />
        );

      case "wingo/category":
        return (
          <WordleConfig
            {...commonWingoProps}
            mode="category"
            firstLetterProvided={gameOptionToggles.find((x) => x.page === "wingo/category")?.firstLetter || false}
            timerConfig={
              gameOptionToggles.find((x) => x.page === "wingo/category")?.timer
                ? { isTimed: true, seconds: 30 }
                : { isTimed: false }
            }
            keyboard={gameOptionToggles.find((x) => x.page === "wingo/category")?.keyboard || false}
            defaultWordLength={wordLength}
            enforceFullLengthGuesses={false}
          />
        );

      case "wingo/increasing":
        return (
          <WordleConfig
            {...commonWingoProps}
            mode="increasing"
            firstLetterProvided={gameOptionToggles.find((x) => x.page === "wingo/increasing")?.firstLetter || false}
            timerConfig={
              gameOptionToggles.find((x) => x.page === "wingo/increasing")?.timer
                ? { isTimed: true, seconds: 30 }
                : { isTimed: false }
            }
            keyboard={gameOptionToggles.find((x) => x.page === "wingo/increasing")?.keyboard || false}
            defaultWordLength={wordLength_increasing}
            enforceFullLengthGuesses={true}
          />
        );

      case "wingo/limitless":
        return (
          <WordleConfig
            {...commonWingoProps}
            mode="limitless"
            firstLetterProvided={gameOptionToggles.find((x) => x.page === "wingo/limitless")?.firstLetter || false}
            timerConfig={
              gameOptionToggles.find((x) => x.page === "wingo/limitless")?.timer
                ? { isTimed: true, seconds: 30 }
                : { isTimed: false }
            }
            keyboard={gameOptionToggles.find((x) => x.page === "wingo/limitless")?.keyboard || false}
            defaultWordLength={wordLength_limitless}
            enforceFullLengthGuesses={true}
          />
        );

      case "wingo/puzzle":
        return (
          <WordleConfig
            {...commonWingoProps}
            mode="puzzle"
            firstLetterProvided={gameOptionToggles.find((x) => x.page === "wingo/puzzle")?.firstLetter || false}
            timerConfig={
              gameOptionToggles.find((x) => x.page === "wingo/puzzle")?.timer
                ? { isTimed: true, seconds: 30 }
                : { isTimed: false }
            }
            keyboard={gameOptionToggles.find((x) => x.page === "wingo/puzzle")?.keyboard || false}
            defaultWordLength={wordLength_puzzle}
            defaultnumGuesses={numGuesses_puzzle}
            enforceFullLengthGuesses={true}
          />
        );

      case "wingo/interlinked":
        return (
          <WordleConfig
            {...commonWingoProps}
            mode="interlinked"
            firstLetterProvided={gameOptionToggles.find((x) => x.page === "wingo/interlinked")?.firstLetter || false}
            timerConfig={
              gameOptionToggles.find((x) => x.page === "wingo/interlinked")?.timer
                ? { isTimed: true, seconds: 30 }
                : { isTimed: false }
            }
            keyboard={gameOptionToggles.find((x) => x.page === "wingo/interlinked")?.keyboard || false}
            defaultWordLength={wordLength}
            enforceFullLengthGuesses={true}
          />
        );

      case "countdown/letters":
        return (
          <CountdownLettersConfig
            mode={"countdown_letters_casual"}
            timerConfig={
              gameOptionToggles.find((x) => x.page === "countdown/letters")?.timer
                ? { isTimed: true, seconds: 30 }
                : { isTimed: false }
            }
            keyboard={gameOptionToggles.find((x) => x.page === "countdown/letters")?.keyboard || false}
            defaultWordLength={wordLength_countdown_letters}
            page={page}
            theme={Themes.GenericCountdown}
            setTheme={setTheme}
            setPage={setPage}
            addGold={addGold}
          />
        );

      case "letters_categories":
        return (
          <LetterCategoriesConfig
            {...commonWingoProps}
            timerConfig={
              gameOptionToggles.find((x) => x.page === "letters_categories")?.timer
                ? { isTimed: true, seconds: 30 }
                : { isTimed: false }
            }
            keyboard={gameOptionToggles.find((x) => x.page === "letters_categories")?.keyboard || false}
            defaultWordLength={10}
            enforceFullLengthGuesses={false}
          />
        );

      case "countdown/numbers":
        return (
          <CountdownNumbersConfig
            mode={"countdown_numbers_casual"}
            timerConfig={
              gameOptionToggles.find((x) => x.page === "countdown/numbers")?.timer
                ? { isTimed: true, seconds: 30 }
                : { isTimed: false }
            }
            defaultNumOperands={countdown_numbers_NumOperands}
            defaultExpressionLength={countdown_numbers_ExpressionLength}
            defaultNumGuesses={countdown_numbers_NumGuesses}
            page={page}
            theme={Themes.GenericCountdown}
            setTheme={setTheme}
            setPage={setPage}
            addGold={addGold}
          />
        );

      case "numbers/arithmetic_reveal":
        return (
          <ArithmeticReveal
            revealIntervalSeconds={3}
            numTiles={4}
            numCheckpoints={3}
            difficulty={"easy"}
            timerConfig={
              gameOptionToggles.find((x) => x.page === "numbers/arithmetic_reveal")?.timer
                ? { isTimed: true, seconds: 10 }
                : { isTimed: false }
            }
            setPage={setPage}
          />
        );

      case "numbers/arithmetic_drag":
        return (
          <ArithmeticDrag
            mode="order"
            numGuesses={3}
            numTiles={6}
            numOperands={3}
            difficulty={"easy"}
            timerConfig={
              gameOptionToggles.find((x) => x.page === "numbers/arithmetic_drag")?.timer
                ? { isTimed: true, seconds: 100 }
                : { isTimed: false }
            }
            setPage={setPage}
          />
        );

      case "nubble":
        return (
          <NubbleConfig
            numDice={4}
            diceMin={1}
            diceMax={6}
            gridSize={100}
            gridShape={"hexagon"}
            numTeams={2}
            timeLengthMins={5}
          ></NubbleConfig>
        );

      case "puzzle/sequence":
        return <PuzzleConfig theme={Themes.GenericWingo} setTheme={setTheme} />;
    }
  })();

  return (
    <div className="app" data-automation-id="app" data-automation-page-name={page}>
      {page !== "splash-screen" && (
        <>
          <div className="toolbar">
            {page !== "home" && (
              <nav className="navigation">
                <Button
                  mode="default"
                  className="back-button"
                  onClick={() => {
                    if (page === "campaign/area/level") {
                      setPage("campaign/area");
                    } else if (page === "campaign/area") {
                      setPage("campaign");
                    } else {
                      setPage("home");
                      //window.history.back();
                    }
                  }}
                >
                  Back
                </Button>
              </nav>
            )}
            <h1 className="title">{pages.find((x) => x.page === page)?.title}</h1>
            <div className="gold_counter">
              <img className="gold_coin_image" src={GoldCoin} alt="Gold" />
              {gold.toLocaleString("en-GB")}
            </div>
          </div>
        </>
      )}
      {pageComponent}
    </div>
  );
};
