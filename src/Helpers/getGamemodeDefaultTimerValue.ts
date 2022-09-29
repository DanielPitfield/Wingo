import { gamemodeDefaultTimerValues } from "../Data/DefaultTimerValues";
import { PagePath } from "../Data/PageNames";

const DEFAULT_TIMER_VALUE = 30;

export const getGamemodeDefaultTimerValue = (page: PagePath) => {
  return gamemodeDefaultTimerValues.find((x) => x.page === page)?.timerValue ?? DEFAULT_TIMER_VALUE;
};
