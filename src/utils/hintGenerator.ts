import { IGame, IHintMesh } from "./common";

export const hintGenerator = (
  gameBoard: IGame[][],
  boardSize: number,
  solutionLine: string
): { hintMesh: IHintMesh[][]; hintMessage: string } => {
  void gameBoard;
  void solutionLine;
  const hintMesh = new Array(boardSize).fill(0);
  const hintMessage = "This is a lovely Message";

  return { hintMesh, hintMessage };
};
