import { pageDescriptions } from "../Data/PageDescriptions";
import { PagePath } from "../Data/PageNames";

export const getLocalStorageItemName = (page: PagePath): string | null => {
  const modeName = pageDescriptions.find((x) => x.path === page)?.title;

  if (modeName) {
    return modeName + "gamemodeSettings";
  }

  return null;
};
