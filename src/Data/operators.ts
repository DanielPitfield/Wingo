export const operators: { name: "÷" | "-" | "+" | "×"; function: (num1: number, num2: number) => number }[] = [
  {
    name: "÷",
    function: (num1: number, num2: number): number => num1 / num2,
  },
  {
    name: "-",
    function: (num1: number, num2: number): number => num1 - num2,
  },
  {
    name: "+",
    function: (num1: number, num2: number): number => num1 + num2,
  },
  {
    name: "×",
    function: (num1: number, num2: number): number => num1 * num2,
  },
];

export const operatorSymbols = ["÷", "-", "+", "×"];
