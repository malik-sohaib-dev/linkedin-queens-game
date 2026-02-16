import { useEffect, useState, useRef, useCallback } from "react";
import type { CSSProperties } from "react";
import "./App.css";
import "./queens.css";
import Castle from "./components/Castle";
import { Confetti } from "./components/Confetti";
import {
  IBox,
  IGame,
  IGamePatch,
  generateGameSolutionBoard,
  processGameBoard,
} from "./utils";

function App() {
  const [game, setGame] = useState<IGame[][]>([]);
  const [solvedGame, setSolvedgame] = useState<IBox[][]>([]);
  const [, setToggle] = useState(false); // @Todo get rid of this
  const [mouseDown, setMouseDown] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [victory, setVictory] = useState(false);
  const [boardSize, setBoardSize] = useState(5); // Default board size of 5
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [confettiBurst, setConfettiBurst] = useState(0);
  const tutorialCloseRef = useRef<HTMLButtonElement>(null);
  const celebrationCloseRef = useRef<HTMLButtonElement>(null);
  const boardReference = useRef<HTMLDivElement>(null);
  const meshBgRef = useRef<HTMLDivElement>(null);
  const boardSizeRef = useRef(boardSize);
  boardSizeRef.current = boardSize;
  const boardGenIdRef = useRef(0);
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
  const castleSize = 28;

  const runBoardGeneration = useCallback(() => {
    const myId = ++boardGenIdRef.current;
    setIsGenerating(true);
    const size = boardSizeRef.current;
    requestAnimationFrame(() => {
      window.setTimeout(() => {
        try {
          if (myId !== boardGenIdRef.current) return;
          const { solutionBoard } = generateGameSolutionBoard(size);
          if (myId !== boardGenIdRef.current) return;
          setSolvedgame(solutionBoard);
        } finally {
          if (myId === boardGenIdRef.current) {
            setIsGenerating(false);
          }
        }
      }, 0);
    });
  }, []);

  // Generate new game solution board if boardSize changes
  useEffect(() => {
    runBoardGeneration();
  }, [boardSize, runBoardGeneration]);

  // Background mesh: subtle parallax opposite pointer (respect reduced motion)
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

    const maxShift = 22;
    const lerp = 0.14;
    const settle = 0.02;
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let rafId = 0;

    const apply = () => {
      const el = meshBgRef.current;
      if (el) {
        el.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
      }
    };

    const tick = () => {
      const dx = target.x - current.x;
      const dy = target.y - current.y;
      if (Math.abs(dx) < settle && Math.abs(dy) < settle) {
        current.x = target.x;
        current.y = target.y;
        apply();
        rafId = 0;
        return;
      }
      current.x += dx * lerp;
      current.y += dy * lerp;
      apply();
      rafId = window.requestAnimationFrame(tick);
    };

    const ensureLoop = () => {
      if (rafId === 0) rafId = window.requestAnimationFrame(tick);
    };

    const onPointerMove = (e: PointerEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      const nx = (e.clientX / w - 0.5) * 2;
      const ny = (e.clientY / h - 0.5) * 2;
      target.x = -nx * maxShift;
      target.y = -ny * maxShift;
      ensureLoop();
    };

    const onPointerLeaveDoc = () => {
      target.x = 0;
      target.y = 0;
      ensureLoop();
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeaveDoc);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeaveDoc);
      if (rafId !== 0) window.cancelAnimationFrame(rafId);
    };
  }, []);

  // Initialize the game board with regions
  useEffect(() => {
    setVictory(false);
    clearBoard();
  }, [solvedGame]);

  useEffect(() => {
    if (!victory) {
      setCelebrationOpen(false);
      return;
    }
    const showId = window.setTimeout(() => setCelebrationOpen(true), 480);
    return () => clearTimeout(showId);
  }, [victory]);

  useEffect(() => {
    if (!victory) {
      setConfettiActive(false);
      return;
    }
    setConfettiBurst((k) => k + 1);
    setConfettiActive(true);
    const t = window.setTimeout(() => setConfettiActive(false), 7500);
    return () => clearTimeout(t);
  }, [victory]);

  useEffect(() => {
    if (!tutorialOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTutorialOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    const id = window.requestAnimationFrame(() => {
      tutorialCloseRef.current?.focus();
    });
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.cancelAnimationFrame(id);
    };
  }, [tutorialOpen]);

  useEffect(() => {
    if (!celebrationOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCelebrationOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    const id = window.requestAnimationFrame(() => {
      celebrationCloseRef.current?.focus();
    });
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.cancelAnimationFrame(id);
    };
  }, [celebrationOpen]);

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
    if (isGenerating) return;
    runBoardGeneration();
  };

  const setBoardSizeHandler = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (isGenerating) return;
    const size = Number(e.target.value);
    if (size >= 5) setBoardSize(size);
  };

  const dismissCelebration = () => setCelebrationOpen(false);

  const celebrateNewPuzzle = () => {
    dismissCelebration();
    runBoardGeneration();
  };

  return (
    <>
      <div className="queens-mesh-bg" ref={meshBgRef} aria-hidden="true" />
      <div className="queens-app">
      <Confetti active={confettiActive} burstKey={confettiBurst} />
      <div className="visually-hidden" aria-live="polite" aria-atomic="true">
        {victory ? "Puzzle solved." : ""}
      </div>
      <header className="queens-header">
        <div className="queens-brand">
          <h1 className="queens-title">Queens</h1>
        </div>
        <div className="queens-toolbar">
          <label className="visually-hidden" htmlFor="queens-board-size">
            Board size
          </label>
          <select
            id="queens-board-size"
            className="queens-select"
            value={boardSize}
            disabled={isGenerating}
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
          <button
            type="button"
            className="queens-btn"
            disabled={isGenerating}
            onClick={clearBoard}
          >
            Restart
          </button>
          <button
            type="button"
            className="queens-btn"
            disabled={isGenerating}
            onClick={recreate}
          >
            {isGenerating ? "Generating…" : "New puzzle"}
          </button>
          <button
            type="button"
            className="queens-btn"
            disabled={isGenerating}
            onClick={() => {
              setShowSolution((prev) => !prev);
            }}
          >
            {showSolution ? "Hide solution" : "Solution"}
          </button>
          <button
            type="button"
            className="queens-btn"
            onClick={() => setTutorialOpen(true)}
          >
            How to play
          </button>
        </div>
      </header>

      <main className="queens-main" aria-busy={isGenerating}>
        <div
          className={
            "queens-boards-row" +
            (showSolution ? " queens-boards-row--solution-visible" : "")
          }
        >
          <div className="queens-board-cell queens-board-cell--play">
            <div
              className={
                "queens-board-wrap" +
                (isGenerating ? " queens-board-wrap--generating" : "")
              }
            >
              <div
                className={"parent" + (isGenerating ? " parent--generating" : "")}
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
                            "child" +
                            (box.conflict ? " child--conflict" : "")
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
                              size={castleSize}
                              fill={
                                box.conflict
                                  ? queenConflictFill
                                  : queenFill
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
              {isGenerating ? (
                <div
                  className="queens-board-loader"
                  role="status"
                  aria-live="polite"
                  aria-busy="true"
                >
                  <div className="queens-board-loader__card">
                    <div className="queens-board-loader__emblem" aria-hidden="true">
                      <span className="queens-board-loader__orbit queens-board-loader__orbit--outer" />
                      <span className="queens-board-loader__orbit queens-board-loader__orbit--inner" />
                      <Castle size={34} fill={queenFill} />
                    </div>
                    <p className="queens-board-loader__title">
                      Crafting a new puzzle
                    </p>
                    <p className="queens-board-loader__hint">
                      Shuffling regions and crown placements
                    </p>
                    <div className="queens-board-loader__mini-grid" aria-hidden="true">
                      {Array.from({ length: 9 }, (_, i) => (
                        <span key={i} className="queens-board-loader__mini-cell" />
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div
            className="queens-board-cell queens-board-solution-cell"
            aria-hidden={!showSolution}
            inert={!showSolution ? true : undefined}
          >
            <div
              className="queens-solution-inner"
              role="region"
              aria-label="Solution reference"
            >
              <div className="queens-reference-frame">
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
                              <Castle size={castleSize} fill={queenFill} />
                            ) : (
                              <div className="dot" />
                            )}
                          </div>
                        );
                      });
                    })}
                </div>
              </div>
              <p className="queens-reference-hint" aria-hidden="true">
                Answer key
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="queens-footer">
        <p className="queens-footer__credit">
          <span className="queens-footer__name">Malik Sohaib Ahmad</span>
          <span className="queens-footer__role">Full Stack &amp; AI Engineer</span>
        </p>
        <nav
          className="queens-footer__nav"
          aria-label="Project and author links"
        >
          <a
            className="queens-footer__link"
            href="https://github.com/malik-sohaib-dev/linkedin-queens-game"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Source code on GitHub (opens in new tab)"
          >
            GitHub
          </a>
          <span className="queens-footer__sep" aria-hidden="true">
            ·
          </span>
          <a
            className="queens-footer__link"
            href="https://www.linkedin.com/in/malik-sohaib/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Malik Sohaib Ahmad on LinkedIn (opens in new tab)"
          >
            LinkedIn
          </a>
          <span className="queens-footer__sep" aria-hidden="true">
            ·
          </span>
          <a
            className="queens-footer__link"
            href="https://malik-sohaib.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Portfolio website (opens in new tab)"
          >
            Portfolio
          </a>
        </nav>
      </footer>

      {tutorialOpen ? (
        <div
          className="queens-modal-root"
          role="presentation"
          onClick={() => setTutorialOpen(false)}
        >
          <div
            className="queens-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tutorial-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="queens-modal-header">
              <h2 id="tutorial-title" className="queens-modal-title">
                How to play
              </h2>
              <button
                ref={tutorialCloseRef}
                type="button"
                className="queens-modal-close"
                onClick={() => setTutorialOpen(false)}
                aria-label="Close tutorial"
              >
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <div className="queens-modal-body">
              <p className="queens-modal-lead">
                Place exactly one queen in every row and column. Each colored
                region must also contain exactly one queen.
              </p>
              <ul className="queens-modal-list">
                <li>
                  <strong>No attacks.</strong> Queens cannot share a row or
                  column (like classic queens).
                </li>
                <li>
                  <strong>No touching.</strong> Queens cannot sit on adjacent
                  squares, including diagonally.
                </li>
                <li>
                  <strong>Regions.</strong> The tinted areas are regions—use
                  each color once per queen.
                </li>
              </ul>
              <p className="queens-modal-note">
                Tap a cell to cycle: empty → marker (dot) → queen. Drag with
                the pointer held down to paint markers. Use{" "}
                <em>Restart</em> to clear your moves or <em>New puzzle</em>{" "}
                for a different layout at the same size.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {celebrationOpen ? (
        <div
          className="queens-celebration-root"
          role="presentation"
          onClick={dismissCelebration}
        >
          <div
            className="queens-celebration-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="celebration-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="queens-celebration-sparkles" aria-hidden="true">
              {Array.from({ length: 10 }, (_, i) => (
                <span
                  key={i}
                  className="queens-celebration-sparkle"
                  style={{ "--sparkle-i": i } as CSSProperties}
                />
              ))}
            </div>
            <button
              ref={celebrationCloseRef}
              type="button"
              className="queens-celebration-dismiss"
              onClick={dismissCelebration}
              aria-label="Close celebration"
            >
              <span aria-hidden="true">×</span>
            </button>
            <div className="queens-celebration-icon" aria-hidden="true">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="1.5" />
                <path
                  d="M14 24.5l7 7 13-14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 id="celebration-title" className="queens-celebration-title">
              Perfectly placed
            </h2>
            <p className="queens-celebration-text">
              Every row, column, and region holds exactly one queen—with no two
              touching. A quiet kind of triumph.
            </p>
            <div className="queens-celebration-actions">
              <button
                type="button"
                className="queens-btn queens-celebration-primary"
                disabled={isGenerating}
                onClick={celebrateNewPuzzle}
              >
                {isGenerating ? "Generating…" : "New puzzle"}
              </button>
              <button
                type="button"
                className="queens-btn"
                onClick={dismissCelebration}
              >
                Admire the board
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
    </>
  );
}

export default App;
