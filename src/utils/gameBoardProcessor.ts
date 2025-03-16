import { IGame } from "../App";
import { IPosition, isPositionOutsideBoundary } from "./common";

interface IgameBoardProcessingResult {
  hasConflicts: boolean;
  queenCount: number;
}

const rowConflict = (gameBoard: IGame[][], row: number): boolean => {
  // Find how many cells have queens in that row
  const rowQueens = gameBoard[row].filter((val) => val.isQueen);

  // If there is more than one queen in that row, than we've a row conflict
  return rowQueens.length > 1;
};

const columnConflict = (
  gameBoard: IGame[][],
  size: number,
  col: number
): boolean => {
  let colQueens = 0;
  // Find how many cells have queens in that column
  for (let row = 0; row < size; row++) {
    if (gameBoard[row][col].isQueen) colQueens++;
  }
  // If there is more than one queen in that row, than we've a row conflict
  return colQueens > 1;
};

export const processGameBoard = (
  gameBoard: IGame[][],
  boardSize: number
): IgameBoardProcessingResult => {
  let queenCount = 0;
  let hasConflicts = false;

  // If gameBoard dimensions don't match the boardSize, then we've conflicts
  if (gameBoard.length !== boardSize || gameBoard[0].length !== boardSize)
    return { hasConflicts: true, queenCount };

  // Initialize regionQueens of boardSize to track queen count for every region
  let regionQueens = new Array(boardSize).fill(0);

  // Loop over all cells and find conflicting queens
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      // Reset conflict for the cell
      gameBoard[row][col] = { ...gameBoard[row][col], conflict: false };
      const cell = gameBoard[row][col];

      // Skip if the cell doesn't have a queen
      if (!cell.isQueen) continue;

      // Increment the queen counter for this region
      regionQueens[cell.region]++;

      // Add a conflict if the row has more than one queen
      if (rowConflict(gameBoard, row)) {
        gameBoard[row][col] = { ...gameBoard[row][col], conflict: true };
        continue; // Move onto next cell if found conflict in current cell
      }

      // Add a conflict if the column has more than one queen
      if (columnConflict(gameBoard, boardSize, col)) {
        gameBoard[row][col] = { ...gameBoard[row][col], conflict: true };
        continue; // Move onto next cell if found conflict in current cell
      }

      // Check for conflict in bottom connected diagonals
      const positions: IPosition[] = [
        { row: row - 1, column: col - 1 },
        { row: row - 1, column: col + 1 },
        { row: row + 1, column: col - 1 },
        { row: row + 1, column: col + 1 },
      ];

      for (let i = 0; i < positions.length; i++) {
        if (!isPositionOutsideBoundary(positions[i], boardSize)) {
          if (gameBoard[positions[i].row][positions[i].column].isQueen) {
            gameBoard[row][col] = { ...gameBoard[row][col], conflict: true };
            continue; // Move onto next cell if found conflict in current cell
          }
        }
      }
    }
  }

  // Calculate total queens
  queenCount = regionQueens.reduce((a, b) => a + b);

  // if any region has more than one queen, then set the conflic to true
  hasConflicts = regionQueens.find((val) => val > 1) ? true : hasConflicts;

  // loop over all gameBoard cells
  return { hasConflicts, queenCount };
};
