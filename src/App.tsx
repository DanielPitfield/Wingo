import React, { useState } from "react";
import { SplashScreen } from "./Pages/SplashScreen";
import { LobbyMenu } from "./Pages/LobbyMenu";
import WingoConfig, { pickRandomElementFrom, WingoConfigProps } from "./Pages/WingoConfig";
import { Button } from "./Components/Button";
import NumbleConfig, { NumbleConfigProps } from "./Pages/NumbleConfig";
import GoldCoin from "./Data/Images/gold.png";
import { SaveData, SettingsData } from "./Data/SaveData";
import LettersGameConfig, { LettersGameConfigProps } from "./Pages/LettersGameConfig";
import NumbersGameConfig, { NumbersGameConfigProps } from "./Pages/NumbersGameConfig";
import { Campaign } from "./Pages/Campaign";
import { Area, AreaConfig } from "./Pages/Area";
import { getId, Level, LevelConfig } from "./Components/Level";
import LetterCategoriesConfig, { LetterCategoriesConfigProps } from "./Pages/LetterCategoriesConfig";
import ArithmeticReveal, { ArithmeticRevealProps } from "./Pages/ArithmeticReveal";
import ArithmeticDrag, { ArithmeticDragProps } from "./Pages/ArithmeticDrag";
import { Theme, Themes } from "./Data/Themes";
import { AllCampaignAreas } from "./Data/CampaignAreas/AllCampaignAreas";
import { Settings } from "./Pages/Settings";
import OnlyConnect, { OnlyConnectProps } from "./Pages/OnlyConnect";
import { useBackgroundMusic } from "./Data/Sounds";
import { VERSION } from "./Data/Version";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./Pages/ErrorFallback";
import SameLetterWords, { SameLetterWordsProps } from "./Pages/SameLetterWords";
import NumberSets, { NumberSetsProps } from "./Pages/NumberSets";
import Algebra, { AlgebraProps } from "./Pages/Algebra";
import { ChallengesInfo } from "./Components/ChallengesInfo";
import WordCodes, { WordCodesProps } from "./Pages/WordCodes";
import { LettersNumbersGameshow } from "./Pages/LettersNumbersGameshow";
import { WingoGameshow } from "./Pages/WingoGameshow";
import { FiArrowLeft, FiHelpCircle, FiSettings } from "react-icons/fi";
import HelpInformation from "./Components/HelpInformation";
import { TitlePage } from "./Pages/TitlePage";
import { defaultWingoGameshowRoundOrder } from "./Data/DefaultGamemodeSettings";
import { pageDescriptions } from "./Data/PageDescriptions";
import SequencePuzzle from "./Pages/SequencePuzzle";
import { CustomGameshow } from "./Pages/CustomGameshow";
import { getGamemodeDefaultNumGuesses } from "./Data/DefaultNumGuesses";
import { getGamemodeDefaultWordLength } from "./Data/DefaultWordLengths";
import { getPageGamemodeSettings } from "./Data/getPageGamemodeSettings";
import { PageName } from "./Data/PageNames";

export const App = () => {
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

  React.useEffect(() => {
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

  React.useEffect(() => {
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

  React.useEffect(() => {
    SaveData.setGold(gold);
  }, [gold]);

  React.useEffect(() => {
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

  // Default (free play)
  function onComplete() {
    if (!isRandomSession) {
      return;
    } else {
      // New random page
      setPage("random");
    }
  }

  // Update campaign progress (when a campaign level is successfully completed)
  function onCompleteCampaignLevel(isUnlockLevel: boolean, levelConfig: LevelConfig) {
    if (selectedCampaignArea) {
      if (isUnlockLevel) {
        SaveData.addCompletedCampaignAreaUnlockLevel(selectedCampaignArea.name);
      } else {
        const levelId = getId(levelConfig.level);
        SaveData.addCompletedCampaignAreaLevel(selectedCampaignArea.name, levelId);
      }
    }
  }

  React.useEffect(() => {
    const DEFAULT_PAGE_TITLE = "Wingo";

    // If the page has changed (and its not the splash screen)
    if (getPageFromUrl() !== page && page !== "splash-screen") {
      // Update the URL in the browser to the new page
      window.history.pushState({}, "", `/${page}`);

      // Update the window title in the browser
      document.title = pageDescriptions.find((x) => x.page === page)?.title || DEFAULT_PAGE_TITLE;
    }
  }, [page]);

  React.useEffect(() => {
    // On clicking 'Back' in the browser, update the page from the URL
    window.onpopstate = () => setPage(getPageFromUrl() || "home");
  }, []);

  React.useEffect(() => {
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

  function isCampaignLevel(pageName: PageName) {
    if (pageName === "campaign/area/level") {
      return true;
    } else {
      return false;
    }
  }

  const pageComponent = (() => {
    const commonProps = {
      isCampaignLevel: isCampaignLevel(page),
      campaignConfig: { isCampaignLevel: false as false },
      defaultNumGuesses: getGamemodeDefaultNumGuesses(page),
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
      defaultWordLength: getGamemodeDefaultWordLength(page),
      enforceFullLengthGuesses: true,
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
              onCompleteCampaignLevel={onCompleteCampaignLevel}
              settings={settings}
            />
          )
        );

      case "wingo/daily":
        return (
          <WingoConfig
            {...commonProps}
            {...commonWingoProps}
            mode="daily"
            gamemodeSettings={getPageGamemodeSettings(page) as WingoConfigProps["gamemodeSettings"]}
          />
        );

      case "wingo/repeat":
        return (
          <WingoConfig
            {...commonProps}
            {...commonWingoProps}
            mode="repeat"
            gamemodeSettings={getPageGamemodeSettings(page) as WingoConfigProps["gamemodeSettings"]}
          />
        );

      case "wingo/category":
        return (
          <WingoConfig
            {...commonProps}
            {...commonWingoProps}
            mode="category"
            enforceFullLengthGuesses={false}
            gamemodeSettings={getPageGamemodeSettings(page) as WingoConfigProps["gamemodeSettings"]}
          />
        );

      case "wingo/increasing":
        return (
          <WingoConfig
            {...commonProps}
            {...commonWingoProps}
            mode="increasing"
            gamemodeSettings={getPageGamemodeSettings(page) as WingoConfigProps["gamemodeSettings"]}
          />
        );

      case "wingo/limitless":
        return (
          <WingoConfig
            {...commonProps}
            {...commonWingoProps}
            mode="limitless"
            gamemodeSettings={getPageGamemodeSettings(page) as WingoConfigProps["gamemodeSettings"]}
          />
        );

      case "wingo/puzzle":
        return (
          <WingoConfig
            {...commonProps}
            {...commonWingoProps}
            mode="puzzle"
            gamemodeSettings={getPageGamemodeSettings(page) as WingoConfigProps["gamemodeSettings"]}
          />
        );

      case "Conundrum":
        return (
          <WingoConfig
            {...commonProps}
            {...commonWingoProps}
            mode="conundrum"
            gamemodeSettings={getPageGamemodeSettings(page) as WingoConfigProps["gamemodeSettings"]}
          />
        );

      case "wingo/interlinked":
        return (
          <WingoConfig
            {...commonProps}
            {...commonWingoProps}
            mode="interlinked"
            gamemodeSettings={getPageGamemodeSettings(page) as WingoConfigProps["gamemodeSettings"]}
          />
        );

      case "wingo/crossword":
        return (
          <WingoConfig
            {...commonProps}
            {...commonWingoProps}
            mode="crossword"
            gamemodeSettings={getPageGamemodeSettings(page) as WingoConfigProps["gamemodeSettings"]}
          />
        );

      case "wingo/crossword/fit":
        return (
          <WingoConfig
            {...commonProps}
            {...commonWingoProps}
            mode="crossword/fit"
            gamemodeSettings={getPageGamemodeSettings(page) as WingoConfigProps["gamemodeSettings"]}
          />
        );

      case "wingo/crossword/daily":
        return (
          <WingoConfig
            {...commonProps}
            {...commonWingoProps}
            mode="crossword/daily"
            gamemodeSettings={getPageGamemodeSettings(page) as WingoConfigProps["gamemodeSettings"]}
          />
        );

      case "wingo/crossword/weekly":
        return (
          <WingoConfig
            {...commonProps}
            {...commonWingoProps}
            mode="crossword/weekly"
            gamemodeSettings={getPageGamemodeSettings(page) as WingoConfigProps["gamemodeSettings"]}
          />
        );

      case "LettersCategories":
        return (
          <LetterCategoriesConfig
            {...commonProps}
            enforceFullLengthGuesses={false}
            gamemodeSettings={getPageGamemodeSettings(page) as LetterCategoriesConfigProps["gamemodeSettings"]}
          />
        );

      case "LettersGame":
        return (
          <LettersGameConfig
            {...commonProps}
            theme={Themes.GenericLettersGame}
            gamemodeSettings={getPageGamemodeSettings(page) as LettersGameConfigProps["gamemodeSettings"]}
          />
        );

      case "NumbersGame":
        return (
          <NumbersGameConfig
            {...commonProps}
            theme={Themes.GenericNumbersGame}
            gamemodeSettings={getPageGamemodeSettings(page) as NumbersGameConfigProps["gamemodeSettings"]}
          />
        );

      case "ArithmeticReveal":
        return (
          <ArithmeticReveal
            {...commonProps}
            gamemodeSettings={getPageGamemodeSettings(page) as ArithmeticRevealProps["gamemodeSettings"]}
          />
        );

      case "ArithmeticDrag/Order":
        return (
          <ArithmeticDrag
            {...commonProps}
            mode="order"
            gamemodeSettings={getPageGamemodeSettings(page) as ArithmeticDragProps["gamemodeSettings"]}
          />
        );

      case "ArithmeticDrag/Match":
        return (
          <ArithmeticDrag
            {...commonProps}
            mode="match"
            gamemodeSettings={getPageGamemodeSettings(page) as ArithmeticDragProps["gamemodeSettings"]}
          />
        );

      case "Numble":
        return (
          <NumbleConfig
            {...commonProps}
            gamemodeSettings={getPageGamemodeSettings(page) as NumbleConfigProps["gamemodeSettings"]}
          />
        );

      case "OnlyConnect":
        return (
          <OnlyConnect
            {...commonProps}
            gamemodeSettings={getPageGamemodeSettings(page) as OnlyConnectProps["gamemodeSettings"]}
          />
        );

      case "SameLetters":
        return (
          <SameLetterWords
            {...commonProps}
            gamemodeSettings={getPageGamemodeSettings(page) as SameLetterWordsProps["gamemodeSettings"]}
          />
        );

      case "NumberSets":
        return (
          <NumberSets
            {...commonProps}
            gamemodeSettings={getPageGamemodeSettings(page) as NumberSetsProps["gamemodeSettings"]}
          />
        );

      case "Algebra":
        return (
          <Algebra
            {...commonProps}
            gamemodeSettings={getPageGamemodeSettings(page) as AlgebraProps["gamemodeSettings"]}
          />
        );

      case "WordCodes/Question":
        return (
          <WordCodes
            {...commonProps}
            mode={"question"}
            gamemodeSettings={getPageGamemodeSettings(page) as WordCodesProps["gamemodeSettings"]}
          />
        );

      case "WordCodes/Match":
        return (
          <WordCodes
            {...commonProps}
            mode={"match"}
            gamemodeSettings={getPageGamemodeSettings(page) as WordCodesProps["gamemodeSettings"]}
          />
        );

      case "PuzzleSequence":
        return <SequencePuzzle {...commonProps} />;

      case "challenges":
        return <ChallengesInfo settings={settings} addGold={addGold} />;

      case "settings":
        return <Settings settings={settings} onSettingsChange={setSettings} />;

      case "random":
        return null;

      case "LettersNumbersGameshow":
        return (
          <LettersNumbersGameshow
            {...commonProps}
            {...commonWingoProps}
            themes={[Themes.GenericLettersGame, Themes.GenericNumbersGame]}
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
            {...commonProps}
            {...commonWingoProps}
            // TODO: Should WingoGameshow have gamemodeSettings like other gamemodes or an initial configuration page?
            roundOrderConfig={defaultWingoGameshowRoundOrder}
          />
        );

      case "Custom/Gameshow":
        return <CustomGameshow {...commonProps} />;
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
