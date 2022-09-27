import { PagePath } from "../Data/PageNames";
import { isCampaignAreaPath, isCampaignLevelPath } from "./CampaignPathChecks";

export function getAreaBacktrackPath(path: PagePath) {
  // To go back to area, it must be a campaign level path
  if (!isCampaignLevelPath(path)) {
    return isCampaignAreaPath(path) ? path : "/campaign" as PagePath;
  }

  const pathString = path.toString();

  // What are the sub-directories of the path?
  const directories = pathString.split("/");
  // How many directories (how many / to go back and remove anything after)
  const numDirectoriesToTrim = 2;
  // Remove the last two sub-directories
  const trimmedDirectories = directories.splice(directories.length - numDirectoriesToTrim, numDirectoriesToTrim);

  // Reconstruct the trimmed path
  return trimmedDirectories.join("/") as PagePath;
}
