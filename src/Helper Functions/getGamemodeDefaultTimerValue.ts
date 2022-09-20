import { gamemodeDefaultTimerValues } from "../Data/DefaultTimerValues";
import { PageName } from "../Data/PageNames";

const DEFAULT_TIMER_VALUE = 30;

export const getGamemodeDefaultTimerValue = (page: PageName) => {
  return gamemodeDefaultTimerValues.find((x) => x.page === page)?.timerValue ?? DEFAULT_TIMER_VALUE;
};
