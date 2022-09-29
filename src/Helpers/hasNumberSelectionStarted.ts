export function hasNumberSelectionStarted(
  statuses: {
    type: "original" | "intermediary";
    number: number | null;
    picked: boolean;
  }[]
): boolean {
  return statuses.filter((x) => x.type === "original" && x.number).length > 0;
}
