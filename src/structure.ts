/**
 * Multidimentional array
 * Each individual box contains:
 * - queenIndex: null or number (by default null)
 * - isQueenPossible: boolean (by default true)
 * - region: null or number (by default null)
 */

export const gameSolutionBoard4 = [
  [
    { queenIndex: null, isQueenPossible: false, region: null },
    { queenIndex: 1, isQueenPossible: true, region: 1 },
    { queenIndex: null, isQueenPossible: false, region: 1 },
    { queenIndex: null, isQueenPossible: false, region: 1 },
  ],
  [
    { queenIndex: null, isQueenPossible: false, region: 3 },
    { queenIndex: null, isQueenPossible: false, region: 1 },
    { queenIndex: null, isQueenPossible: false, region: 1 },
    { queenIndex: 2, isQueenPossible: true, region: 2 },
  ],
  [
    { queenIndex: 3, isQueenPossible: true, region: 3 },
    { queenIndex: null, isQueenPossible: false, region: 3 },
    { queenIndex: null, isQueenPossible: false, region: 4 },
    { queenIndex: null, isQueenPossible: false, region: 2 },
  ],
  [
    { queenIndex: null, isQueenPossible: false, region: 3 },
    { queenIndex: null, isQueenPossible: false, region: 3 },
    { queenIndex: 4, isQueenPossible: true, region: 4 },
    { queenIndex: null, isQueenPossible: false, region: 2 },
  ],
];
