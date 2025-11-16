// Error type
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

// Configuration type
export interface MdbookServerConfig {
  rootPath: string;
  serverName?: string;
}

// MCP tool response type
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

// Search-related type definitions
export interface SearchContentRequest {
  /** Search query */
  query: string;

  /** Maximum number of results (optional, default: 10) */
  maxResults?: number;
}

export interface SearchContentResponse {
  /** Search query */
  query: string;

  /** Total number of matches */
  totalMatches: number;

  /** Search results */
  results: Array<{
    /** Relative file path */
    path: string;

    /** Chapter title */
    title: string;

    /** fuse.js score (closer to 0 = higher relevance) */
    score: number;

    /** Match count */
    matchCount: number;

    /** Matched snippets */
    matches: Array<{
      snippet: string;
      position: number;
    }>;
  }>;
}
