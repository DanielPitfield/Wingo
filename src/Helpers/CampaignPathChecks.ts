import { PagePath } from "../Data/PageNames";

export function isCampaignLevelPath(path: PagePath) {
  const pathString = path.toString();
  // Has a dynamic segment for BOTH areas and levels
  return pathString.includes("/Campaign/Areas/") && pathString.toString().includes("levels/");
}

export function isCampaignAreaPath(path: PagePath) {
  const pathString = path.toString();
  // Has a dynamic segment for ONLY areas and NOT levels
  return pathString.includes("/Campaign/Areas/") && !pathString.toString().includes("levels/");
}
