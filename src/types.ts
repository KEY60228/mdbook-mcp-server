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
