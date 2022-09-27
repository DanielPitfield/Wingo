import { PagePath } from "../Data/PageNames";

export function isCampaignLevelPath(path: PagePath) {
  const pathString = path.toString();
  return pathString.includes("/campaign/areas/:") && pathString.toString().includes("levels/:");
}
