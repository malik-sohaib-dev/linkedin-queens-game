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
  const [, setHintMesh] = useState<IHintMesh[][]>([]);
  const [hintMessage, setHintMessage] = useState(
    ""
  );
  const [solvedGame, setSolvedgame] = useState<IBox[][]>([]);
  const [, setToggle] = useState(false); // @Todo get rid of this
  const [mouseDown, setMouseDown] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [victory, setVictory] = useState(false);
  const [boardSize, setBoardSize] = useState(5); // Default board size of 5
  const [queenString, setQueenString] = useState("");
  const boardReference = useRef<HTMLDivElement>(null);
  /* Muted gallery palette: distinct regions, minimal saturation */
  const colors = [
    "#e8e4dd",
    "#dde6df",
    "#e6dfe8",
    "#dfe7ee",
    "#ebe4d6",
    "#d2dfd8",
    "#ebe0e4",
    "#d6e0e6",
    "#e6e6d9",
    "#cfd8e0",
  ];
  const queenFill = "#1a1714";
  const queenConflictFill = "#9b3d38";

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
    const gameBoard: IGame[][] = [];
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
    const size = Number(e.target.value);
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
    <div className="queens-app">
      <header className="queens-header">
        <div className="queens-brand">
          <h1 className="queens-title">Queens</h1>
          <p className="queens-tagline">
            One queen per row, column, and region—with no two queens touching.
          </p>
        </div>
        <div className="queens-toolbar">
          <label className="visually-hidden" htmlFor="queens-board-size">
            Board size
          </label>
          <select
            id="queens-board-size"
            className="queens-select"
            defaultValue={boardSize}
            onChange={(e) => {
              setBoardSizeHandler(e);
            }}
          >
            <option disabled value="">
              Grid size
            </option>
            {boardSizes.map((val, i) => (
              <option key={i} value={val}>
                {val} × {val}
              </option>
            ))}
          </select>
          <button type="button" className="queens-btn" onClick={clearBoard}>
            Restart
          </button>
          <button type="button" className="queens-btn" onClick={recreate}>
            New puzzle
          </button>
          <button
            type="button"
            className="queens-btn"
            onClick={() => {
              setShowSolution((prev) => !prev);
            }}
          >
            {showSolution ? "Hide solution" : "Solution"}
          </button>
          <button type="button" className="queens-btn" onClick={getHint}>
            Hint
          </button>
        </div>
      </header>

      <main className="queens-main">
        <div className="queens-board-wrap">
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
                      className={
                        "child" + (box.conflict ? " child--conflict" : "")
                      }
                      style={{
                        backgroundColor:
                          typeof box.region === "number"
                            ? colors[box.region] ?? "#e8e4dd"
                            : "#c45c4a",
                      }}
                    >
                      {box.isQueen ? (
                        <Castle
                          size={28}
                          fill={
                            box.conflict ? queenConflictFill : queenFill
                          }
                        />
                      ) : (
                        box.isBlank && <div className="dot" />
                      )}
                    </div>
                  );
                });
              })}
          </div>
        </div>

        {hintMessage ? (
          <p className="queens-hint">{hintMessage}</p>
        ) : null}

        {showSolution && (
          <div className="queens-solution-block">
            <span className="queens-solution-label">Reference</span>
            <div
              className="parent parent--static"
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
                              ? colors[box.region] ?? "#e8e4dd"
                              : "#c45c4a",
                        }}
                      >
                        {box.isQueenPossible &&
                        typeof box.queenIndex === "number" ? (
                          <Castle size={28} fill={queenFill} />
                        ) : (
                          <div className="dot" />
                        )}
                      </div>
                    );
                  });
                })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
