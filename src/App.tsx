import React, { useState, useEffect } from "react";
import { SplashScreen } from "./SplashScreen";
import { LobbyMenu } from "./LobbyMenu";
import WordleConfig from "./WordleConfig";
import { Button } from "./Button";
import NubbleConfig from "./Nubble/NubbleConfig";
import GoldCoin from "./images/gold.png";
import { SaveData, SettingsData } from "./SaveData";
import CountdownLettersConfig from "./CountdownLetters/CountdownLettersConfig";
import CountdownNumbersConfig from "./CountdownNumbers/CountdownNumbersConfig";
import { Campaign } from "./Campaign/Campaign";
import { Area, AreaConfig } from "./Campaign/Area";
import { getId, Level, LevelConfig } from "./Campaign/Level";
import LetterCategoriesConfig from "./LetterCategories/LetterCategoriesConfig";
import ArithmeticReveal from "./NumbersArithmetic/ArithmeticReveal";
import ArithmeticDrag from "./NumbersArithmetic/ArithmeticDrag";
import { PuzzleConfig } from "./Puzzles/PuzzleConfig";
import { Theme, Themes } from "./Themes";
import { AllCampaignAreas } from "./Campaign/AllCampaignAreas";
import { Settings } from "./Settings";
import GroupWall from "./OnlyConnect/GroupWall";
import { useBackgroundMusic } from "./Sounds";
import { VERSION } from "./version";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./ErrorFallback";
import SameLetterWords from "./VerbalReasoning/SameLetterWords";
import NumberSets from "./VerbalReasoning/NumberSets/NumberSets";
import Algebra from "./VerbalReasoning/Algebra/Algebra";
import { ChallengesInfo } from "./Challenges/ChallengesInfo";
import WordCodes from "./VerbalReasoning/WordCodes";
import { CountdownGameshow } from "./CountdownGameshow";
import { LingoGameshow } from "./LingoGameshow";
import { FaQuestion } from "react-icons/fa";
import HelpInformation from "./HelpInformation";

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
  | "wingo/crossword"
  | "wingo/crossword/fit"
  | "wingo/crossword/weekly"
  | "wingo/crossword/daily"
  | "letters_categories"
  | "countdown/letters"
  | "countdown/numbers"
  | "numbers/arithmetic_reveal"
  | "numbers/arithmetic_drag/order"
  | "numbers/arithmetic_drag/match"
  | "nubble"
  | "only_connect/wall"
  | "verbal_reasoning/match"
  | "verbal_reasoning/number_sets"
  | "verbal_reasoning/algebra"
  | "verbal_reasoning/word_codes/match"
  | "puzzle/sequence"
  | "campaign"
  | "campaign/area"
  | "campaign/area/level"
  | "challenges"
  | "settings"
  | "random"
  | "countdown/gameshow"
  | "lingo/gameshow";

// This is needed for runtime; make sure it matches the Page type
export const pages: { page: Page; title: string; description?: string; shortTitle?: string; isPlayable: boolean }[] = [
  { page: "splash-screen", title: "Wingo", isPlayable: false },
  { page: "home", title: "", isPlayable: false },
  {
    page: "wingo/daily",
    title: "Daily Wingo",
    description: "Guess today's word",
    shortTitle: "Daily",
    isPlayable: false,
  },
  {
    page: "wingo/repeat",
    title: "Standard/Normal Wingo",
    description: "Guess a word",
    shortTitle: "Standard",
    isPlayable: true,
  },
  {
    page: "wingo/category",
    title: "Wingo Categories",
    description: "Guess a word related to a category",
    shortTitle: "Categories",
    isPlayable: true,
  },
  {
    page: "wingo/increasing",
    title: "Wingo Increasing Length",
    description: "Increase the word length to guess with every correct answer",
    shortTitle: "Increasing",
    isPlayable: true,
  },
  {
    page: "wingo/limitless",
    title: "Wingo Limitless/Survival",
    description: "Gain lives with correct, early answers; how long can you survive?",
    shortTitle: "Limitless",
    isPlayable: true,
  },
  {
    page: "wingo/puzzle",
    title: "Wingo Puzzle",
    description: "Use a cryptic clue to guess the word as fast as possible!",
    shortTitle: "Puzzle",
    isPlayable: true,
  },
  {
    page: "wingo/interlinked",
    title: "Wingo Interlinked",
    description: "Guess two words interlinked by a shared letter",
    shortTitle: "Interlinked",
    isPlayable: true,
  },
  {
    page: "wingo/crossword",
    title: "Wingo Crossword",
    description: "Guess a crossword of words",
    shortTitle: "Crossword",
    isPlayable: true,
  },
  {
    page: "wingo/crossword/fit",
    title: "Wingo Crossword Fit",
    description: "Fill the crossword with the provided words",
    shortTitle: "Crossword Fit",
    isPlayable: true,
  },
  {
    page: "wingo/crossword/weekly",
    title: "Wingo Crossword (Weekly)",
    description: "Guess a crossword for this week",
    shortTitle: "Weekly Crossword",
    isPlayable: false,
  },
  {
    page: "wingo/crossword/daily",
    title: "Wingo Crossword (Daily)",
    description: "Guess a crossword for today",
    shortTitle: "Daily Crossword",
    isPlayable: false,
  },
  {
    page: "letters_categories",
    title: "Letters Categories",
    description: "Guess the word for each category",
    shortTitle: "Categories (5)",
    isPlayable: true,
  },
  {
    page: "countdown/letters",
    title: "Countdown Letters",
    description: "Find the highest scoring word from the list of random letters",
    shortTitle: "Countdown",
    isPlayable: true,
  },
  {
    page: "countdown/numbers",
    title: "Countdown Numbers",
    description: "Get the target number using a list of random numbers",
    shortTitle: "Countdown",
    isPlayable: true,
  },
  {
    page: "numbers/arithmetic_reveal",
    title: "Quick Maths",
    description: "Test your arithmetic with quickfire calculations",
    shortTitle: "Quick Maths",
    isPlayable: true,
  },
  {
    page: "numbers/arithmetic_drag/order",
    title: "Arithmetic order",
    description: "Put the arithmetic expressions in order from smallest to largest",
    shortTitle: "Order",
    isPlayable: true,
  },
  {
    page: "numbers/arithmetic_drag/match",
    title: "Arithmetic match",
    description: "Match the arithmetic expressions with the results they evaluate to",
    shortTitle: "Match",
    isPlayable: true,
  },
  {
    page: "nubble",
    title: "Nubble",
    description: "Find the highest scoring number from a list of random numbers",
    shortTitle: "Nubble",
    isPlayable: true,
  },
  {
    page: "only_connect/wall",
    title: "Only Connect",
    description: "Find groups of words from a scrambled word grid",
    shortTitle: "Only Connect",
    isPlayable: true,
  },
  {
    page: "verbal_reasoning/match",
    title: "Same Letter Words",
    description: "Find the words which are made from the same letters",
    shortTitle: "Same Letter Words",
    isPlayable: true,
  },
  {
    page: "verbal_reasoning/number_sets",
    title: "Number Sets",
    description: "Find the answer to a unique number set",
    shortTitle: "Number Sets",
    isPlayable: true,
  },
  {
    page: "verbal_reasoning/algebra",
    title: "Algebra",
    description: "Find the answer to a unique number set",
    shortTitle: "Algebra",
    isPlayable: true,
  },
  {
    page: "verbal_reasoning/word_codes/match",
    title: "Word Codes",
    description: "Decipher codes to find words (and vice versa)",
    shortTitle: "Word Codes",
    isPlayable: true,
  },
  {
    page: "puzzle/sequence",
    title: "Sequence Puzzle",
    description: "Find what comes next in the sequence",
    shortTitle: "Sequence",
    isPlayable: true,
  },
  { page: "campaign", title: "Campaign", shortTitle: "Campaign", isPlayable: false },
  { page: "campaign/area", title: "Campaign Areas", shortTitle: "Areas", isPlayable: false },
  { page: "campaign/area/level", title: "Campaign Level", shortTitle: "Level", isPlayable: false },
  { page: "challenges", title: "Challenges", shortTitle: "Challenges", isPlayable: false },
  { page: "settings", title: "Settings", shortTitle: "Settings", isPlayable: false },
  { page: "random", title: "Random", shortTitle: "Random", isPlayable: false },
  { page: "countdown/gameshow", title: "Countdown Gameshow", shortTitle: "Countdown Gameshow", isPlayable: false },
  { page: "lingo/gameshow", title: "Lingo Gameshow", shortTitle: "Lingo Gameshow", isPlayable: false },
];

export const App: React.FC = () => {
  const saveData = window.localStorage;

  const [loadingState, setLoadingState] = useState<"loading" | "loaded">("loading");
  const [page, setPage] = useState<Page>("splash-screen");

  // Modal explaining current gamemode is shown?
  const [isHelpInfoShown, setIsHelpInfoShown] = useState(false);

  // Is a session of randomly selecting a gamemode after completion, currently in progress?
  const [isRandomSession, setIsRandomSession] = useState(false);

  const [selectedCampaignArea, setSelectedCampaignArea] = useState<AreaConfig | null>(null);
  const [selectedCampaignLevel, setSelectedCampaignLevel] = useState<LevelConfig | null>(null);
  const [settings, setSettings] = useState<SettingsData>(SaveData.getSettings());
  const [theme, setTheme] = useState<Theme>(
    getHighestCampaignArea()?.theme ||
      (settings.graphics.preferredTheme ? Themes[settings.graphics.preferredTheme] : Themes.GenericWingo)
  );
  const [gold, setGold] = useState<number>(SaveData.readGold());
  const [playBackgroundMusic, stopBackgroundMusic] = useBackgroundMusic(settings, theme);

  const [gameOptionToggles, setGameOptionToggles] = useState<
    {
      page: Page;
      firstLetter?: boolean;
      showHint?: boolean;
      timer?: boolean;
      keyboard?: boolean;
    }[]
  >([
    {
      page: "wingo/daily",
      showHint: true,
      timer: false,
      keyboard: true,
    },
    {
      page: "wingo/repeat",
      firstLetter: false,
      showHint: true,
      timer: false,
      keyboard: true,
    },
    {
      page: "wingo/category",
      firstLetter: false,
      showHint: true,
      timer: false,
      keyboard: true,
    },
    {
      page: "wingo/increasing",
      firstLetter: false,
      showHint: true,
      timer: false,
      keyboard: true,
    },
    {
      page: "wingo/limitless",
      firstLetter: false,
      showHint: true,
      timer: false,
      keyboard: true,
    },
    {
      page: "wingo/puzzle",
      firstLetter: false,
      showHint: true,
      timer: false,
      keyboard: true,
    },
    {
      page: "wingo/interlinked",
      firstLetter: false,
      showHint: true,
      timer: false,
      keyboard: true,
    },
    {
      page: "wingo/crossword",
      firstLetter: false,
      showHint: true,
      timer: false,
      keyboard: true,
    },
    {
      page: "wingo/crossword/fit",
      firstLetter: false,
      showHint: true,
      timer: false,
      keyboard: true,
    },
    {
      page: "countdown/letters",
      timer: true,
    },
    {
      page: "letters_categories",
      firstLetter: false,
      timer: true,
      keyboard: true,
    },
    {
      page: "countdown/numbers",
      timer: true,
    },
    {
      page: "numbers/arithmetic_reveal",
      timer: true,
    },
    {
      page: "numbers/arithmetic_drag/order",
      timer: true,
    },
    {
      page: "numbers/arithmetic_drag/match",
      timer: true,
    },
    {
      page: "only_connect/wall",
      timer: true,
    },
    {
      page: "verbal_reasoning/match",
      timer: true,
    },
    {
      page: "verbal_reasoning/number_sets",
      timer: true,
    },
    {
      page: "verbal_reasoning/algebra",
      timer: true,
    },
    {
      page: "verbal_reasoning/word_codes/match",
      timer: true,
    },
  ]);

  useEffect(() => {
    const LOADING_TIMEOUT_MS = 2000;
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
    // Set the page to any playable page
    if (page === "random") {
      const playablePages = pages.filter((page) => page.isPlayable);
      const newPage = playablePages[Math.round(Math.random() * (playablePages.length - 1))]?.page;
      setPage(newPage);
      setIsRandomSession(true);
    }
    // Pressing back (returning to home) should stop any sessions (which dictate the next gamemode)
    else if (page === "home") {
      setIsRandomSession(false);
    }
  }, [page]);

  useEffect(() => {
    SaveData.setGold(gold);
  }, [gold]);

  useEffect(() => {
    SaveData.setSettings(settings);
    setThemeIfNoPreferredSet(getHighestCampaignArea()?.theme || Themes.GenericWingo);
  }, [settings]);

  function setThemeIfNoPreferredSet(theme: Theme) {
    setTheme(settings.graphics.preferredTheme ? Themes[settings.graphics.preferredTheme] : theme);
  }

  /**
   *
   * @returns
   */
  function getPageFromUrl(): Page | undefined {
    const urlPathWithoutLeadingTrailingSlashes = window.location.pathname.replace(/^\//g, "").replace(/\/$/g, "");

    return pages.find((page) => page.page === urlPathWithoutLeadingTrailingSlashes)?.page;
  }

  function onCompleteLevel(isUnlockLevel: boolean, levelConfig: LevelConfig) {
    if (selectedCampaignArea) {
      if (isUnlockLevel) {
        SaveData.addCompletedCampaignAreaUnlockLevel(selectedCampaignArea.name);
      } else {
        const levelId = getId(levelConfig.level);

        SaveData.addCompletedCampaignAreaLevel(selectedCampaignArea.name, levelId);
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

  useEffect(() => {
    if (loadingState === "loaded") {
      playBackgroundMusic();
    }

    return () => stopBackgroundMusic();
  }, [selectedCampaignArea, playBackgroundMusic, stopBackgroundMusic, loadingState]);

  function addGold(additionalGold: number) {
    setGold(gold + additionalGold);
  }

  function getHighestCampaignArea(): AreaConfig {
    const reversedCopy = AllCampaignAreas.slice().reverse();
    const highestCampaignArea = reversedCopy.filter((campaignArea) => {
      const areaInfo = SaveData.getCampaignProgress().areas.find((area) => area.name === campaignArea.name);

      return areaInfo?.status === "unlocked";
    })[0];

    return highestCampaignArea;
  }

  function onComplete(wasCorrect: boolean) {
    if (!isRandomSession) {
      return;
    } else {
      // New random page
      setPage("random");
    }
  }

  const pageComponent = (() => {
    const commonWingoProps = {
      saveData: saveData,
      defaultnumGuesses: numGuesses,
      puzzleRevealMs: puzzleRevealMs,
      puzzleLeaveNumBlanks: puzzleLeaveNumBlanks,
      page: page,
      theme: theme,
      setPage: setPage,
      setTheme: setThemeIfNoPreferredSet,
      addGold: addGold,
      settings: settings,
      onComplete: onComplete,
    };

    switch (page) {
      case "splash-screen":
        return <SplashScreen loadingState={loadingState} settings={settings} />;

      case "home":
        return (
          <LobbyMenu
            setSelectedArea={setSelectedCampaignArea}
            setSelectedCampaignLevel={setSelectedCampaignLevel}
            setTheme={setThemeIfNoPreferredSet}
            theme={theme}
            /**
             * Updates game type configurations
             * @param value Checkbox checked (true) or not checked (false)
             * @param Page The page for the game type which options have just changed
             */
            firstLetterToggle={(value, page) =>
              setGameOptionToggles(
                gameOptionToggles.map((gameOption) => ({
                  ...gameOption,
                  firstLetter: gameOption.page === page ? value : gameOption.firstLetter,
                }))
              )
            }
            showHintToggle={(value, page) =>
              setGameOptionToggles(
                gameOptionToggles.map((gameOption) => ({
                  ...gameOption,
                  showHint: gameOption.page === page ? value : gameOption.showHint,
                }))
              )
            }
            timerToggle={(value, page) =>
              setGameOptionToggles(
                gameOptionToggles.map((gameOption) => ({
                  ...gameOption,
                  timer: gameOption.page === page ? value : gameOption.timer,
                }))
              )
            }
            keyboardToggle={(value, page) =>
              setGameOptionToggles(
                gameOptionToggles.map((gameOption) => ({
                  ...gameOption,
                  keyboard: gameOption.page === page ? value : gameOption.keyboard,
                }))
              )
            }
            setPage={setPage}
            addGold={addGold}
            gameOptionToggles={gameOptionToggles}
            settings={settings}
          />
        );

      case "campaign":
        return (
          <Campaign
            theme={theme}
            setTheme={setThemeIfNoPreferredSet}
            setPage={setPage}
            setSelectedArea={setSelectedCampaignArea}
            setSelectedCampaignLevel={setSelectedCampaignLevel}
            settings={settings}
          />
        );

      case "campaign/area":
        return (
          selectedCampaignArea && (
            <Area
              area={selectedCampaignArea}
              setTheme={setThemeIfNoPreferredSet}
              setSelectedCampaignLevel={setSelectedCampaignLevel}
              setPage={setPage}
              settings={settings}
            />
          )
        );

      case "campaign/area/level":
        return (
          selectedCampaignLevel && (
            <Level
              area={selectedCampaignArea!}
              level={selectedCampaignLevel}
              page={page}
              theme={theme}
              setPage={setPage}
              setTheme={setThemeIfNoPreferredSet}
              addGold={addGold}
              onCompleteLevel={onCompleteLevel}
              settings={settings}
            />
          )
        );

      case "wingo/daily":
        return (
          <WordleConfig
            {...commonWingoProps}
            mode="daily"
            firstLetterProvided={gameOptionToggles.find((x) => x.page === "wingo/daily")?.firstLetter || false}
            showHint={gameOptionToggles.find((x) => x.page === "wingo/daily")?.showHint || true}
            timerConfig={
              gameOptionToggles.find((x) => x.page === "wingo/daily")?.timer
                ? { isTimed: true, seconds: 30 }
                : { isTimed: false }
            }
            keyboard={gameOptionToggles.find((x) => x.page === "wingo/daily")?.keyboard || true}
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
            showHint={gameOptionToggles.find((x) => x.page === "wingo/repeat")?.showHint || true}
            timerConfig={
              gameOptionToggles.find((x) => x.page === "wingo/repeat")?.timer
                ? { isTimed: true, seconds: 30 } // TODO: Confgiure timer value
                : { isTimed: false }
            }
            keyboard={gameOptionToggles.find((x) => x.page === "wingo/repeat")?.keyboard || true}
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
            showHint={gameOptionToggles.find((x) => x.page === "wingo/category")?.showHint || true}
            timerConfig={
              gameOptionToggles.find((x) => x.page === "wingo/category")?.timer
                ? { isTimed: true, seconds: 30 }
                : { isTimed: false }
            }
            keyboard={gameOptionToggles.find((x) => x.page === "wingo/category")?.keyboard || true}
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
            showHint={gameOptionToggles.find((x) => x.page === "wingo/increasing")?.showHint || true}
            timerConfig={
              gameOptionToggles.find((x) => x.page === "wingo/increasing")?.timer
                ? { isTimed: true, seconds: 30 }
                : { isTimed: false }
            }
            keyboard={gameOptionToggles.find((x) => x.page === "wingo/increasing")?.keyboard || true}
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
            showHint={gameOptionToggles.find((x) => x.page === "wingo/limitless")?.showHint || true}
            timerConfig={
              gameOptionToggles.find((x) => x.page === "wingo/limitless")?.timer
                ? { isTimed: true, seconds: 30 }
                : { isTimed: false }
            }
            keyboard={gameOptionToggles.find((x) => x.page === "wingo/limitless")?.keyboard || true}
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
            showHint={gameOptionToggles.find((x) => x.page === "wingo/puzzle")?.showHint || true}
            timerConfig={
              gameOptionToggles.find((x) => x.page === "wingo/puzzle")?.timer
                ? { isTimed: true, seconds: 30 }
                : { isTimed: false }
            }
            keyboard={gameOptionToggles.find((x) => x.page === "wingo/puzzle")?.keyboard || true}
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
            showHint={gameOptionToggles.find((x) => x.page === "wingo/interlinked")?.showHint || true}
            timerConfig={
              gameOptionToggles.find((x) => x.page === "wingo/interlinked")?.timer
                ? { isTimed: true, seconds: 30 }
                : { isTimed: false }
            }
            keyboard={gameOptionToggles.find((x) => x.page === "wingo/interlinked")?.keyboard || true}
            defaultWordLength={wordLength}
            enforceFullLengthGuesses={true}
          />
        );

      case "wingo/crossword":
        return (
          <WordleConfig
            {...commonWingoProps}
            mode="crossword"
            firstLetterProvided={gameOptionToggles.find((x) => x.page === "wingo/crossword")?.firstLetter || false}
            showHint={gameOptionToggles.find((x) => x.page === "wingo/crossword")?.showHint || true}
            timerConfig={
              gameOptionToggles.find((x) => x.page === "wingo/crossword")?.timer
                ? { isTimed: true, seconds: 30 }
                : { isTimed: false }
            }
            keyboard={gameOptionToggles.find((x) => x.page === "wingo/crossword")?.keyboard || true}
            defaultWordLength={wordLength}
            enforceFullLengthGuesses={true}
          />
        );

      case "wingo/crossword/fit":
        return (
          <WordleConfig
            {...commonWingoProps}
            mode="crossword/fit"
            firstLetterProvided={gameOptionToggles.find((x) => x.page === "wingo/crossword/fit")?.firstLetter || false}
            showHint={gameOptionToggles.find((x) => x.page === "wingo/crossword/fit")?.showHint || true}
            timerConfig={
              gameOptionToggles.find((x) => x.page === "wingo/crossword/fit")?.timer
                ? { isTimed: true, seconds: 30 }
                : { isTimed: false }
            }
            keyboard={gameOptionToggles.find((x) => x.page === "wingo/crossword/fit")?.keyboard || true}
            defaultWordLength={wordLength}
            enforceFullLengthGuesses={true}
          />
        );

      case "wingo/crossword/weekly":
        return (
          <WordleConfig
            {...commonWingoProps}
            mode="crossword/weekly"
            firstLetterProvided={gameOptionToggles.find((x) => x.page === "wingo/crossword")?.firstLetter || false}
            showHint={gameOptionToggles.find((x) => x.page === "wingo/crossword")?.showHint || true}
            timerConfig={
              gameOptionToggles.find((x) => x.page === "wingo/crossword")?.timer
                ? { isTimed: true, seconds: 30 }
                : { isTimed: false }
            }
            keyboard={gameOptionToggles.find((x) => x.page === "wingo/crossword")?.keyboard || true}
            defaultWordLength={wordLength}
            enforceFullLengthGuesses={true}
          />
        );

      case "wingo/crossword/daily":
        return (
          <WordleConfig
            {...commonWingoProps}
            mode="crossword/daily"
            firstLetterProvided={gameOptionToggles.find((x) => x.page === "wingo/crossword")?.firstLetter || false}
            showHint={gameOptionToggles.find((x) => x.page === "wingo/crossword")?.showHint || true}
            timerConfig={
              gameOptionToggles.find((x) => x.page === "wingo/crossword")?.timer
                ? { isTimed: true, seconds: 30 }
                : { isTimed: false }
            }
            keyboard={gameOptionToggles.find((x) => x.page === "wingo/crossword")?.keyboard || true}
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
            keyboard={gameOptionToggles.find((x) => x.page === "countdown/letters")?.keyboard || true}
            defaultWordLength={wordLength_countdown_letters}
            page={page}
            theme={Themes.GenericLetterCountdown}
            settings={settings}
            setTheme={setThemeIfNoPreferredSet}
            setPage={setPage}
            addGold={addGold}
            onComplete={commonWingoProps.onComplete}
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
            theme={theme}
            keyboard={gameOptionToggles.find((x) => x.page === "letters_categories")?.keyboard || true}
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
            theme={Themes.GenericNumberCountdown}
            settings={settings}
            setTheme={setThemeIfNoPreferredSet}
            setPage={setPage}
            addGold={addGold}
            onComplete={commonWingoProps.onComplete}
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
            theme={theme}
            settings={settings}
            setPage={setPage}
            onComplete={commonWingoProps.onComplete}
          />
        );

      case "numbers/arithmetic_drag/order":
        return (
          <ArithmeticDrag
            mode="order"
            numGuesses={3}
            numTiles={6}
            numOperands={3}
            difficulty={"easy"}
            timerConfig={
              gameOptionToggles.find((x) => x.page === "numbers/arithmetic_drag/order")?.timer
                ? { isTimed: true, seconds: 60 }
                : { isTimed: false }
            }
            theme={theme}
            settings={settings}
            setPage={setPage}
            onComplete={commonWingoProps.onComplete}
          />
        );

      case "numbers/arithmetic_drag/match":
        return (
          <ArithmeticDrag
            mode="match"
            numGuesses={3}
            numTiles={6}
            numOperands={3}
            difficulty={"easy"}
            timerConfig={
              gameOptionToggles.find((x) => x.page === "numbers/arithmetic_drag/match")?.timer
                ? { isTimed: true, seconds: 60 }
                : { isTimed: false }
            }
            theme={theme}
            settings={settings}
            setPage={setPage}
            onComplete={commonWingoProps.onComplete}
          />
        );

      case "nubble":
        return (
          <NubbleConfig
            theme={theme}
            numDice={4}
            diceMin={1}
            diceMax={6}
            gridSize={100}
            gridShape={"hexagon"}
            numTeams={2}
            timeLengthMins={5}
            gameOverOnIncorrectPick={false}
            settings={settings}
          />
        );

      case "only_connect/wall":
        return (
          <GroupWall
            groupSize={4}
            numGroups={4}
            numGuesses={3}
            timerConfig={
              gameOptionToggles.find((x) => x.page === "only_connect/wall")?.timer
                ? { isTimed: true, seconds: 100 }
                : { isTimed: false }
            }
            theme={theme}
            settings={settings}
            setPage={setPage}
            onComplete={commonWingoProps.onComplete}
          />
        );

      case "verbal_reasoning/match":
        return (
          <SameLetterWords
            numMatchingWords={4}
            numTotalWords={16}
            wordLength={5}
            numGuesses={20}
            timerConfig={
              gameOptionToggles.find((x) => x.page === "verbal_reasoning/match")?.timer
                ? { isTimed: true, seconds: 100 }
                : { isTimed: false }
            }
            theme={theme}
            settings={settings}
            setPage={setPage}
            onComplete={commonWingoProps.onComplete}
          />
        );

      case "verbal_reasoning/number_sets":
        return (
          <NumberSets
            timerConfig={
              gameOptionToggles.find((x) => x.page === "verbal_reasoning/number_sets")?.timer
                ? { isTimed: true, seconds: 100 }
                : { isTimed: false }
            }
            theme={theme}
            settings={settings}
            setPage={setPage}
            onComplete={commonWingoProps.onComplete}
          />
        );

      case "verbal_reasoning/algebra":
        return (
          <Algebra
            timerConfig={
              gameOptionToggles.find((x) => x.page === "verbal_reasoning/algebra")?.timer
                ? { isTimed: true, seconds: 100 }
                : { isTimed: false }
            }
            theme={theme}
            settings={settings}
            setPage={setPage}
            onComplete={commonWingoProps.onComplete}
          />
        );

      case "verbal_reasoning/word_codes/match":
        return (
          <WordCodes
            modeConfig={{ isMatch: false, numCodes: 3, numWordToCodeQuestions: 2, numCodeToWordQuestions: 1 }}
            numWords={4}
            wordLength={5}
            numAdditionalLetters={2}
            numGuesses={3}
            timerConfig={
              gameOptionToggles.find((x) => x.page === "verbal_reasoning/word_codes/match")?.timer
                ? { isTimed: true, seconds: 100 }
                : { isTimed: false }
            }
            theme={theme}
            settings={settings}
            setPage={setPage}
            onComplete={commonWingoProps.onComplete}
          />
        );

      case "puzzle/sequence":
        return (
          <PuzzleConfig
            theme={theme}
            setTheme={setThemeIfNoPreferredSet}
            settings={settings}
            onComplete={commonWingoProps.onComplete}
          />
        );

      case "challenges":
        return <ChallengesInfo settings={settings} addGold={addGold} />;

      case "settings":
        return <Settings settings={settings} onSettingsChange={setSettings} />;

      case "random":
        return null;

      case "countdown/gameshow":
        return (
          <CountdownGameshow
            settings={settings}
            setPage={setPage}
            page={page}
            themes={[Themes.GenericLetterCountdown, Themes.GenericNumberCountdown]}
            setTheme={setThemeIfNoPreferredSet}
            addGold={addGold}
          />
        );

      case "lingo/gameshow":
        return <LingoGameshow commonWingoProps={commonWingoProps} />;
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
                  settings={settings}
                  onClick={() => {
                    setIsHelpInfoShown(false);

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
            {Boolean(page !== "home" && page !== "settings") && (
              <Button
                mode="default"
                className="game_options"
                settings={settings}
                onClick={() => setIsHelpInfoShown(true)}
              >
                <FaQuestion />
              </Button>
            )}
            <Button
              mode="default"
              className="settings-button"
              settings={settings}
              onClick={() => {
                setPage("settings");
                setIsHelpInfoShown(false);
              }}
            >
              Settings
            </Button>
            <div className="gold_counter" onClick={() => setPage("challenges")}>
              <img className="gold_coin_image" src={GoldCoin} alt="Gold" />
              {gold.toLocaleString("en-GB")}
            </div>
          </div>
        </>
      )}
      <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
        {pageComponent}
      </ErrorBoundary>
      {Boolean(isHelpInfoShown && page !== "home" && page !== "settings") && (
        <HelpInformation page={page} onClose={() => setIsHelpInfoShown(false)}></HelpInformation>
      )}
      <div className="version">{VERSION}</div>
    </div>
  );
};
