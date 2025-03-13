import "./App.css";
import "./queens.css";
// import { gameSolutionBoard4 } from "./structure";
import { generategameBoard } from "./boardGenerator";
const boardSize = 6;

function App() {
  const board = generategameBoard(boardSize);
  const colors = [
    "skyblue",
    "purple",
    "coral",
    "orange",
    "grey",
    "green",
    "pink",
    "brown",
    "gold",
    "bisque",
  ];
  return (
    <div
      className="parent"
      style={{
        gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
        gridTemplateRows: `repeat(${boardSize}, 1fr)`,
      }}
    >
      {board.map((row) => {
        return row.map((box, i) => {
          return (
            <div
              key={i}
              className="child"
              style={{
                backgroundColor:
                  typeof box.region === "number" ? colors[box.region] : "red",
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
  );
}

export default App;
