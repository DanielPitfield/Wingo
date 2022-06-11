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
import { FiArrowLeft, FiHelpCircle, FiSettings } from "react-icons/fi";
import HelpInformation from "./HelpInformation";
import { TitlePage } from "./TitlePage";

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
  | "title-page"
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
  | "countdown/conundrum"
  | "numbers/arithmetic_reveal"
  | "numbers/arithmetic_drag/order"
  | "numbers/arithmetic_drag/match"
  | "nubble"
  | "only_connect/wall"
  | "verbal_reasoning/sameLetters"
  | "verbal_reasoning/number_sets"
  | "verbal_reasoning/algebra"
  | "verbal_reasoning/word_codes"
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
export const pages: {
  page: Page;
  title: string;
  description?: string;
  shortTitle?: string;
  isPlayable: boolean;
  helpInfo?: JSX.Element;
}[] = [
  { page: "splash-screen", title: "Wingo", isPlayable: false },
  { page: "title-page", title: "", isPlayable: false },
  { page: "home", title: "", isPlayable: false },
  {
    page: "wingo/daily",
    title: "Daily Wingo",
    description: "Guess today's word",
    shortTitle: "Daily",
    isPlayable: false,
    helpInfo: (
      <>
        <p>Only one attempt (a set of up to 6 guesses) allowed</p>
        <p>The target word changes every day (the countdown timer shows when a new word is available)</p>
        <p>Your attempt will be saved and can be viewed at any time</p>
      </>
    ),
  },
  {
    page: "wingo/repeat",
    title: "Standard/Normal Wingo",
    description: "Guess a word",
    shortTitle: "Standard",
    isPlayable: true,
    helpInfo: (
      <>
        <p>Press the 'Restart' button after an attempt for a new target word</p>
      </>
    ),
  },
  {
    page: "wingo/category",
    title: "Wingo Categories",
    description: "Guess a word related to a category",
    shortTitle: "Categories",
    isPlayable: true,
    helpInfo: (
      <>
        <p>The target word is a word from the currently selected category</p>
        <p>
          The guesses you make must also be words from this category (but they do not have to be the length of the
          target word)
        </p>
        <p>The category can be changed from the dropdown list (this will delete any guesses made)</p>
      </>
    ),
  },
  {
    page: "wingo/increasing",
    title: "Wingo Increasing Length",
    description: "Increase the word length to guess with every correct answer",
    shortTitle: "Increasing",
    isPlayable: true,
    helpInfo: (
      <>
        <p>The target word will increase in length (one letter longer) after each successful guess</p>
      </>
    ),
  },
  {
    page: "wingo/limitless",
    title: "Wingo Limitless/Survival",
    description: "Gain lives with correct, early answers; how long can you survive?",
    shortTitle: "Limitless",
    isPlayable: true,
    helpInfo: (
      <>
        <p>Gain extra guesses (up to a maximum of 5) by guessing a word with guesses to spare</p>
        <p>A guess will be lost each time the target word is not guessed</p>
        <p>The target word will increase in length (one letter longer) after each successful guess</p>
      </>
    ),
  },
  {
    page: "wingo/puzzle",
    title: "Wingo Puzzle",
    description: "Use a cryptic clue to guess the word as fast as possible!",
    shortTitle: "Puzzle",
    isPlayable: true,
    helpInfo: (
      <>
        <p>Guess the target word from the hint provided</p>
        <p>A random letter of the target word will become revealed every few seconds</p>
        <p>Press 'Enter' once you know the answer and make your guess (this will stop the letters revealing!)</p>
      </>
    ),
  },
  {
    page: "wingo/interlinked",
    title: "Wingo Interlinked",
    description: "Guess two words interlinked by a shared letter",
    shortTitle: "Interlinked",
    isPlayable: true,
    helpInfo: (
      <>
        <p>Guess the two target words, using the shared letter as a hint</p>
        <p>Click on the word to highlight it, and make a guess</p>
        <p>Click 'Check Crossword' once you have guessed both words to see if your guesses are correct</p>
        <p>Do all this without running out of guesses!</p>
      </>
    ),
  },
  {
    page: "wingo/crossword",
    title: "Wingo Crossword",
    description: "Guess a crossword of words",
    shortTitle: "Crossword",
    isPlayable: true,
    helpInfo: (
      <>
        <p>Guess the many target words, using the shared letters as hints</p>
        <p>Click on the word to highlight it, and make a guess</p>
        <p>Click 'Check Current Word' once you have guessed one word to see which letters are correct</p>
        <p>Click 'Check Crossword' once you have guessed all words to see if your guesses are correct</p>
        <p>Do all this without running out of guesses!</p>
      </>
    ),
  },
  {
    page: "wingo/crossword/fit",
    title: "Wingo Crossword Fit",
    description: "Fill the crossword with the provided words",
    shortTitle: "Crossword Fit",
    isPlayable: true,
    helpInfo: (
      <>
        <p>Fill each word with one of the provided words, using the revealed letters as hints</p>
        <p>Click on the word to highlight it, and make a guess</p>
        <p>Click 'Check Crossword' once you have guessed all words to see if your guesses are correct</p>
        <p>Do all this without running out of guesses!</p>
      </>
    ),
  },
  {
    page: "wingo/crossword/weekly",
    title: "Wingo Crossword (Weekly)",
    description: "Guess a crossword for this week",
    shortTitle: "Weekly Crossword",
    isPlayable: false,
    helpInfo: (
      <>
        <p>Complete a crossword specifically for this week</p>
        <p>Guess the many target words, using the shared letters as hints</p>
        <p>Click on the word to highlight it, and make a guess</p>
        <p>Click 'Check Current Word' once you have guessed one word to see which letters are correct</p>
        <p>Click 'Check Crossword' once you have guessed all words to see if your guesses are correct</p>
        <p>Do all this without running out of guesses!</p>
      </>
    ),
  },
  {
    page: "wingo/crossword/daily",
    title: "Wingo Crossword (Daily)",
    description: "Guess a crossword for today",
    shortTitle: "Daily Crossword",
    isPlayable: false,
    helpInfo: (
      <>
        <p>Complete a crossword specifically for today only!</p>
        <p>Guess the many target words, using the shared letters as hints</p>
        <p>Click on the word to highlight it, and make a guess</p>
        <p>Click 'Check Current Word' once you have guessed one word to see which letters are correct</p>
        <p>Click 'Check Crossword' once you have guessed all words to see if your guesses are correct</p>
        <p>Do all this without running out of guesses!</p>
      </>
    ),
  },
  {
    page: "letters_categories",
    title: "Letters Categories",
    description: "Guess the word for each category",
    shortTitle: "Categories (5)",
    isPlayable: true,
    helpInfo: (
      <>
        <p>Select a category</p>
        <p>Guess the word from the hint for the category within the number of guesses</p>
        <p>Press the 'Restart' button after an attempt or change the Category for a new target word</p>
      </>
    ),
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
    page: "countdown/conundrum",
    title: "Countdown Conundrum",
    description: "Find the single word which uses all the letters",
    shortTitle: "Conundrum",
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
    title: "Arithmetic (Order)",
    description: "Put the arithmetic expressions in order from smallest to largest",
    shortTitle: "Arithmetic (Order)",
    isPlayable: true,
  },
  {
    page: "numbers/arithmetic_drag/match",
    title: "Arithmetic (Match)",
    description: "Match the arithmetic expressions with the results they evaluate to",
    shortTitle: "Arithmetic (Match)",
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
    page: "verbal_reasoning/sameLetters",
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
    page: "verbal_reasoning/word_codes",
    title: "Word Codes",
    description: "Decipher codes to find words (and vice versa)",
    shortTitle: "Word Codes",
    isPlayable: true,
  },
  {
    page: "verbal_reasoning/word_codes/match",
    title: "Word Codes (Match)",
    description: "Match the words to their codes",
    shortTitle: "Word Codes (Match)",
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
  // App wide listener for right click event
  document.addEventListener("contextmenu", handleRightClick);

  /* 
  To re-enable it for a component, use:
  document.removeEventListener('contextmenu', handleRightClick);
  */

  // Prevent default right click context menu from appearing
  function handleRightClick(event: MouseEvent) {
    event.preventDefault();
  }

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

  // The configurable options available for each gamemode variation of Wordle/WordleConfig
  const gamemodeSettings: {
    page: Page;
    settings: {
      wordLength?: number;
      firstLetterProvided?: boolean;
      showHint?: boolean;
      timer?: { isTimed: true; seconds: number } | { isTimed: false };
    };
  }[] = [
    {
      page: "wingo/repeat",
      settings: {
        wordLength: wordLength,
        firstLetterProvided: false,
        showHint: false,
        timer: { isTimed: false },
      },
    },
    {
      page: "wingo/category",
      settings: {
        firstLetterProvided: false,
        showHint: false,
        timer: { isTimed: false },
      },
    },
    {
      page: "wingo/increasing",
      settings: {
        firstLetterProvided: false,
        showHint: false,
        timer: { isTimed: false },
      },
    },
    {
      page: "wingo/limitless",
      settings: {
        firstLetterProvided: false,
        showHint: false,
        timer: { isTimed: false },
      },
    },
    {
      page: "wingo/puzzle",
      settings: {
        wordLength: wordLength_puzzle,
      },
    },
    {
      page: "wingo/interlinked",
      settings: {
        wordLength: wordLength,
        firstLetterProvided: false,
        showHint: false,
        timer: { isTimed: false },
      },
    },
    {
      page: "wingo/crossword",
      settings: {
        wordLength: wordLength,
        firstLetterProvided: false,
        showHint: true,
        timer: { isTimed: false },
      },
    },
    {
      page: "wingo/crossword/fit",
      settings: {
        wordLength: wordLength,
        firstLetterProvided: false,
        showHint: true,
        timer: { isTimed: true, seconds: 30 },
      },
    },
    // Although named as if it isn't, the conundrum mode is actually a mode of WordleConfig
    {
      page: "countdown/conundrum",
      settings: {
        timer: { isTimed: true, seconds: 30 },
      },
    },

    // TODO: Disable changing the settings for campaign levels!

    /*
    {
      page: "puzzle/sequence",
      settings: {
        timer: { isTimed: true, seconds: 10 },
      },
    },
    // TODO: QOL: Nubble guess timer (baked into component)
    {
      page: "nubble",
      settings: {
        timer: { isTimed: false },
      },
    },
    */
  ];

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

    // Set title page after load
    window.setTimeout(() => setPage(pageFromUrl || "title-page"), LOADING_TIMEOUT_MS + FADE_OUT_DURATION_MS);
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
      gamemodeSettings: gamemodeSettings.find((x) => x.page === page)?.settings,
      defaultWordLength: wordLength,
      saveData: saveData,
      defaultnumGuesses: numGuesses,
      enforceFullLengthGuesses: true,
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

      case "title-page":
        return <TitlePage setPage={setPage} settings={settings} />;

      case "home":
        return (
          <LobbyMenu
            setSelectedArea={setSelectedCampaignArea}
            setSelectedCampaignLevel={setSelectedCampaignLevel}
            setTheme={setThemeIfNoPreferredSet}
            theme={theme}
            setPage={setPage}
            addGold={addGold}
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
        return <WordleConfig {...commonWingoProps} mode="daily" />;

      case "wingo/repeat":
        return <WordleConfig {...commonWingoProps} mode="repeat" />;

      case "wingo/category":
        return <WordleConfig {...commonWingoProps} mode="category" enforceFullLengthGuesses={false} />;

      case "wingo/increasing":
        return <WordleConfig {...commonWingoProps} mode="increasing" defaultWordLength={wordLength_increasing} />;

      case "wingo/limitless":
        return <WordleConfig {...commonWingoProps} mode="limitless" defaultWordLength={wordLength_limitless} />;

      case "wingo/puzzle":
        return (
          <WordleConfig
            {...commonWingoProps}
            mode="puzzle"
            defaultWordLength={wordLength_puzzle}
            defaultnumGuesses={numGuesses_puzzle}
          />
        );

      case "wingo/interlinked":
        return <WordleConfig {...commonWingoProps} mode="interlinked" />;

      case "wingo/crossword":
        return <WordleConfig {...commonWingoProps} mode="crossword" />;

      case "wingo/crossword/fit":
        return <WordleConfig {...commonWingoProps} mode="crossword/fit" />;

      case "wingo/crossword/weekly":
        return <WordleConfig {...commonWingoProps} mode="crossword/weekly" />;

      case "wingo/crossword/daily":
        return <WordleConfig {...commonWingoProps} mode="crossword/daily" />;

      case "letters_categories":
        return (
          <LetterCategoriesConfig
            {...commonWingoProps}
            numCategories={5}
            theme={theme}
            enforceFullLengthGuesses={false}
          />
        );

      case "countdown/letters":
        return (
          <CountdownLettersConfig
            mode={"countdown_letters_casual"}
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

      case "countdown/numbers":
        return (
          <CountdownNumbersConfig
            mode={"countdown_numbers_casual"}
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

      case "countdown/conundrum":
        return (
          <WordleConfig
            {...commonWingoProps}
            mode="conundrum"
            defaultWordLength={wordLength_countdown_letters}
            defaultnumGuesses={numGuesses_puzzle}
          />
        );

      case "numbers/arithmetic_reveal":
        return (
          <ArithmeticReveal
            isCampaignLevel={false}
            revealIntervalSeconds={3}
            numTiles={4}
            numCheckpoints={3}
            difficulty={"easy"}
            theme={theme}
            settings={settings}
            setPage={setPage}
            onComplete={commonWingoProps.onComplete}
          />
        );

      case "numbers/arithmetic_drag/order":
        return (
          <ArithmeticDrag
            isCampaignLevel={false}
            mode="order"
            numGuesses={3}
            numTiles={6}
            numOperands={3}
            difficulty={"easy"}
            theme={theme}
            settings={settings}
            setPage={setPage}
            onComplete={commonWingoProps.onComplete}
          />
        );

      case "numbers/arithmetic_drag/match":
        return (
          <ArithmeticDrag
            isCampaignLevel={false}
            mode="match"
            numGuesses={3}
            numTiles={6}
            numOperands={3}
            difficulty={"easy"}
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
            isCampaignLevel={false}
            groupSize={4}
            numGroups={4}
            numGuesses={3}
            theme={theme}
            settings={settings}
            setPage={setPage}
            onComplete={commonWingoProps.onComplete}
          />
        );

      case "verbal_reasoning/sameLetters":
        return (
          <SameLetterWords
            isCampaignLevel={false}
            numMatchingWords={4}
            numTotalWords={16}
            wordLength={5}
            numGuesses={20}
            theme={theme}
            settings={settings}
            setPage={setPage}
            onComplete={commonWingoProps.onComplete}
          />
        );

      case "verbal_reasoning/number_sets":
        return (
          <NumberSets
            isCampaignLevel={false}
            theme={theme}
            settings={settings}
            setPage={setPage}
            onComplete={commonWingoProps.onComplete}
          />
        );

      case "verbal_reasoning/algebra":
        return (
          <Algebra
            isCampaignLevel={false}
            theme={theme}
            settings={settings}
            setPage={setPage}
            onComplete={commonWingoProps.onComplete}
          />
        );

      case "verbal_reasoning/word_codes":
        return (
          <WordCodes
            isCampaignLevel={false}
            modeConfig={{ isMatch: false, numCodes: 3, numWordToCodeQuestions: 2, numCodeToWordQuestions: 1 }}
            numWords={4}
            wordLength={5}
            numAdditionalLetters={2}
            numGuesses={3}
            theme={theme}
            settings={settings}
            setPage={setPage}
            onComplete={commonWingoProps.onComplete}
          />
        );

      case "verbal_reasoning/word_codes/match":
        return (
          <WordCodes
            isCampaignLevel={false}
            modeConfig={{ isMatch: true }}
            numWords={4}
            wordLength={5}
            numAdditionalLetters={2}
            numGuesses={3}
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
            numSets={5}
            numLetterRoundsPerSet={2}
            numNumberRoundsPerSet={1}
            numConundrumRoundsPerSet={0}
            hasFinishingConundrum={true}
            commonWingoProps={commonWingoProps}
          />
        );

      case "lingo/gameshow":
        return (
          <LingoGameshow
            firstRoundConfig={{ numLingos: 4, numPuzzles: 1 }}
            secondRoundConfig={{ numLingos: 3, numPuzzles: 1 }}
            thirdRoundConfig={{ numFourLengthLingos: 2, numPuzzles: 1, numFiveLengthLingos: 2, numberPuzzles: 1 }}
            hasFinalRound={true}
            commonWingoProps={commonWingoProps}
          />
        );
    }
  })();

  return (
    <div className="app" data-automation-id="app" data-automation-page-name={page}>
      {page !== "splash-screen" && page !== "title-page" && (
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
                    }
                  }}
                >
                  <FiArrowLeft /> Back
                </Button>
              </nav>
            )}
            <h1 className="title">{pages.find((x) => x.page === page)?.title}</h1>
            {Boolean(pages.find((x) => x.page === page)?.helpInfo) && (
              <Button
                mode="default"
                className="help-info-button"
                settings={settings}
                onClick={() => setIsHelpInfoShown(true)}
                additionalProps={{ "aria-label": "help", title: "Get help with this game mode" }}
              >
                <FiHelpCircle /> Help
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
              <FiSettings /> Settings
            </Button>
            <div className="gold_counter" onClick={() => setPage("challenges")}>
              <img className="gold_coin_image" src={GoldCoin} alt="Gold" />
              {gold.toLocaleString("en-GB")}
            </div>
          </div>
        </>
      )}
      <ErrorBoundary
        fallbackRender={({ error, resetErrorBoundary }) => (
          <ErrorFallback
            error={error}
            resetErrorBoundary={resetErrorBoundary}
            settingsData={SaveData.getSettings()}
            version={VERSION}
          ></ErrorFallback>
        )}
        onReset={() => window.location.reload()}
      >
        {pageComponent}
      </ErrorBoundary>
      {Boolean(isHelpInfoShown && page !== "home" && page !== "title-page" && page !== "settings") && (
        <HelpInformation page={page} onClose={() => setIsHelpInfoShown(false)}></HelpInformation>
      )}
      <div className="version">{VERSION}</div>
    </div>
  );
};
