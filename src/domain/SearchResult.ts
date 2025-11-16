export interface SearchMatch {
  /** Matched snippet */
  snippet: string;

  /** Match position (0-based character index) */
  position: number;
}

export interface SearchResult {
  /** Relative file path (from src/) */
  path: string;

  /** Chapter title (from SUMMARY.md) */
  title: string;

  /** fuse.js score (closer to 0 = higher relevance) */
  score: number;

  /** Match count */
  matchCount: number;

  /** Matched snippets (max 3) */
  matches: SearchMatch[];
}
