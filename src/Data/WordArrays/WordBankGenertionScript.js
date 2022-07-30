const word_bank = []; // Put unsorted words in an array here

let word_array = [];
function returnWords(wordLength) {
  for (let i = 0; i < word_bank.length; i++) {
    var word = word_bank[i];
    if (word.length === wordLength) {
      word_array.push(word);
    }
  }
  console.log(JSON.stringify(word_array));
}

returnWords(5); // Returns words with length of parameter