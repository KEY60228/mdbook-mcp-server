import Fuse, { FuseResult, FuseResultMatch } from 'fuse.js';
import { MdbookProject } from '../domain/MdbookProject.js';
import { SearchResult, SearchMatch } from '../domain/SearchResult.js';
import { Chapter } from '../domain/Chapter.js';
import { FileSystemAdapter } from '../adapters/FileSystemAdapter.js';
import { MdbookStructureService } from './MdbookStructureService.js';
import { validatePath } from '../utils/pathUtils.js';

export interface SearchOptions {
  /** 検索クエリ */
  query: string;

  /** 最大結果件数（デフォルト: 10） */
  maxResults?: number;

  /** スニペット前後の文字数（デフォルト: 50） */
  contextLength?: number;
}

interface SearchDocument {
  path: string;
  title: string;
  content: string;
}

export class MdbookSearchService {
  constructor(
    private fs: FileSystemAdapter,
    private structureService: MdbookStructureService
  ) {}

  /**
   * mdbookプロジェクト内を検索
   */
  async search(
    project: MdbookProject,
    options: SearchOptions
  ): Promise<SearchResult[]> {
    const { query, maxResults = 10, contextLength = 50 } = options;

    // ステップ1: クエリのバリデーション
    this.validateQuery(query);

    // ステップ2: 章リストの取得
    const structure = await this.structureService.getStructure(project);
    const chapterPaths = this.collectChapterPaths(structure.chapters);

    // ステップ3: 検索ドキュメントの構築
    const documents = await this.buildSearchDocuments(project, chapterPaths);

    if (documents.length === 0) {
      return [];
    }

    // ステップ4: fuse.js による検索
    const fuse = new Fuse(documents, {
      keys: ['content'],
      includeScore: true,
      includeMatches: true,
      threshold: 0.3,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });

    const fuseResults = fuse.search(query);

    // ステップ5: 結果の変換
    const searchResults: SearchResult[] = fuseResults.map((result) => {
      const document = result.item;
      const score = result.score ?? 1;
      const matches = this.generateSnippets(
        document.content,
        result.matches,
        contextLength
      );

      return {
        path: document.path,
        title: document.title,
        score,
        matchCount: matches.length,
        matches,
      };
    });

    // ステップ6: 結果の制限
    return searchResults.slice(0, maxResults);
  }

  /**
   * 章リストから全パスを再帰的に収集
   */
  private collectChapterPaths(chapters: Chapter[]): Array<{ path: string; title: string }> {
    const result: Array<{ path: string; title: string }> = [];

    for (const chapter of chapters) {
      // path が null の場合はセパレーターなのでスキップ
      if (chapter.path !== null) {
        result.push({
          path: chapter.path,
          title: chapter.title,
        });
      }

      // 子章も再帰的に処理
      if (chapter.children && chapter.children.length > 0) {
        result.push(...this.collectChapterPaths(chapter.children));
      }
    }

    return result;
  }

  /**
   * 検索ドキュメントを構築
   */
  private async buildSearchDocuments(
    project: MdbookProject,
    chapterPaths: Array<{ path: string; title: string }>
  ): Promise<SearchDocument[]> {
    const documents: SearchDocument[] = [];

    for (const { path, title } of chapterPaths) {
      try {
        // パスをバリデーション
        const fullPath = validatePath(path, project.rootPath);

        // ファイルを読み込み
        const content = await this.fs.readFile(fullPath);

        documents.push({
          path,
          title,
          content,
        });
      } catch (error: any) {
        // ファイル読み取りエラーは個別にスキップ
        console.error(`Failed to read file ${path}: ${error.message}`);
      }
    }

    return documents;
  }

  /**
   * fuse.js の結果からスニペットを生成
   */
  private generateSnippets(
    content: string,
    matches: readonly FuseResultMatch[] | undefined,
    contextLength: number
  ): SearchMatch[] {
    if (!matches || matches.length === 0) {
      return [];
    }

    const snippets: SearchMatch[] = [];

    // content フィールドのマッチのみを処理
    const contentMatches = matches.filter((m) => m.key === 'content');

    // 最大3件まで
    const maxSnippets = Math.min(3, contentMatches.length);

    for (let i = 0; i < maxSnippets; i++) {
      const match = contentMatches[i];
      if (match.indices && match.indices.length > 0) {
        // 最初のマッチ位置を使用
        const [startIndex, endIndex] = match.indices[0];

        const snippet = this.generateSnippet(
          content,
          startIndex,
          endIndex + 1, // endIndex は inclusive なので +1
          contextLength
        );

        snippets.push({
          snippet,
          position: startIndex,
        });
      }
    }

    return snippets;
  }

  /**
   * 単一のスニペットを生成
   */
  private generateSnippet(
    content: string,
    startIndex: number,
    endIndex: number,
    contextLength: number
  ): string {
    // スニペットの範囲を計算
    const snippetStart = Math.max(0, startIndex - contextLength);
    const snippetEnd = Math.min(content.length, endIndex + contextLength);

    // スニペットを抽出
    let snippet = content.substring(snippetStart, snippetEnd);

    // 前方が省略される場合は "..." を追加
    if (snippetStart > 0) {
      snippet = '...' + snippet;
    }

    // 後方が省略される場合は "..." を追加
    if (snippetEnd < content.length) {
      snippet = snippet + '...';
    }

    return snippet;
  }

  /**
   * クエリのバリデーション
   */
  private validateQuery(query: string): void {
    if (!query || query.trim().length === 0) {
      throw new Error('Search query cannot be empty');
    }

    if (query.length > 1000) {
      throw new Error('Query too long (max 1000 characters)');
    }
  }
}
