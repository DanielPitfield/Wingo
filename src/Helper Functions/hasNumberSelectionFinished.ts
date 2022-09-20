export function hasNumberSelectionFinished(
  statuses: {
    type: "original" | "intermediary";
    number: number | null;
    picked: boolean;
  }[],
  numOperands: number
): boolean {
  return statuses.filter((x) => x.type === "original" && x.number).length === numOperands;
}
