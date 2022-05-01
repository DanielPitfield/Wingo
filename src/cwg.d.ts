type CrosswordGenerationResult =
  | {
      height: number; // height of the matrix
      width: number; // width of the matrix
      positionObjArr: [
        // position of each input word, as input's order
        {
          wordStr: string; // string of word
          xNum: number; // begin position x
          yNum: number; // begin position y
          isHorizon: boolean; // horizontal or vertical
        }
      ];
      ownerMap: [
        // matrix of the crossword
        [
          | {
              letter: string; // letter of this position
              vertical: number; // which word this letter belongs to. in this case, it's 0th: 'do'
            }
          | undefined
        ],
        [
          { letter: string; vertical?: number; horizontal?: number } // letter of [1, 1] belongs to both words
        ]
      ];
    }
  | false;

declare function cwg(words: string[]): CrosswordGenerationResult;

declare module "cwg" {
  export = cwg;
}
