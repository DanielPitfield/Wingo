import { PagePath } from "../Data/PageNames";

// Is the mode a mode which resets daily/weekly?
export const isTimePeriodicMode = (page: PagePath): boolean => {
  const timePeriodSearchStrings = ["daily", "weekly"];

  // The mode contains any of the above timePeriodSearchStrings
  return timePeriodSearchStrings.some((timePeriodString) => {
    return page.toString().toLowerCase().includes(timePeriodString.toLowerCase());
  });
};

export const isDailyMode = (page: PagePath): boolean => {
  return page.toString().toLowerCase().includes("daily");
};

export const isWeeklyMode = (page: PagePath): boolean => {
  return page.toString().toLowerCase().includes("weekly");
};
