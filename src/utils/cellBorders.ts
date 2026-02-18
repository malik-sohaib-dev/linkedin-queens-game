import type { CSSProperties } from "react";

export type QueensRegionCell = { region?: number | null };

/**
 * Border ownership avoids doubled strokes: top/left only on board rim;
 * each cell draws right & bottom toward neighbors (thin inside region, strong between regions).
 */
export function queensCellBorderStyle(
  grid: QueensRegionCell[][],
  row: number,
  col: number,
  size: number,
): CSSProperties {
  const here = grid[row]?.[col]?.region;

  const sameRegion = (dRow: number, dCol: number): boolean => {
    if (typeof here !== "number") return false;
    const neighbor = grid[row + dRow]?.[col + dCol]?.region;
    return typeof neighbor === "number" && neighbor === here;
  };

  return {
    borderTop: row === 0 ? "var(--board-border-outer)" : "none",
    borderLeft: col === 0 ? "var(--board-border-outer)" : "none",
    borderRight:
      col === size - 1
        ? "var(--board-border-outer)"
        : sameRegion(0, 1)
          ? "var(--board-border-inner)"
          : "var(--board-border-region)",
    borderBottom:
      row === size - 1
        ? "var(--board-border-outer)"
        : sameRegion(1, 0)
          ? "var(--board-border-inner)"
          : "var(--board-border-region)",
  };
}
