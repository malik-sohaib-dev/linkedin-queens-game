import { IGame, IHintMesh } from "./common";

export const hintGenerator = (
  gameBoard: IGame[][],
  boardSize: number,
  solutionLine: string
): { hintMesh: IHintMesh[][]; hintMessage: string } => {
  const hintMesh = new Array(boardSize).fill(0);
  let hintMessage = "This is a lovely Message";

  return { hintMesh, hintMessage };
};
