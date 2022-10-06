import { PagePath } from "../Data/PageNames";
import { isCampaignAreaPath, isCampaignLevelPath } from "./CampaignPathChecks";

export function getAreaBacktrackPath(path: PagePath): PagePath {
  // Already an area path
  if (isCampaignAreaPath(path)) {
    return path;
  }

  // To backtrack to area, it must be a campaign level path
  if (!isCampaignLevelPath(path)) {
    // Not a campaign level path, go back to campaign page
    return "/Campaign" as PagePath;
  }

  const pathString = path.toString();

  // What are the sub-directories of the path?
  const directories = pathString.split("/");

  // How many directories (how many / to go back and remove anything after)
  const numDirectoriesToTrim = 2;
  // Remove the last two sub-directories
  directories.splice(directories.length - numDirectoriesToTrim, numDirectoriesToTrim);
  // Reconstruct the trimmed path
  const areaBacktrackPath = directories.join("/");

  return areaBacktrackPath as PagePath ?? "/Campaign" as PagePath;
}
