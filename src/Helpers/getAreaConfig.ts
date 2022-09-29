import { AllCampaignAreas } from "../Data/CampaignAreas/AllCampaignAreas";
import { AreaConfig } from "../Pages/Area";

export function getAreaConfig(areaName: string | undefined): AreaConfig | null {
  return AllCampaignAreas.find((area) => area.name === areaName) ?? null;
};
