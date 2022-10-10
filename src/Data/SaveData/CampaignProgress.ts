export type CampaignSaveData = {
  areas: { name: string; status: "locked" | "unlockable" | "unlocked"; completedLevelIds: string[] }[];
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
 * Incements the completed level count for the specified area.
 * @param areaName Name of the campaign area.
 */
export function addCompletedCampaignAreaUnlockLevel(areaName: CampaignSaveData["areas"][0]["name"]) {
  // Get the current campaign progress (which is to be updated)
  const campaignProgress = getCampaignProgress();

  const newAreaData: CampaignSaveData["areas"][0] = {
    name: areaName,
    status: "unlocked",
    completedLevelIds: ["unlock"],
  };

  const newCampaignProgress = {
    ...campaignProgress,
    areas: campaignProgress.areas.filter((x) => x.name !== areaName).concat([newAreaData]),
  };

  localStorage.setItem("campaign_progress", JSON.stringify(newCampaignProgress));
}

/**
 * Incements the completed level count for the specified area.
 * @param areaName Name of the campaign area.
 * @param levelId ID of the area.
 */
export function addCompletedCampaignAreaLevel(areaName: CampaignSaveData["areas"][0]["name"], levelId: string) {
  // Get the current campaign progress (which is to be updated)
  const campaignProgress = getCampaignProgress();

  // Find the existing area info (if any)
  const existingArea = campaignProgress.areas.find((x) => x.name === areaName);

  const newAreaData: CampaignSaveData["areas"][0] = {
    name: areaName,
    status: "unlocked",
    completedLevelIds: Array.from(new Set((existingArea?.completedLevelIds || ["unlock"]).concat(levelId))),
  };

  const newCampaignProgress = {
    ...campaignProgress,
    areas: campaignProgress.areas.filter((x) => x.name !== areaName).concat([newAreaData]),
  };

  localStorage.setItem("campaign_progress", JSON.stringify(newCampaignProgress));
}
