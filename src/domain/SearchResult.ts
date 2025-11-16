export interface SearchMatch {
  /** マッチした箇所のスニペット */
  snippet: string;

  /** マッチ位置（0始まりの文字インデックス） */
  position: number;
}

export interface SearchResult {
  /** ファイルの相対パス（src/からの相対） */
  path: string;

  /** 章のタイトル（SUMMARY.mdから取得） */
  title: string;

  /** fuse.js のスコア（0に近いほど関連性が高い） */
  score: number;

  /** マッチ数 */
  matchCount: number;

  /** マッチしたスニペット（最大3件） */
  matches: SearchMatch[];
}
