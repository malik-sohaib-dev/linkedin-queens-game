interface IBox {
  queenIndex: number | null;
  isQueenPossible: boolean;
  region: number | null;
}

/**
 * #### Function to generate Queens board of size * size
 * @param size: number
 *
 */

/**
 * 1- Genrate template
 * 2- Generate Queens and blanks
 *      -
 * 3- Generate Regions
 */

const randomQueenIndexGenerator = (data: IBox[]): number => {
  // get the indexes of boxes where queen is allowed
  const allowedQueensIndexs = data
    .map((box, index) => {
      return box.isQueenPossible ? index : false;
    })
    .filter((val) => typeof val === "number");

  const random = Math.floor(Math.random() * allowedQueensIndexs.length);

  return allowedQueensIndexs[random];
};

const queensAndBlanksGenerator = (board: IBox[][], size: number): IBox[][] => {
  console.log("Generating Queens and Blanks");
  for (let i = 0; i < size; i++) {
    // Check a random valid box for queen
    const queenIndex = randomQueenIndexGenerator(board[i]);
    console.log("queenIndex", queenIndex);

    // set the queen at the respective index
    board[i][queenIndex] = {
      queenIndex: i,
      isQueenPossible: true,
      region: i,
    };

    // Set all blocks from the queen row apart from queenIndex to blank
    for (let j = 0; j < size; j++) {
      if (typeof board[i][j].queenIndex !== "number") {
        board[i][j] = { ...board[i][j], isQueenPossible: false };
      }
    }

    // Set all blocks from queen column apart from queenIndex to blank
    for (let j = 0; j < size; j++) {
      if (typeof board[j][queenIndex].queenIndex !== "number")
        board[j][queenIndex] = {
          ...board[j][queenIndex],
          isQueenPossible: false,
        };
    }

    // Set boxes adjacent to queen as blank
    if (i + 1 < size && queenIndex - 1 >= 0)
      board[i + 1][queenIndex - 1] = {
        ...board[i + 1][queenIndex - 1],
        isQueenPossible: false,
      };

    if (i + 1 < size && queenIndex + 1 < size)
      board[i + 1][queenIndex + 1] = {
        ...board[i + 1][queenIndex + 1],
        isQueenPossible: false,
      };
  }

  return board;
};

const regionGenerator = (board: IBox[][], size: number): IBox[][] => {
  // Define max number of blocks
  const maxBlocks = Math.floor((size * size - (size - 1) * 2) / 2);
  console.log("MaxBLok", maxBlocks);

  return board;
};

export const generategameBoard = (size: number): IBox[][] => {
  console.log("Generating Game board");
  // Initialize a default box
  const box: IBox = {
    queenIndex: null,
    isQueenPossible: true,
    region: null,
  };

  // Initialize a multidimentional array of size/size
  let board: IBox[][] = new Array(size).fill(true).map(() => {
    return new Array(size).fill(box);
  });

  // Generate Queens and Blanks
  board = queensAndBlanksGenerator(board, size);

  // Generate Regions
  board = regionGenerator(board, size);

  console.log("Final Board", board);
  // Return Game board
  return board;
};
