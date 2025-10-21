// Crossword puzzle game built with React + Tailwind
// Converted from the provided TypeScript version into a single JSX file.
// Ready to run in Next.js or Vite React environment.

"use client";

import React, { useState, useEffect, useRef } from "react";
import { Check, RotateCcw, Lightbulb } from "lucide-react";

export default function CrosswordGame() {
  const GRID_SIZE = 25;
  type Cell = { letter: string; isBlack: boolean; row: number; col: number; number?: number };
  const clues = [
    { number: 1, text: "Босоо үг 1", answer: "ДАВХАРБАТАЛГААЖУУЛАЛТ", direction: "down", startRow: 3, startCol: 5 },
    { number: 2, text: "Хэвтээ үг 2", answer: "ЭРСДЭЛИЙНСОЁЛ", direction: "across", startRow: 2, startCol: 11 },
    { number: 3, text: "Хэвтээ үг 3", answer: "АВЛИГА", direction: "across", startRow: 5, startCol: 4 },
    { number: 4, text: "Босоо үг 4", answer: "НЭГДМЭЛБАЙДАЛ", direction: "down", startRow: 5, startCol: 15 },
    { number: 5, text: "Хэвтээ үг 5", answer: "АЯЛЛЫНДААТГАЛ", direction: "across", startRow: 7, startCol: 5 },
    { number: 6, text: "Босоо үг 6", answer: "ЭРСДЭЛИЙНАППЕТИТ", direction: "down", startRow: 7, startCol: 1 },
    { number: 7, text: "Босоо үг 7", answer: "КАРТ", direction: "down", startRow: 6, startCol: 13 },
    { number: 8, text: "Хэвтээ үг 8", answer: "ИНДИКАТОР", direction: "across", startRow: 15, startCol: 0 },
    { number: 9, text: "Босоо үг 9", answer: "ТЕРРОРИЗМ", direction: "down", startRow: 12, startCol: 12 },
    { number: 10, text: "Хэвтээ үг 10", answer: "ТЕЛЕГРАМ", direction: "across", startRow: 13, startCol: 9 },
    { number: 11, text: "Босоо үг 11", answer: "ШИЛЖҮҮЛЭХ", direction: "down", startRow: 1, startCol: 17 },
    { number: 12, text: "Хэвтээ үг 12", answer: "ГУРАВ", direction: "across", startRow: 19, startCol: 4 },
    { number: 13, text: "Хэвтээ үг 13", answer: "ФАТФ", direction: "across", startRow: 16, startCol: 14 },
    { number: 14, text: "Босоо үг 14", answer: "ШҮГЭЛҮЛЭЭХ", direction: "down", startRow: 3, startCol: 8 },
    { number: 15, text: "Хэвтээ үг 15", answer: "ЧАРЖБЭК", direction: "across", startRow: 21, startCol: 4 },
  ];

  const [grid, setGrid] = useState<Cell[][]>([]);
  const [userAnswers, setUserAnswers] = useState<string[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [direction, setDirection] = useState<'across'|'down'>('across');
  const [selectedClue, setSelectedClue] = useState<any | null>(null);
  const [openClue, setOpenClue] = useState<any | null>(null);
  const [theme, setTheme] = useState<'dark'|'light'>('dark');
  const [showErrors, setShowErrors] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const cellRefs = useRef<(HTMLInputElement | null)[][]>([]);

  useEffect(() => {
    initializeGrid();
  }, []);

  const initializeGrid = () => {
  const newGrid = Array(GRID_SIZE).fill(null).map((_, row) => Array(GRID_SIZE).fill(null).map((_, col) => ({ letter: "", isBlack: true, row, col } as Cell)));

    clues.forEach((clue) => {
      const { answer, startRow, startCol, direction, number } = clue;
      for (let i = 0; i < answer.length; i++) {
        const row = direction === "across" ? startRow : startRow + i;
        const col = direction === "across" ? startCol + i : startCol;
        if (row < GRID_SIZE && col < GRID_SIZE) {
          newGrid[row][col].letter = answer[i];
          newGrid[row][col].isBlack = false;
          if (i === 0) newGrid[row][col].number = number;
        }
      }
    });

    setGrid(newGrid);
    setUserAnswers(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill("")));
    cellRefs.current = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
  };

  const handleCellClick = (r: number, c: number) => {
    if (grid[r][c].isBlack) return;
    if (selectedCell && selectedCell.row === r && selectedCell.col === c) setDirection(direction === "across" ? "down" : "across");
    else setSelectedCell({ row: r, col: c });
  };

  // helpers to find next/previous non-black cell in a direction
  const findNextCell = (r: number, c: number, dir: 'across'|'down') : { row: number; col: number } | null => {
    if (dir === "across") {
      let nc = c + 1
      while (nc < GRID_SIZE && grid[r][nc].isBlack) nc++
      return nc < GRID_SIZE ? { row: r, col: nc } : null
    } else {
      let nr = r + 1
      while (nr < GRID_SIZE && grid[nr][c].isBlack) nr++
      return nr < GRID_SIZE ? { row: nr, col: c } : null
    }
  }

  const findPrevCell = (r: number, c: number, dir: 'across'|'down') : { row: number; col: number } | null => {
    if (dir === "across") {
      let nc = c - 1
      while (nc >= 0 && grid[r][nc].isBlack) nc--
      return nc >= 0 ? { row: r, col: nc } : null
    } else {
      let nr = r - 1
      while (nr >= 0 && grid[nr][c].isBlack) nr--
      return nr >= 0 ? { row: nr, col: c } : null
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, r: number, c: number) => {
    const key = (e as any).key
    if (key === "Backspace") {
      e.preventDefault()
      updateAnswer(r, c, "")
      // move to previous in current direction
      const prev = findPrevCell(r, c, direction)
      if (prev) {
        setSelectedCell({ row: prev.row, col: prev.col })
        cellRefs.current[prev.row][prev.col]?.focus()
      }
    } else if (key === "ArrowRight") {
      e.preventDefault()
      setDirection("across")
      const next = findNextCell(r, c, "across")
      if (next) {
        setSelectedCell({ row: next.row, col: next.col })
        cellRefs.current[next.row][next.col]?.focus()
      }
    } else if (key === "ArrowLeft") {
      e.preventDefault()
      setDirection("across")
      const prev = findPrevCell(r, c, "across")
      if (prev) {
        setSelectedCell({ row: prev.row, col: prev.col })
        cellRefs.current[prev.row][prev.col]?.focus()
      }
    } else if (key === "ArrowDown") {
      e.preventDefault()
      setDirection("down")
      const next = findNextCell(r, c, "down")
      if (next) {
        setSelectedCell({ row: next.row, col: next.col })
        cellRefs.current[next.row][next.col]?.focus()
      }
    } else if (key === "ArrowUp") {
      e.preventDefault()
      setDirection("down")
      const prev = findPrevCell(r, c, "down")
      if (prev) {
        setSelectedCell({ row: prev.row, col: prev.col })
        cellRefs.current[prev.row][prev.col]?.focus()
      }
    } else if (/^[A-Za-zА-Яа-яЁёҮүӨө]$/.test(key)) {
      e.preventDefault()
      updateAnswer(r, c, key.toUpperCase())
      // after typing, advance in the current direction
      const next = findNextCell(r, c, direction)
      if (next) {
        setSelectedCell({ row: next.row, col: next.col })
        cellRefs.current[next.row][next.col]?.focus()
      }
    }
  }

  const updateAnswer = (r: number, c: number, val: string) => {
    const copy = userAnswers.map(row => [...row]);
    copy[r][c] = val;
    setUserAnswers(copy);
  };

  const moveCursor = (r: number, c: number, delta: number) => {
    if (!selectedClue) return;
    const { startRow, startCol, answer, direction } = selectedClue;
    let index = direction === "across" ? c - startCol : r - startRow;
    index += delta;
    if (index < 0 || index >= answer.length) return;
    const nextRow = direction === "across" ? startRow : startRow + index;
    const nextCol = direction === "across" ? startCol + index : startCol;
    setSelectedCell({ row: nextRow, col: nextCol });
    cellRefs.current[nextRow][nextCol]?.focus();
  };

  const checkAnswers = () => {
    setShowErrors(true);
    computeScore();
  };
  const resetPuzzle = () => initializeGrid();
  const revealAnswer = () => {
    if (!selectedClue) return;
    const copy = userAnswers.map(row => [...row]);
    const { answer, startRow, startCol, direction } = selectedClue;
    for (let i = 0; i < answer.length; i++) {
      const row = direction === "across" ? startRow : startRow + i;
      const col = direction === "across" ? startCol + i : startCol;
      copy[row][col] = answer[i];
    }
    setUserAnswers(copy);
    // update score when revealing
    setTimeout(() => computeScore(), 0);
  };

  const getCellStatus = (r: number, c: number): string => {
    if (!showErrors) return "";
    const expected = (grid[r] && grid[r][c] && grid[r][c].letter) || "";
    const actual = ((userAnswers[r] && userAnswers[r][c]) || "").toString();
    if (actual && actual.toUpperCase() === expected.toUpperCase()) return "bg-green-700 text-white";
    if (actual && actual.toUpperCase() !== expected.toUpperCase()) return "bg-red-700 text-white";
    return "";
  };

  const computeScore = () => {
    let correctCount = 0
    for (const clue of clues) {
      const { answer, startRow, startCol, direction } = clue
      let formed = ""
      for (let i = 0; i < answer.length; i++) {
        const rr = direction === "across" ? startRow : startRow + i
        const cc = direction === "across" ? startCol + i : startCol
        const val = (userAnswers[rr] && userAnswers[rr][cc]) || ""
        formed += val
      }
      if (formed === answer) correctCount++
    }
    const pts = correctCount * 2
    setScore(pts)
    return pts
  }

  const across = clues.filter(c => c.direction === "across");
  const down = clues.filter(c => c.direction === "down");

  return (
    <div className="min-h-screen bg-[#050915] text-gray-200">
      {/* Header */}
  <header className="max-w-8xl mx-auto px-6 py-6 flex items-center justify-between border-b border-gray-800">
  <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-md bg-gradient-to-br from-[#071018] to-[#0b2230] flex items-center justify-center border border-gray-800">
            <div style={{ width: 36, height: 36, background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))', borderRadius: 6 }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'oklch(0.52 0.23 21.3)' }}>Үгийн сүлжээ</h1>
            <p className="text-sm text-gray-400">Нүд дээр дарж, сумны товч ашиглан чиглэлийг солино уу</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-400">Оноо</div>
            <div className="px-4 py-2 rounded-full font-bold" style={{ background: 'linear-gradient(90deg,#ff6767,#ff2d55)', color: 'white' }}>{score}</div>
          </div>
          <div>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="px-3 py-1 rounded border border-gray-700 bg-transparent hover:bg-gray-800 text-sm"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </div>
        </div>
      </header>

      <main className={`${theme === 'dark' ? 'theme-dark' : 'theme-light'} max-w-8xl mx-auto px-4 py-8 grid lg:grid-cols-[1fr_420px] gap-8 min-h-[calc(100vh-6rem)]`}>
        <div className="p-6 rounded-xl shadow-[inset_0_2px_12px_rgba(0,0,0,0.6)] border border-gray-800 h-[calc(100vh-6rem)]" style={{ background: theme === 'dark' ? 'linear-gradient(180deg,#071018,#04101a)' : 'linear-gradient(180deg,#ffffff,#f3f4f6)' }}>
          <div className="flex gap-4 items-start">
            {/* Down panel (moved beside grid) */}
            <div className="w-64 p-4 bg-gradient-to-b from-[#06121a] to-[#041018] rounded-md border border-gray-800 shadow-sm h-full">
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'oklch(0.52 0.23 21.3)' }}>Босоо</h3>
              <div className="pt-1 h-full">
                <div className="flex flex-col gap-2 h-full">
                  {down.map((c) => (
                    <button
                      key={c.number}
                      onClick={() => setOpenClue(c)}
                      className={`w-12 h-12 rounded flex items-center justify-center border border-gray-700 text-sm font-medium ${selectedClue && selectedClue.number === c.number ? (theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200') : 'bg-transparent hover:bg-gray-900'}`}
                    >
                      {c.number}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto h-full">
              {/* Column headers + grid with row labels */}
              <div className="inline-block rounded-lg border border-gray-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] bg-[#071018] p-1">
              {/* Column headers */}
              <div className="flex">
                <div style={{ width: 30, height: 30 }} className="border-r border-b border-gray-700" />
                <div className="flex">
                  {Array.from({ length: GRID_SIZE }).map((_, ci) => (
                    <div key={`ch-${ci}`} style={{ width: 30, height: 30, color: 'oklch(0.52 0.23 21.3)' }} className="flex items-center justify-center text-[11px] border border-gray-800">{ci + 1}</div>
                  ))}
                </div>
              </div>

              {/* Rows */}
              <div>
                {grid.map((row, r) => (
                  <div key={`row-${r}`} className="flex">
                    <div style={{ width: 30, height: 30, color: 'oklch(0.52 0.23 21.3)' }} className="flex items-center justify-center text-[11px] border border-gray-800">{r + 1}</div>
                    <div className="flex">
                      {row.map((cell, c) => (
                        <div key={`${r}-${c}`} style={{ width: 30, height: 30 }} className={`relative border border-gray-800 ${cell.isBlack ? 'bg-gray-900' : 'bg-white'}`}>
                          {cell.isBlack ? (
                            <div className="w-full h-full bg-gray-900" />
                          ) : (
                            <>
                              {cell.number && (
                                <span style={{ color: 'oklch(0.52 0.23 21.3)' }} className="absolute text-[10px] top-[2px] left-[1px] font-semibold">{cell.number}</span>
                              )}
                              <input
                                ref={(el) => { if (!cellRefs.current[r]) cellRefs.current[r] = []; cellRefs.current[r][c] = el; }}
                                maxLength={1}
                                value={(userAnswers[r] && userAnswers[r][c]) || ""}
                                onChange={(ev) => {
                                  const val = (ev.target.value || "").slice(0, 1)
                                  updateAnswer(r, c, val)
                                }}
                                onKeyDown={(e) => handleKeyDown(e, r, c)}
                                onClick={() => handleCellClick(r, c)}
                                spellCheck={false}
                                autoCorrect="off"
                                autoCapitalize="off"
                                autoComplete="off"
                                className={`w-full h-full text-center font-semibold outline-none bg-transparent ${getCellStatus(r, c)} focus:bg-red-900/60`}
                                style={{ color: 'oklch(0.52 0.23 21.3)' }}
                              />
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

            <div className="flex gap-2 justify-center mt-4">
            <button onClick={checkAnswers} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded flex items-center gap-2"><Check className="w-4 h-4" />Шалгах</button>
            {/* reveal and reset buttons removed per request */}
          </div>
  </div>
  </div>
  <aside className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gradient-to-b from-[#06121a] to-[#041018] rounded-md border border-gray-800 shadow-sm h-[calc(100vh-6rem)]">
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'oklch(0.52 0.23 21.3)' }}>Хэвтээ</h3>
              <div className="pt-1 h-full">
                <div className="flex flex-col gap-2 h-full">
                  {across.map((c) => (
                    <button
                      key={c.number}
                      onClick={() => setOpenClue(c)}
                      className={`w-12 h-12 rounded flex items-center justify-center border border-gray-700 text-sm font-medium ${selectedClue && selectedClue.number === c.number ? (theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200') : 'bg-transparent hover:bg-gray-900'}`}
                    >
                      {c.number}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>
        {/* Clue modal */}
        {openClue && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={() => setOpenClue(null)} />
            <div className="relative z-60 w-[min(640px,90%)] bg-[#06121a] border border-gray-800 rounded-lg p-6 shadow-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold" style={{ color: 'oklch(0.52 0.23 21.3)' }}>{openClue.number}. {openClue.direction === 'across' ? 'Хэвтээ' : 'Босоо'}</h3>
                  <p className="text-sm text-gray-300 mt-1">{openClue.text}</p>
                </div>
                <button className="text-gray-400 hover:text-white" onClick={() => setOpenClue(null)}>✕</button>
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setSelectedClue(openClue)
                    setDirection(openClue.direction as 'across'|'down')
                    setSelectedCell({ row: openClue.startRow, col: openClue.startCol })
                    cellRefs.current[openClue.startRow]?.[openClue.startCol]?.focus()
                    setOpenClue(null)
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                >Go</button>
                <button onClick={() => setOpenClue(null)} className="px-4 py-2 bg-gray-700 text-white rounded">Close</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
