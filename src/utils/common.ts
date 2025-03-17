export interface IBox {
  queenIndex: number | null;
  isQueenPossible: boolean;
  region: number | null;
}

export interface IPosition {
  row: number;
  column: number;
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
