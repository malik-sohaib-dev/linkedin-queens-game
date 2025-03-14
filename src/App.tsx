import { useEffect, useState } from "react";
import "./App.css";
import "./queens.css";
// import { gameSolutionBoard4 } from "./structure";
import { generategameBoard, IBox } from "./utils/boardGenerator";
const boardSize = 7;

interface IGame {
  region: number;
  isBlank: boolean;
  isQueen: boolean;
}

function App() {
  const [game, setGame] = useState<IGame[][]>([]);
  const [solvedGame, setSolvedgame] = useState<IBox[][]>([]);
  const [toggle, setToggle] = useState(false);
  useEffect(() => {
    const solvedGameBoard = generategameBoard(boardSize);
    setSolvedgame(solvedGameBoard);

    if (solvedGameBoard.length > 0) {
      clearBoard();
    }
  }, [boardSize]);

  useEffect(() => {
    clearBoard();
  }, [solvedGame]);
  console.log("solvedGame", solvedGame);
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

  const handleClick = (row: number, col: number) => {
    console.log(row, col);
    // @Todo For Some reason, without this the other states aren't rerendering the component
    setToggle((prev) => !prev);
    if (!game[row][col].isBlank && !game[row][col].isQueen) {
      setGame((prev) => {
        prev[row][col] = { ...prev[row][col], isBlank: true, isQueen: false };
        return prev;
      });
    } else if (!game[row][col].isQueen) {
      setGame((prev) => {
        prev[row][col] = { ...prev[row][col], isBlank: false, isQueen: true };
        return prev;
      });
    } else {
      setGame((prev) => {
        prev[row][col] = { ...prev[row][col], isBlank: false, isQueen: false };
        return prev;
      });
    }
  };

  const clearBoard = () => {
    if (solvedGame.length == 0) return;
    let gameBoard: IGame[][] = [];
    // Process Solution board and make player game board
    for (let i = 0; i < boardSize; i++) {
      gameBoard.push([]);
      for (let j = 0; j < boardSize; j++) {
        const gameObject: IGame = {
          region:
            typeof solvedGame[i][j].region === "number"
              ? solvedGame[i][j].region
              : 99,
          isBlank: false,
          isQueen: false,
        };
        // console.log(i, gameBoard);
        gameBoard[i].push(gameObject);
      }

      setGame(gameBoard);
    }
  };

  const recreate = () => {
    const solvedGameBoard = generategameBoard(boardSize);
    setSolvedgame(solvedGameBoard);
  };

  console.log("game", game);
  return (
    <>
      {/* {toggle && <>Yayyy</>} */}
      <button onClick={clearBoard}>Restart</button>
      <button onClick={recreate}>Reshuffle</button>
      <div
        className="parent"
        style={{
          gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
          gridTemplateRows: `repeat(${boardSize}, 1fr)`,
        }}
      >
        {game.length > 0 &&
          game.map((row, i) => {
            return row.map((box, j) => {
              return (
                <div
                  onClick={() => handleClick(i, j)}
                  // onMouseEnter={() => handleClick(i, j)}
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
                      <img className="queen" src="./queen.png" />
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
                  {box.isQueenPossible && typeof box.queenIndex === "number" ? (
                    <>
                      <img className="queen" src="./queen.png" />
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
    </>
  );
}

export default App;
