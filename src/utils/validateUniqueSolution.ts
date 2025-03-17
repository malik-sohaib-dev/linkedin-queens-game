import { IBox } from "./common";

const test = (str: string) => {
  for (let i = 0; i < str.length - 1; i++) {
    const l = str.charCodeAt(i);
    const r = str.charCodeAt(i + 1);
    if (r === l + 1 || l === r + 1) return false;
  }

  return true;
};

const generatePermutations = (str: string) => {
  const permutations: string[] = [];
  function permute(str: string, left: number, right: number) {
    if (left == right) {
      {
        if (test(str)) permutations.push(str);
      }
    } else {
      for (let i = left; i <= right; i++) {
        str = swap(str, left, i);
        permute(str, left + 1, right);
        str = swap(str, left, i);
      }
    }
  }
  function swap(a: string, i: number, j: number) {
    const charArray = a.split("");
    const temp = charArray[i];
    charArray[i] = charArray[j];
    charArray[j] = temp;
    return charArray.join("");
  }
  permute(str, 0, str.length - 1);
  return permutations;
};

export const isUniqueSolution = (
  gameBoard: IBox[][],
  boardSize: number
): boolean => {
  const str = new Array(boardSize)
    .fill(0)
    .map((_, i) => i)
    .join("");
  const possibleSolutionPermutations = generatePermutations(str);
  let validSolutionsCount = 0;

  for (let i = 0; i < possibleSolutionPermutations.length; i++) {
    // Initialize regionQueens of boardSize to track queen count for every region
    let regionQueens = new Array(boardSize).fill(0);
    const queens = possibleSolutionPermutations[i];
    for (let j = 0; j < queens.length; j++) {
      const cell = gameBoard[j][Number(queens[j])];

      if (cell.region == 0 || cell.region) regionQueens[cell.region]++;
    }

    if (!regionQueens.find((val) => val > 1)) validSolutionsCount++;
  }

  console.log("Valid Solutions", validSolutionsCount);

  return validSolutionsCount === 1;
};
