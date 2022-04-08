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
import { areas, Campaign } from "./Campaign";
import { Area, AreaConfig } from "./Area";
import { Level, LevelConfig } from "./Level";
import LetterCategoriesConfig from "./LetterCategories/LetterCategoriesConfig";
import NumbersArithmetic from "./NumbersArithmetic/NumbersArithmetic";

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
  | "numbers/arithmetic"
  | "nubble"
  | "campaign"
  | "campaign/area"
  | "campaign/area/level";

// This is needed for runtime; make sure it matches the Page type
export const pages: { page: Page; title: string }[] = [
  { page: "splash-screen", title: "Wingo" },
  { page: "home", title: "" },
  { page: "wingo/daily", title: "Daily Wingo" },
  { page: "wingo/repeat", title: "Repeat Wingo" },
  { page: "wingo/category", title: "Wingo Categories" },
  { page: "wingo/increasing", title: "Wingo Increasing" },
  { page: "wingo/limitless", title: "Wingo Limitless" },
  { page: "wingo/puzzle", title: "Wingo Puzzle" },
  { page: "wingo/interlinked", title: "Wingo Interlinked" },
  { page: "letters_categories", title: "Letters Categories" },
  { page: "countdown/letters", title: "Countdown Letters" },
  { page: "countdown/numbers", title: "Countdown Numbers" },
  { page: "numbers/arithmetic", title: "Arithmetic" },
  { page: "nubble", title: "Nubble" },
  { page: "campaign", title: "Campaign" },
  { page: "campaign/area", title: "Campaign Areas" },
  { page: "campaign/area/level", title: "Campaign Level" },
];

// Initial (first launch) Campaign Progress
export const defaultAreaStatuses: {
  name: string;
  status: "locked" | "unlockable" | "unlocked";
  current_level: number;
}[] = areas.map((area, index) => ({
  name: area.name,
  status: index === 0 ? "unlockable" : "locked",
  current_level: 0,
}));

export const App: React.FC = () => {
  const saveData = window.localStorage;

  const [loadingState, setLoadingState] = useState<"loading" | "loaded">("loading");
  const [page, setPage] = useState<Page>("splash-screen");
  const [selectedCampaignArea, setSelectedCampaignArea] = useState<AreaConfig | null>(null);
  const [selectedCampaignLevel, setSelectedCampaignLevel] = useState<LevelConfig | null>(null);
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
      page: "numbers/arithmetic",
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

    const pageFromUrl = getPageFromUrl();

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

  function onCompleteLevel(level: LevelConfig) {
    if (selectedCampaignArea) {
      SaveData.setCampaignProgress(selectedCampaignArea, level);
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
    const commonProps = {
      saveData: saveData,
      defaultnumGuesses: numGuesses,
      puzzleRevealMs: puzzleRevealMs,
      puzzleLeaveNumBlanks: puzzleLeaveNumBlanks,
      page: page,
      setPage: setPage,
      addGold: addGold,
    };

    switch (page) {
      case "splash-screen":
        return <SplashScreen loadingState={loadingState} />;

      case "home":
        return (
          <LobbyMenu
            /**
             * Updates game type configurations
             * @param value Checkbox checked (true) or not checked (false)
             * @param Page The page for the game type which options have just changed
             */
            firstLetterToggle={(value, Page) => {
              setgameOptionToggles(
                gameOptionToggles.map((x) => {
                  if (x.page === Page) {
                    x.firstLetter = value;
                  }
                  return x;
                })
              );
            }}
            timerToggle={(value, Page) => {
              setgameOptionToggles(
                gameOptionToggles.map((x) => {
                  if (x.page === Page) {
                    x.timer = value;
                  }
                  return x;
                })
              );
            }}
            keyboardToggle={(value, Page) => {
              setgameOptionToggles(
                gameOptionToggles.map((x) => {
                  if (x.page === Page) {
                    x.keyboard = value;
                  }
                  return x;
                })
              );
            }}
            setPage={setPage}
            addGold={addGold}
            gameOptionToggles={gameOptionToggles}
          />
        );

      case "campaign":
        return (
          <Campaign
            setPage={setPage}
            setSelectedArea={setSelectedCampaignArea}
            setSelectedCampaignLevel={setSelectedCampaignLevel}
          />
        );

      case "campaign/area":
        return (
          selectedCampaignArea && (
            <Area area={selectedCampaignArea} setSelectedCampaignLevel={setSelectedCampaignLevel} setPage={setPage} />
          )
        );

      case "campaign/area/level":
        return (
          selectedCampaignLevel && (
            <Level
              level={selectedCampaignLevel}
              page={page}
              setPage={setPage}
              addGold={addGold}
              onCompleteLevel={onCompleteLevel}
            />
          )
        );

      case "wingo/daily":
        return (
          <WordleConfig
            {...commonProps}
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
            {...commonProps}
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
            {...commonProps}
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
            {...commonProps}
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
            {...commonProps}
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
            {...commonProps}
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
            {...commonProps}
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
            setPage={setPage}
            addGold={addGold}
          />
        );

      case "letters_categories":
        return (
          <LetterCategoriesConfig
            {...commonProps}
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
            setPage={setPage}
            addGold={addGold}
          />
        );

      case "numbers/arithmetic":
        return <NumbersArithmetic revealIntervalSeconds={3} numTiles={4} difficulty={"easy"} timerConfig={
          gameOptionToggles.find((x) => x.page === "numbers/arithmetic")?.timer
            ? { isTimed: true, seconds: 10 }
            : { isTimed: false }
        } setPage={setPage} />;

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
