export type Difficulty = {
  /** Stable storage key, also used to store best scores per level. */
  key: string;
  label: string;
  cols: number;
  rows: number;
  pairs: number;
};

const level = (key: string, label: string, cols: number, rows: number) => ({
  key,
  label,
  cols,
  rows,
  pairs: (cols * rows) / 2,
});

export const DIFFICULTIES: Difficulty[] = [
  level("3x4", "Easy", 3, 4),
  level("4x4", "Medium", 4, 4),
  level("4x5", "Hard", 4, 5),
  level("6x6", "Expert", 6, 6),
];

export const DEFAULT_DIFFICULTY = DIFFICULTIES[1];

export function findDifficulty(key?: string | null): Difficulty {
  return DIFFICULTIES.find((d) => d.key === key) ?? DEFAULT_DIFFICULTY;
}
