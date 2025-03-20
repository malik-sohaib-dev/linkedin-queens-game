import { useEffect, useState, useRef } from "react";
import "./App.css";
import "./queens.css";
import Castle from "./components/Castle";
import {
  IBox,
  IGame,
  IGamePatch,
  IHintMesh,
  generateGameSolutionBoard,
  processGameBoard,
} from "./utils";
import { hintGenerator } from "./utils/hintGenerator";

let setTimeoutId: undefined | number = undefined;

function App() {
  const [game, setGame] = useState<IGame[][]>([]);
  const [hintMesh, setHintMesh] = useState<IHintMesh[][]>([]);
  const [hintMessage, setHintMessage] = useState(
    "This is a sample hint message"
  );
  const [solvedGame, setSolvedgame] = useState<IBox[][]>([]);
  const [_toggle, setToggle] = useState(false); // @Todo get rid of this
  const [mouseDown, setMouseDown] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [victory, setVictory] = useState(false);
  const [boardSize, setBoardSize] = useState(5); // Default board size of 5
  const [queenString, setQueenString] = useState("");
  const boardReference = useRef<HTMLDivElement>(null);
  const colors = [
    "skyblue",
    "purple",
    "coral",
    "orange",
    "grey",
    "green",
    "brown",
    "gold",
    "bisque",
    "pink",
  ];

  const boardSizes = [5, 6, 7, 8, 9, 10];

  // Generate new game solution board if boardSize changes
  useEffect(() => {
    const { queenString, solutionBoard } = generateGameSolutionBoard(boardSize);
    setQueenString(queenString);
    setSolvedgame(solutionBoard);

    if (solvedGame.length === boardSize) {
      clearBoard();
    }
  }, [boardSize]);

  // Initialize the game board with regions
  useEffect(() => {
    setVictory(false);
    clearBoard();
  }, [solvedGame]);

  const victoryCelebration = () => {
    if (victory) alert("Victory!!!");
  };

  useEffect(() => {
    if (victory) {
      setTimeoutId = setTimeout(victoryCelebration, 500);
    } else {
      clearTimeout(setTimeoutId);
    }
  }, [victory]);

  // Add event listners on Game Board to have multiselect functionality
  useEffect(() => {
    boardReference.current?.addEventListener("mousedown", () => {
      setMouseDown(true);
    });
    boardReference.current?.addEventListener("mouseup", () => {
      setMouseDown(false);
    });
    boardReference.current?.addEventListener("mouseleave", () => {
      setMouseDown(false);
    });
    return () => {
      boardReference.current?.removeEventListener("mousedown", () => {});
      boardReference.current?.removeEventListener("mouseup", () => {});
    };
  }, []);

  // Unified place to set gameboard
  const handleGameChange = (row: number, col: number, changes: IGamePatch) => {
    const newgameBoard = game;
    newgameBoard[row][col] = { ...newgameBoard[row][col], ...changes };
    const { hasConflicts, queenCount } = processGameBoard(
      newgameBoard,
      boardSize
    );
    setGame(newgameBoard);
    if (!hasConflicts && queenCount === boardSize) {
      setVictory(true);
    } else {
      setVictory(false);
    }
  };

  // Handle Direct Click on a box
  const handleClick = (row: number, col: number) => {
    // @Todo For Some reason, without this the other states aren't rerendering the component
    setToggle((prev) => !prev);
    if (!game[row][col].isBlank && !game[row][col].isQueen) {
      handleGameChange(row, col, { isBlank: true, isQueen: false });
    } else if (!game[row][col].isQueen) {
      handleGameChange(row, col, { isBlank: false, isQueen: true });
    } else {
      handleGameChange(row, col, { isBlank: false, isQueen: false });
    }
  };

  // Handle for multiselect case
  const handleDrag = (row: number, col: number) => {
    if (!mouseDown) return;
    // @Todo For Some reason, without this the other states aren't rerendering the component
    setToggle((prev) => !prev);
    // Incase of multiselect, just manage putting blanks
    if (!game[row][col].isBlank && !game[row][col].isQueen) {
      handleGameChange(row, col, { isBlank: true, isQueen: false });
    }
  };

  // Populate the game board with just the regions
  const clearBoard = () => {
    if (solvedGame.length !== boardSize) return;
    let gameBoard: IGame[][] = [];
    // Process Solution board and make player game board
    for (let i = 0; i < boardSize; i++) {
      gameBoard.push([]);
      for (let j = 0; j < boardSize; j++) {
        const gameObject: IGame = {
          region: solvedGame[i][j].region as number,
          isBlank: false,
          isQueen: false,
          conflict: false,
        };

        gameBoard[i].push(gameObject);
      }

      setGame(gameBoard);
    }
  };

  const recreate = () => {
    const { queenString, solutionBoard } = generateGameSolutionBoard(boardSize);
    setQueenString(queenString);
    setSolvedgame(solutionBoard);
  };

  const setBoardSizeHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {
    let size = Number(e.target.value);
    if (size >= 5) setBoardSize(size);
  };

  const getHint = () => {
    const { hintMesh, hintMessage } = hintGenerator(
      game,
      boardSize,
      queenString
    );
    setHintMesh(hintMesh);
    setHintMessage(hintMessage);
  };

  return (
    <>
      {/* {toggle && <>Yayyy</>} */}
      <select
        defaultValue={boardSize}
        onChange={(e) => {
          setBoardSizeHandler(e);
        }}
      >
        <option>Select the board size</option>
        {boardSizes.map((val, i) => (
          <option key={i} value={val}>
            {val}
          </option>
        ))}
      </select>
      <button onClick={clearBoard}>Restart</button>
      <button onClick={recreate}>New Game</button>
      <button
        onClick={() => {
          setShowSolution((prev) => !prev);
        }}
      >
        Show Solution
      </button>
      <button onClick={getHint}>Hint</button>
      <div
        className="parent"
        style={{
          gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
          gridTemplateRows: `repeat(${boardSize}, 1fr)`,
        }}
        ref={boardReference}
      >
        {game.length > 0 &&
          game.map((row, i) => {
            return row.map((box, j) => {
              return (
                <div
                  onMouseEnter={() => handleDrag(i, j)}
                  onClick={() => handleClick(i, j)}
                  key={j}
                  className="child"
                  style={{
                    backgroundColor:
                      typeof box.region === "number"
                        ? colors[box.region]
                        : "red",
                  }}
                >
                  {box.isQueen ? (
                    <>
                      <Castle size={30} fill={box.conflict ? "red" : "black"} />
                    </>
                  ) : (
                    box.isBlank && (
                      <>
                        <div className="dot" />
                      </>
                    )
                  )}
                </div>
              );
            });
          })}
      </div>
      <div>{hintMessage}</div>
      {showSolution && (
        <div
          className="parent"
          style={{
            gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
            gridTemplateRows: `repeat(${boardSize}, 1fr)`,
          }}
        >
          {solvedGame.length > 0 &&
            solvedGame.map((row) => {
              return row.map((box, i) => {
                return (
                  <div
                    key={i}
                    className="child"
                    style={{
                      backgroundColor:
                        typeof box.region === "number"
                          ? colors[box.region]
                          : "red",
                    }}
                  >
                    {box.isQueenPossible &&
                    typeof box.queenIndex === "number" ? (
                      <>
                        <Castle size={30} fill="black" />
                      </>
                    ) : (
                      <>
                        <div className="dot" />
                      </>
                    )}
                  </div>
                );
              });
            })}
        </div>
      )}
    </>
  );
}

export default App;
