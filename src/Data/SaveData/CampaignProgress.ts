export type AreaUnlockStatus = "locked" | "unlockable" | "unlocked";

export type CampaignSaveData = {
  areas: { name: string; status: AreaUnlockStatus; completedLevelNumbers: Set<string> }[];
};

/**
 * Gets the campaign progress.
 * @returns Campaign progress (default campaign start if not found in save data).
 */
export function getCampaignProgress(): CampaignSaveData {
  const campaignProgress = localStorage.getItem("campaign_progress");

  if (campaignProgress) {
    return JSON.parse(campaignProgress) as CampaignSaveData;
  }

  return { areas: [] };
}

/**
 * Updates the unlock status of an area when the unlock level has been completed.
 * @param areaName Name of the campaign area being unlocked.
 */
export function addCompletedCampaignAreaUnlockLevel(areaName: CampaignSaveData["areas"][0]["name"]) {
  // Get the current campaign progress (which is to be updated)
  const campaignProgress = getCampaignProgress();

  // After completing the unlock level, the area unlock status becomes unlocked
  const newAreaData: CampaignSaveData["areas"][0] = {
    name: areaName,
    status: "unlocked",
    completedLevelNumbers: new Set<string>(),
  };

  // Save the updated information about the unlocked area to campaign progress
  const newCampaignProgress = {
    ...campaignProgress,
    areas: campaignProgress.areas.filter((x) => x.name !== areaName).concat([newAreaData]),
  };

  localStorage.setItem("campaign_progress", JSON.stringify(newCampaignProgress));
}

/**
 * Incements the completed level count for the specified area.
 * @param areaName Name of the campaign area in which a level has been completed.
 * @param levelNumber levelNumber of the completed level.
 */
export function addCompletedCampaignAreaLevel(areaName: CampaignSaveData["areas"][0]["name"], levelNumber: string) {
  // Get the current campaign progress (which is to be updated)
  const campaignProgress = getCampaignProgress();

  // Find the currently saved progress information about the area
  const currentAreaData = campaignProgress.areas.find((x) => x.name === areaName);

  if (!currentAreaData) {
    return;
  }

  // After completing the level, the levelNumber is stored in  the area's completedLevelNumbers
  const newAreaData: CampaignSaveData["areas"][0] = {
    ...currentAreaData,
    completedLevelNumbers: currentAreaData.completedLevelNumbers.add(levelNumber),
  };

  // Save the updated information about the progressed area to campaign progress
  const newCampaignProgress = {
    ...campaignProgress,
    areas: campaignProgress.areas.filter((x) => x.name !== areaName).concat([newAreaData]),
  };

  localStorage.setItem("campaign_progress", JSON.stringify(newCampaignProgress));
}
