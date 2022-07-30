import React, { useState, useEffect } from "react";
import { SplashScreen } from "./Pages/SplashScreen";
import { LobbyMenu } from "./Pages/LobbyMenu";
import WingoConfig, { pickRandomElementFrom } from "./Pages/WingoConfig";
import { Button } from "./Components/Button";
import NumbleConfig from "./Pages/NumbleConfig";
import GoldCoin from "./Data/Images/gold.png";
import { SaveData, SettingsData } from "./Data/SaveData";
import LettersGameConfig from "./Pages/LettersGameConfig";
import NumbersGameConfig from "./Pages/NumbersGameConfig";
import { Campaign } from "./Pages/Campaign";
import { Area, AreaConfig } from "./Pages/Area";
import { getId, Level, LevelConfig } from "./Components/Level";
import LetterCategoriesConfig from "./Pages/LetterCategoriesConfig";
import ArithmeticReveal from "./Pages/ArithmeticReveal";
import ArithmeticDrag from "./Pages/ArithmeticDrag";
import { PuzzleConfig } from "./Pages/PuzzleConfig";
import { Theme, Themes } from "./Data/Themes";
import { AllCampaignAreas } from "./Data/CampaignAreas/AllCampaignAreas";
import { Settings } from "./Pages/Settings";
import OnlyConnect from "./Pages/OnlyConnect";
import { useBackgroundMusic } from "./Data/Sounds";
import { VERSION } from "./Data/Version";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./Pages/ErrorFallback";
import SameLetterWords from "./Pages/SameLetterWords";
import NumberSets from "./Pages/NumberSets";
import Algebra from "./Pages/Algebra";
import { ChallengesInfo } from "./Components/ChallengesInfo";
import WordCodes from "./Pages/WordCodes";
import { LettersNumbersGameshow } from "./Pages/LettersNumbersGameshow";
import { WingoGameshow } from "./Pages/WingoGameshow";
import { FiArrowLeft, FiHelpCircle, FiSettings } from "react-icons/fi";
import HelpInformation from "./Components/HelpInformation";
import { TitlePage } from "./Pages/TitlePage";
import {
  defaultAlgebraGamemodeSettings,
  defaultArithmeticDragGamemodeSettings,
  defaultArithmeticRevealGamemodeSettings,
  defaultLettersGameGamemodeSettings,
  defaultNumbersGameGamemodeSettings,
  defaultGroupWallGamemodeSettings,
  defaultLetterCategoriesGamemodeSettings,
  defaultNumbleGamemodeSettings,
  defaultNumberSetsGamemodeSettings,
  defaultSameLetterWordsGamemodeSettings,
  defaultWordCodesGamemodeSettings,
  defaultWingoGamemodeSettings,
  DEFAULT_NUM_GUESSES,
  DEFAULT_NUM_GUESSES_NUMBERS_GAME,
  DEFAULT_NUM_GUESSES_PUZZLE,
  DEFAULT_WORD_LENGTH,
  DEFAULT_WORD_LENGTH_CONUNDRUM,
  DEFAULT_WORD_LENGTH_INCREASING,
  DEFAULT_WORD_LENGTH_PUZZLE,
} from "./Data/DefaultGamemodeSettings";
import { PageName } from "./PageNames";
import { pageDescriptions } from "./PageDescriptions";

export const App: React.FC = () => {
  // App wide listener for right click event
  // TODO: Decide whether right click should be enabled
  //document.addEventListener("contextmenu", handleRightClick);

  /* 
  To re-enable it for a component, use:
  document.removeEventListener('contextmenu', handleRightClick);
  */

  // Prevent default right click context menu from appearing
  function handleRightClick(event: MouseEvent) {
    event.preventDefault();
  }

  const saveData = window.localStorage;
  const [settings, setSettings] = useState<SettingsData>(SaveData.getSettings());

  const [loadingState, setLoadingState] = useState<"loading" | "loaded">("loading");

  const [page, setPage] = useState<PageName>(getNewEntryPage());

  // Modal explaining current gamemode is shown?
  const [isHelpInfoShown, setIsHelpInfoShown] = useState(false);

  // Is a session of randomly selecting a gamemode after completion, currently in progress?
  const [isRandomSession, setIsRandomSession] = useState(false);

  const [selectedCampaignArea, setSelectedCampaignArea] = useState<AreaConfig | null>(null);
  const [selectedCampaignLevel, setSelectedCampaignLevel] = useState<LevelConfig | null>(null);

  const [theme, setTheme] = useState<Theme>(
    getHighestCampaignArea()?.theme ||
      (settings.graphics.preferredTheme ? Themes[settings.graphics.preferredTheme] : Themes.GenericWingo)
  );
  const [gold, setGold] = useState<number>(SaveData.readGold());
  const [playBackgroundMusic, stopBackgroundMusic] = useBackgroundMusic(settings, theme);

  function getNewEntryPage(): PageName {
    let pageFromUrl = getPageFromUrl();

    // Redirect to the campaign page if loaded from a level/area
    if (pageFromUrl === "campaign/area/level" || pageFromUrl === "campaign/area") {
      pageFromUrl = "campaign";
    }

    // Find the page that has the title of the option chosen in the settings menu (dropdown)
    const entryPageSelection = pageDescriptions.find((page) => page.title === settings.gameplay.entryPage)?.page;
    // The new entry page (in order of precedence, from left to right)
    return (pageFromUrl || entryPageSelection) ?? "TitlePage";
  }

  useEffect(() => {
    const LOADING_TIMEOUT_MS = 2000;
    const FADE_OUT_DURATION_MS = 500;

    // TODO: Mask actual loading, rather than hard-coding seconds
    window.setTimeout(() => setLoadingState("loaded"), LOADING_TIMEOUT_MS);

    const newEntryPage = getNewEntryPage();

    if (settings.gameplay.skipSplashscreen) {
      // Change immediately
      setPage(newEntryPage);
    } else {
      // Delay setting of new page (until after splashscreen)
      // TOOD: Renable splashscreen?
      // window.setTimeout(() => setPage(newEntryPage), LOADING_TIMEOUT_MS + FADE_OUT_DURATION_MS);
    }
  }, [saveData]);

  useEffect(() => {
    // Set the page to any playable page
    if (page === "random") {
      const playablePages = pageDescriptions.filter((page) => page.isPlayable);
      const newPage = pickRandomElementFrom(playablePages)?.page;
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
  function getPageFromUrl(): PageName | undefined {
    const urlPathWithoutLeadingTrailingSlashes = window.location.pathname.replace(/^\//g, "").replace(/\/$/g, "");

    return pageDescriptions.find((page) => page.page === urlPathWithoutLeadingTrailingSlashes)?.page;
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
      document.title = pageDescriptions.find((x) => x.page === page)?.title || DEFAULT_PAGE_TITLE;
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
    // Get the gamemode settings for the specific page (gamemode)
    const pageGamemodeSettings = (() => {
      switch (page) {
        // Daily mode should always use the same settings (never from SaveData)
        case "wingo/daily":
          return defaultWingoGamemodeSettings.find((x) => x.page === page)?.settings;

        // WingoConfig modes
        case "wingo/repeat":
        case "wingo/puzzle":
        case "wingo/increasing":
        case "wingo/limitless":
        case "wingo/category":
        case "Conundrum":
          // Use the saved Wingo Config gamemodeSettings, or the default setitngs (if no previous save was found)
          return (
            SaveData.getWingoConfigGamemodeSettings(page) ||
            defaultWingoGamemodeSettings.find((x) => x.page === page)?.settings
          );

        case "LettersCategories":
          return SaveData.getLetterCategoriesConfigGamemodeSettings() || defaultLetterCategoriesGamemodeSettings;

        case "LettersGame":
          return SaveData.getLettersGameConfigGamemodeSettings() || defaultLettersGameGamemodeSettings;

        case "NumbersGame":
          return SaveData.getNumbersGameConfigGamemodeSettings() || defaultNumbersGameGamemodeSettings;

        case "ArithmeticReveal":
          return SaveData.getArithmeticRevealGamemodeSettings() || defaultArithmeticRevealGamemodeSettings;

        case "ArithmeticDrag/Order":
          return (
            SaveData.getArithmeticDragGamemodeSettings("order") ||
            defaultArithmeticDragGamemodeSettings.find((x) => x.mode === "order")?.settings
          );

        case "ArithmeticDrag/Match":
          return (
            SaveData.getArithmeticDragGamemodeSettings("match") ||
            defaultArithmeticDragGamemodeSettings.find((x) => x.mode === "match")?.settings
          );

        case "OnlyConnect":
          return SaveData.getGroupWallGamemodeSettings() || defaultGroupWallGamemodeSettings;

        case "SameLetters":
          return SaveData.getSameLetterWordsGamemodeSettings() || defaultSameLetterWordsGamemodeSettings;

        case "NumberSets":
          return SaveData.getNumberSetsGamemodeSettings() || defaultNumberSetsGamemodeSettings;

        case "Algebra":
          return SaveData.getAlgebraGamemodeSettings() || defaultAlgebraGamemodeSettings;

        case "WordCodes/Question":
          return (
            SaveData.getWordCodesGamemodeSettings("question") ||
            defaultWordCodesGamemodeSettings.find((x) => x.mode === "question")?.settings
          );

        case "WordCodes/Match":
          return (
            SaveData.getWordCodesGamemodeSettings("match") ||
            defaultWordCodesGamemodeSettings.find((x) => x.mode === "match")?.settings
          );

        case "numble":
          return SaveData.getNumbleConfigGamemodeSettings() || defaultNumbleGamemodeSettings;
      }

      // TODO: Default gamemode settings (remaining unimplemented modes)
      /*
        | "PuzzleSequence"
        | "LettersNumbersGameshow"
        | "Wingo/Gameshow";
      */
    })();

    const commonProps = {
      isCampaignLevel: false,
      gamemodeSettings: pageGamemodeSettings,
      page: page,
      theme: theme,
      setPage: setPage,
      setTheme: setThemeIfNoPreferredSet,
      addGold: addGold,
      settings: settings,
      onComplete: onComplete,
    };

    // Overwrite properties for specific modes where required
    const commonWingoProps = {
      gamemodeSettings: pageGamemodeSettings,
      defaultWordLength: DEFAULT_WORD_LENGTH,
      defaultnumGuesses: DEFAULT_NUM_GUESSES,
      enforceFullLengthGuesses: true,
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

      case "TitlePage":
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
        return <WingoConfig {...commonWingoProps} mode="daily" />;

      case "wingo/repeat":
        return <WingoConfig {...commonWingoProps} mode="repeat" />;

      case "wingo/category":
        return <WingoConfig {...commonWingoProps} mode="category" enforceFullLengthGuesses={false} />;

      case "wingo/increasing":
        return (
          <WingoConfig {...commonWingoProps} mode="increasing" defaultWordLength={DEFAULT_WORD_LENGTH_INCREASING} />
        );

      case "wingo/limitless":
        return (
          <WingoConfig {...commonWingoProps} mode="limitless" defaultWordLength={DEFAULT_WORD_LENGTH_INCREASING} />
        );

      case "wingo/puzzle":
        return (
          <WingoConfig
            {...commonWingoProps}
            mode="puzzle"
            defaultWordLength={DEFAULT_WORD_LENGTH_PUZZLE}
            defaultnumGuesses={DEFAULT_NUM_GUESSES_PUZZLE}
          />
        );

      case "wingo/interlinked":
        // TODO: Directly return WingoInterlinked component?
        return <WingoConfig {...commonWingoProps} mode="interlinked" />;

      case "wingo/crossword":
        return <WingoConfig {...commonWingoProps} mode="crossword" />;

      case "wingo/crossword/fit":
        return <WingoConfig {...commonWingoProps} mode="crossword/fit" />;

      case "wingo/crossword/weekly":
        return <WingoConfig {...commonWingoProps} mode="crossword/weekly" />;

      case "wingo/crossword/daily":
        return <WingoConfig {...commonWingoProps} mode="crossword/daily" />;

      case "LettersCategories":
        return <LetterCategoriesConfig {...commonProps} enforceFullLengthGuesses={false} />;

      case "LettersGame":
        return <LettersGameConfig {...commonProps} theme={Themes.GenericLettersGame} />;

      case "NumbersGame":
        return (
          <NumbersGameConfig
            {...commonProps}
            defaultNumGuesses={DEFAULT_NUM_GUESSES_NUMBERS_GAME}
            theme={Themes.GenericNumbersGame}
          />
        );

      case "Conundrum":
        return (
          <WingoConfig
            {...commonWingoProps}
            mode="conundrum"
            defaultWordLength={DEFAULT_WORD_LENGTH_CONUNDRUM}
            defaultnumGuesses={DEFAULT_NUM_GUESSES_PUZZLE}
          />
        );

      case "ArithmeticReveal":
        return <ArithmeticReveal {...commonProps} />;

      case "ArithmeticDrag/Order":
        return <ArithmeticDrag {...commonProps} mode="order" />;

      case "ArithmeticDrag/Match":
        return <ArithmeticDrag {...commonProps} mode="match" />;

      case "numble":
        return <NumbleConfig campaignConfig={{ isCampaignLevel: false }} {...commonProps} />;

      case "OnlyConnect":
        return <OnlyConnect {...commonProps} />;

      case "SameLetters":
        return <SameLetterWords {...commonProps} />;

      case "NumberSets":
        return <NumberSets {...commonProps} />;

      case "Algebra":
        return <Algebra {...commonProps} />;

      case "WordCodes/Question":
        return <WordCodes mode={"question"} {...commonProps} />;

      case "WordCodes/Match":
        return <WordCodes mode={"match"} {...commonProps} />;

      case "PuzzleSequence":
        return <PuzzleConfig {...commonProps} />;

      case "challenges":
        return <ChallengesInfo settings={settings} addGold={addGold} />;

      case "settings":
        return <Settings settings={settings} onSettingsChange={setSettings} />;

      case "random":
        return null;

      case "LettersNumbersGameshow":
        return (
          <LettersNumbersGameshow
            commonWingoProps={commonWingoProps}
            settings={settings}
            setPage={setPage}
            page={page}
            themes={[Themes.GenericLettersGame, Themes.GenericNumbersGame]}
            setTheme={setThemeIfNoPreferredSet}
            addGold={addGold}
            // TODO: Should LettersNumbersGameshow have gamemodeSettings like other gamemodes or an initial configuration page?
            numSets={5}
            numLetterRoundsPerSet={2}
            numNumberRoundsPerSet={1}
            numConundrumRoundsPerSet={0}
            hasFinishingConundrum={true}
          />
        );

      case "Wingo/Gameshow":
        return (
          <WingoGameshow
            commonWingoProps={commonWingoProps}
            // TODO: Should WingoGameshow have gamemodeSettings like other gamemodes or an initial configuration page?
            firstRoundConfig={{ numWingos: 4, numPuzzles: 1 }}
            secondRoundConfig={{ numWingos: 3, numPuzzles: 1 }}
            thirdRoundConfig={{ numFourLengthWingos: 2, numPuzzles: 1, numFiveLengthWingos: 2, numberPuzzles: 1 }}
            hasFinalRound={true}
          />
        );
    }
  })();

  return (
    <div className="app" data-automation-id="app" data-automation-page-name={page}>
      {page !== "splash-screen" && page !== "TitlePage" && (
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
            <h1 className="title">{pageDescriptions.find((x) => x.page === page)?.title}</h1>
            {Boolean(pageDescriptions.find((x) => x.page === page)?.helpInfo) && (
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
      {Boolean(isHelpInfoShown && page !== "home" && page !== "TitlePage" && page !== "settings") && (
        <HelpInformation page={page} onClose={() => setIsHelpInfoShown(false)}></HelpInformation>
      )}
      <div className="version">{VERSION}</div>
    </div>
  );
};
