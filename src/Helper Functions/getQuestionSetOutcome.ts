export function getQuestionSetOutcome(numCorrectAnswers: number, targetScore: number, isCampaignLevel: boolean) {
  // Reached campaign target score
  if (isCampaignLevel && numCorrectAnswers >= targetScore) {
    return "success";
  }

  if (isCampaignLevel && numCorrectAnswers < targetScore) {
    return "error";
  }

  // All questions in the set answered correctly
  if (numCorrectAnswers === targetScore) {
    return "success";
  }

  // No answers correct
  if (numCorrectAnswers === 0) {
    return "error";
  }

  // Some answers correct
  return "default";
}
