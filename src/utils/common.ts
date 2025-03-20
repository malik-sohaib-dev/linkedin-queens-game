export interface IBox {
  queenIndex: number | null;
  isQueenPossible: boolean;
  region: number | null;
}

export interface IPosition {
  row: number;
  column: number;
}

export interface IGame {
  region: number; // Region Number of cell. Range (0 - boardSize-1)
  isBlank: boolean; // Does the box have a blank
  isQueen: boolean; // Does the box have a queen
  conflict: boolean; // True if the placement in block causes game rule conflict
}
export interface IGamePatch {
  region?: number;
  isBlank?: boolean;
  isQueen?: boolean;
  conflict?: boolean;
}

export interface IHintMesh {
  panic: boolean; // Highlight cell error 
  highlight: boolean; // Highlight cell info
}

// Checks if the position is outside the board
export const isPositionOutsideBoundary = (
  { row: row, column: col }: IPosition,
  size: number
): boolean => {
  if (col < 0 || col >= size || row < 0 || row >= size) {
    return true;
  }
  return false;
};
