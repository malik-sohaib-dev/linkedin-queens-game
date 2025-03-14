interface IBox {
  queenIndex: number | null;
  isQueenPossible: boolean;
  region: number | null;
}

interface IDirection {
  row: number;
  column: number;
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
  for (let i = 0; i < size; i++) {
    // Check a random valid box for queen
    const queenIndex = randomQueenIndexGenerator(board[i]);

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

const isPositionOutsideBoundary = (
  { row: row, column: col }: IDirection,
  size: number
): boolean => {
  if (col < 0 || col >= size || row < 0 || row >= size) {
    return true;
  }
  return false;
};

const queenBoxingConflict = (board: IBox[][], size: number): boolean => {
  let queenBoxingConflict = true;

  for (let i = 0; i < size; i++) {
    queenBoxingConflict = true;
    for (let j = 0; j < size; j++) {
      if (typeof board[i][j].queenIndex !== "number") continue;

      const row = i;
      const col = j;
      const queenBox: IDirection[] = [
        { row: row - 1, column: col },
        { row: row, column: col + 1 },
        { row: row + 1, column: col },
        { row: row, column: col - 1 },
      ];

      // loop over all possible movements
      for (let k = 0; k < queenBox.length; k++) {
        if (isPositionOutsideBoundary(queenBox[k], size)) {
          continue;
        }

        if (
          typeof board[queenBox[k].row][queenBox[k].column].region ===
            "number" &&
          board[row][col].region !==
            board[queenBox[k].row][queenBox[k].column].region
        ) {
          continue;
        }

        queenBoxingConflict = false;
        break;
      }
    }
    if (queenBoxingConflict) break;
  }

  return queenBoxingConflict;
};

const boxValidation = (
  position: IDirection,
  size: number,
  region: number,
  board: IBox[][]
): boolean => {
  const col = position.column;
  const row = position.row;
  // Check if position is outside box
  if (isPositionOutsideBoundary(position, size)) {
    return false;
  }

  // Check if region is already marked or has a queen in it
  if (
    board[row][col].isQueenPossible ||
    typeof board[row][col].region === "number"
  ) {
    return false;
  }

  // Set the region to selected position and see if it causes queen boxing conflict

  // <<RANT>> Because of JS shenanigans, I've to do this mumbo jumbo. "JS passes natives by value and other data types by reference. Even spread operator won't work in my case because of nested structure." I've rawdawgged 2 ways for my case though, the aesthetic way and the easy way.
  // Method 1. Artificially duplicate the IBox[][] array
  // const interimBoard: IBox[][] = [];
  // for (let i = 0; i < board.length; i++) {
  //   interimBoard.push([]);
  //   for (let j = 0; j < board[i].length; j++) {
  //     interimBoard[i].push(board[i][j]);
  //   }
  // }
  // interimBoard[row][col] = { ...interimBoard[row][col], region };
  // Method 2. Shitty looking but Less expensive value rotation I guess
  const tempRegion = board[row][col].region;
  board[row][col].region = region;
  if (queenBoxingConflict(board, size)) {
    board[row][col].region = tempRegion; // Reassigning the original region
    return false;
  }
  board[row][col].region = tempRegion; // Reassigning the original region

  return true;
};

const validRegionDirectionsGenerator = (
  position: IDirection,
  board: IBox[][],
  size: number,
  region: number
): IDirection[] => {
  let positions: IDirection[] = [];
  const row = position.row;
  const col = position.column;

  // Every position can have a max of 4 valid directions
  const possibleMovements: IDirection[] = [
    { row: row - 1, column: col },
    { row: row, column: col + 1 },
    { row: row + 1, column: col },
    { row: row, column: col - 1 },
  ];
  // loop over all possible movements
  for (let i = 0; i < possibleMovements.length; i++) {
    const isValidPosition = boxValidation(
      possibleMovements[i],
      size,
      region,
      board
    );

    if (isValidPosition) positions.push(possibleMovements[i]);
  }

  // No valid positions found
  return positions;
};

const regionGenerator = (board: IBox[][], size: number): IBox[][] => {
  // Define max number of blocks
  const maxBlocks = Math.floor((size * size - (size - 1) * 2) / 2);

  // Run nested loop over the board and set regions
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (
        !board[i][j].isQueenPossible ||
        !(typeof board[i][j].queenIndex === "number")
      ) {
        continue;
      }

      // Note the region of the selected queen, if no region is present, then assign a region
      let selectedRegion = board[i][j].queenIndex;
      if (!selectedRegion) {
        selectedRegion = i;
        board[i][j] = { ...board[i][j], region: i };
      }

      // Randomly generate max block limit for the selected block. 2 <= regionBlockLimit <= maxBlocks
      const regionBlockLimit = Math.round(Math.random() * (maxBlocks - 2)) + 2;
      let blocksMarked = 1; // 1 by default since queen region is already marked

      // Loop to mark directions, range limited by regionBlockLimit or legal moves exhaustion
      let position: IDirection = { row: i, column: j };
      for (; blocksMarked < regionBlockLimit; blocksMarked++) {
        const validDirections: IDirection[] = validRegionDirectionsGenerator(
          position,
          board,
          size,
          selectedRegion
        );
        if (validDirections.length === 0) continue;
        // generate a random number between 0 and validDirections.length and take that direction
        const random = Math.floor(Math.random() * validDirections.length);

        const newPosition = validDirections[random];

        // Mark the selected newPosition in the board with selectedRegion
        board[newPosition.row][newPosition.column] = {
          ...board[newPosition.row][newPosition.column],
          region: selectedRegion,
        };

        // update the position with newPosition
        position = newPosition;
      }
    }
  }

  return board;
};

const fillUntrackedBoxes = (board: IBox[][], size: number): IBox[][] => {
  // By default we'll assume there are unaffiliated boxes
  let blanksPresent = true;
  while (blanksPresent) {
    blanksPresent = false;
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (typeof board[i][j].region === "number") continue;
        const row = i;
        const col = j;

        const possibleMovements: IDirection[] = [
          { row: row - 1, column: col },
          { row: row, column: col + 1 },
          { row: row + 1, column: col },
          { row: row, column: col - 1 },
        ];

        // Do a clockwise search and adopt the first region that comes in contact
        for (let k = 0; k < possibleMovements.length; k++) {
          // Verify if the position is inside the board
          if (isPositionOutsideBoundary(possibleMovements[k], size)) continue;

          const region =
            board[possibleMovements[k].row][possibleMovements[k].column].region;

          if (typeof region === "number") {
            board[row][col] = { ...board[row][col], region };
          }
        }

        blanksPresent = true;
      }
    }
  }

  return board;
};

export const generategameBoard = (size: number): IBox[][] => {
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

  // Coat regionless boxes with any neighboring region. Doing a clockwise search for now
  board = fillUntrackedBoxes(board, size);

  console.log("Final Board", board);
  // Return Game board
  return board;
};
