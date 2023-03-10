import { PuzzleConfigProps } from "../Pages/SequencePuzzle";

/** All puzzles */
export const SequencePuzzleTemplates: PuzzleConfigProps[] = [
  {
    mode: "sequence",
    difficulty: "easy",
    correctAnswerDescription: "Single icon, moving vertically downwards",
    sequence: {
      hint: [
        {
          icon1: { left: "10%", top: "10%" },
        },
        {
          icon1: { left: "30%", top: "10%" },
        },
        {
          icon1: { left: "50%", top: "10%" },
        },
      ],
      correctAnswer: {
        icon1: { left: "70%", top: "10%" },
      },
      incorrectAnswers: [
        { icon1: { left: "10%", top: "20%" } },
        { icon1: { left: "30%", top: "50%" } },
        { icon1: { left: "50%", top: "10%" } },
      ],
    },
  },

  {
    mode: "sequence",
    difficulty: "easy",
    correctAnswerDescription: "Single icon, moving horizontally across",
    sequence: {
      hint: [
        {
          icon1: { left: "10%", top: "10%" },
        },
        {
          icon1: { left: "10%", top: "30%" },
        },
        {
          icon1: { left: "10%", top: "50%" },
        },
      ],
      correctAnswer: {
        icon1: { left: "10%", top: "70%" },
      },
      incorrectAnswers: [
        { icon1: { left: "10%", top: "50%" } },
        { icon1: { left: "30%", top: "70%" } },
        { icon1: { left: "50%", top: "70%" } },
      ],
    },
  },

  {
    mode: "sequence",
    difficulty: "medium",
    correctAnswerDescription: "Two icons, one moving vertically downwards, the other moving horizontally across",
    sequence: {
      hint: [
        {
          icon1: { left: "10%", top: "10%" },
          icon2: { left: "10%", top: "10%" },
        },
        {
          icon1: { left: "10%", top: "30%" },
          icon2: { left: "30%", top: "10%" },
        },
        {
          icon1: { left: "10%", top: "50%" },
          icon2: { left: "50%", top: "10%" },
        },
      ],
      correctAnswer: {
        icon1: { left: "10%", top: "70%" },
        icon2: { left: "70%", top: "10%" },
      },
      incorrectAnswers: [
        { icon1: { left: "10%", top: "50%" }, icon2: { left: "50%", top: "10%" } },
        { icon1: { left: "30%", top: "70%" }, icon2: { left: "50%", top: "20%" } },
        { icon1: { left: "50%", top: "70%" }, icon2: { left: "30%", top: "10%" } },
      ],
    },
  },
];
