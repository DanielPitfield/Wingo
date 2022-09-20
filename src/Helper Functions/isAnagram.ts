export function isAnagram(newWord: string, targetWord: string): boolean {
  const constructedWordLetters = newWord.split("").sort().join("");
  const targetWordLetters = targetWord.split("").sort().join("");

  return constructedWordLetters === targetWordLetters;
}
