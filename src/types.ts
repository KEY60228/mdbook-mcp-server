// エラー型
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// 設定型
export interface MdbookServerConfig {
  rootPath: string;
  serverName?: string;
}

// MCPツールのレスポンス型
export interface ListStructureResponse {
  title: string;
  authors: string[];
  language: string;
  src: string;
  chapters: Chapter[];
}

export interface Chapter {
  title: string;
  path: string | null;
  level: number;
  children?: Chapter[];
}

export interface ReadContentResponse {
  path: string;
  content: string;
  metadata: {
    size: number;
    lastModified: string;
  };
}

// 検索関連の型定義
export interface SearchContentRequest {
  /** 検索クエリ */
  query: string;

  /** 最大結果件数（オプション、デフォルト: 10） */
  maxResults?: number;
}

export interface SearchContentResponse {
  /** 検索クエリ */
  query: string;

  /** 総マッチ件数 */
  totalMatches: number;

  /** 検索結果 */
  results: Array<{
    /** ファイルの相対パス */
    path: string;

    /** 章のタイトル */
    title: string;

    /** fuse.js のスコア（0に近いほど関連性が高い） */
    score: number;

    /** マッチ数 */
    matchCount: number;

    /** マッチしたスニペット */
    matches: Array<{
      snippet: string;
      position: number;
    }>;
  }>;
}
