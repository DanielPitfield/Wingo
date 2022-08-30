import { PageName } from "../PageNames";

const DEFAULT_TIMER_VALUE = 30;

const defaultTimerValues: { page: PageName; timerValue: number }[] = [
  { page: "Algebra", timerValue: 100 },
  { page: "ArithmeticDrag/Match", timerValue: 100 },
  { page: "ArithmeticDrag/Order", timerValue: 100 },
  { page: "ArithmeticReveal", timerValue: 10 },
  { page: "LettersCategories", timerValue: 30 },
  { page: "LettersGame", timerValue: 30 },
  { page: "NumberSets", timerValue: 100 },
  { page: "NumbersGame", timerValue: 30 },
  { page: "OnlyConnect", timerValue: 60 },
  { page: "SameLetters", timerValue: 100 },
  { page: "wingo/interlinked", timerValue: 30 },
  { page: "WordCodes/Match", timerValue: 100 },
  { page: "WordCodes/Question", timerValue: 100 },
  { page: "Numble", timerValue: 600 },
];

export const getGamemodeDefaultTimerValue = (page: PageName) => {
  return defaultTimerValues.find((x) => x.page === page)?.timerValue ?? DEFAULT_TIMER_VALUE;
};
