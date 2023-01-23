# Wingo
A game based on Wordle but with more content (22+ unique game modes), better replayability, configurable gamemode settings and a dedicated campaign!

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![SASS](https://img.shields.io/badge/SASS-hotpink.svg?style=for-the-badge&logo=SASS&logoColor=white)

## Usage / Instructions
From the main menu, clicking the 'Custom Game' button will navigate to the lobby menu, this is where any of the gamemodes can be selected and played. To get playing immediately, click the 'Quick Game' button after which a random gamemode will be selected. A shortcut to the campaign as well as navigation to the game's options are also provided.

### Gamemode Settings
The current settings of the gamemode (things such as word length, difficulty, time limits) can be configured by clicking the 'Gamemode Settings' button below the name of the gamemode in the header. When exiting the gamemode, the most recently used settings will be saved. Additionally, a preset of settings can be saved for future use, just change the settings, provide a name for the preset and click the 'Save Preset' button. This preset can then be loaded at any time by clicking the 'Load Preset' button and selecting the preset by name.

Gamemode settings can not be configured for campaign levels!

### Challenges
When at the lobby menu (where gamemodes are selected), a list of challenges can be seen towards the right-hand side. Complete these challenges by fulfilling their descriptions/criteria. Once a challenge has been completed, it will shimmer and the reward of gold coins can be collected by clikcing the 'Redeem' button.

### Campaign
Whilst any gamemode can be played by selecting it from the lobby menu, there is also a campaign of predetermined levels! These levels are grouped into areas according to their topic or context (for instance, levels within the 'Travel' area may include guessing target words that are countries or cities!). Completing a level unlocks the next level in the area and all levels in an area must be completed for the next area to be unlocked!

### Gamemodes
The gamemodes are each categorised into one of four categories, the gamemode categories and their gamemodes are the following:

| Daily / Weekly   | Wingo         | Letters           | Numbers            |
| ---------------- | ------------- | ----------------- | ------------------ |
| Daily Wingo      | Standard      | Only Connect      | Quick Maths        |
| Daily Crossword  | Puzzle        | Letters Game      | Numble             |
| Weekly Crossword | Increasing    | Conundrum         | Numbers Game       |
|                  | Limitless     | Letter Categories | Arithmetic (Order) |
|                  | Categories    | Same Letter Words | Arithmetic (Match) |
|                  | Interlinked   |                   | Number Sets        |
|                  | Crossword     |                   | Algebra            |
    
## Known Issues
* useEffect() side effects
* Large, unmaintainable render methods for some components
* High RAM usage (loading 100,000+ possible words)
