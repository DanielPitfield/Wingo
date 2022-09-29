export function getNextTeamNumberWithRemainingTime(
  currentTeamNumber: number,
  teamTimers: { teamNumber: number; remainingSeconds: number; totalSeconds: number }[]
) {
  /*
  Start the order with team numbers after the current team number
  Then go back to zero and complete the order with team numbers up to the current team number
  */
  const teamsAfter = teamTimers.filter((team) => team.remainingSeconds > 0 && team.teamNumber > currentTeamNumber);
  const teamsBefore = teamTimers.filter((team) => team.remainingSeconds > 0 && team.teamNumber < currentTeamNumber);
  const teamNumbersOrder = teamsAfter.concat(teamsBefore).map((x) => x.teamNumber);

  // This value may be needed in the case that the current team is the only team with time left
  const currentTeamRemainingTime = teamTimers.find((team) => team.teamNumber === currentTeamNumber)?.remainingSeconds;

  // Choose the next team (the first in the new determined order)
  if (teamNumbersOrder.length >= 1) {
    return teamNumbersOrder[0];
  }

  // No other team has time left, but the current team does
  if (currentTeamRemainingTime !== undefined && currentTeamRemainingTime > 0) {
    return currentTeamNumber;
  }

  // No team has time left
  return null;
}
