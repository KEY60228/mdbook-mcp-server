import Fuse, { FuseResult, FuseResultMatch } from 'fuse.js';
import { MdbookProject } from '../domain/MdbookProject.js';
import { SearchResult, SearchMatch } from '../domain/SearchResult.js';
import { Chapter } from '../domain/Chapter.js';
import { FileSystemAdapter } from '../adapters/FileSystemAdapter.js';
import { MdbookStructureService } from './MdbookStructureService.js';
import { validatePath } from '../utils/pathUtils.js';

export interface SearchOptions {
  /** Search query */
  query: string;

  /** Maximum number of results (default: 10) */
  maxResults?: number;

  /** Number of characters around snippet (default: 50) */
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
   * Search within mdbook project
   */
  async search(
    project: MdbookProject,
    options: SearchOptions
  ): Promise<SearchResult[]> {
    const { query, maxResults = 10, contextLength = 50 } = options;

    // Step 1: Validate query
    this.validateQuery(query);

    // Step 2: Get chapter list
    const structure = await this.structureService.getStructure(project);
    const chapterPaths = this.collectChapterPaths(structure.chapters);

    // Step 3: Build search documents
    const documents = await this.buildSearchDocuments(project, chapterPaths);

    if (documents.length === 0) {
      return [];
    }

    // Step 4: Search with fuse.js
    const fuse = new Fuse(documents, {
      keys: ['content'],
      includeScore: true,
      includeMatches: true,
      threshold: 0.3,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });

    const fuseResults = fuse.search(query);

    // Step 5: Transform results
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

    // Step 6: Limit results
    return searchResults.slice(0, maxResults);
  }

  /**
   * Recursively collect all paths from chapter list
   */
  private collectChapterPaths(chapters: Chapter[]): Array<{ path: string; title: string }> {
    const result: Array<{ path: string; title: string }> = [];

    for (const chapter of chapters) {
      // Skip if path is null (separator)
      if (chapter.path !== null) {
        result.push({
          path: chapter.path,
          title: chapter.title,
        });
      }

      // Recursively process child chapters
      if (chapter.children && chapter.children.length > 0) {
        result.push(...this.collectChapterPaths(chapter.children));
      }
    }

    return result;
  }

  /**
   * Build search documents
   */
  private async buildSearchDocuments(
    project: MdbookProject,
    chapterPaths: Array<{ path: string; title: string }>
  ): Promise<SearchDocument[]> {
    const documents: SearchDocument[] = [];

    for (const { path, title } of chapterPaths) {
      try {
        // Validate path
        const fullPath = validatePath(path, project.rootPath);

        // Read file
        const content = await this.fs.readFile(fullPath);

        documents.push({
          path,
          title,
          content,
        });
      } catch (error: any) {
        // Skip individual file read errors
        console.error(`Failed to read file ${path}: ${error.message}`);
      }
    }

    return documents;
  }

  /**
   * Generate snippets from fuse.js results
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

    // Process only content field matches
    const contentMatches = matches.filter((m) => m.key === 'content');

    // Maximum 3 snippets
    const maxSnippets = Math.min(3, contentMatches.length);

    for (let i = 0; i < maxSnippets; i++) {
      const match = contentMatches[i];
      if (match.indices && match.indices.length > 0) {
        // Use first match position
        const [startIndex, endIndex] = match.indices[0];

        const snippet = this.generateSnippet(
          content,
          startIndex,
          endIndex + 1, // endIndex is inclusive so +1
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
   * Generate a single snippet
   */
  private generateSnippet(
    content: string,
    startIndex: number,
    endIndex: number,
    contextLength: number
  ): string {
    // Calculate snippet range
    const snippetStart = Math.max(0, startIndex - contextLength);
    const snippetEnd = Math.min(content.length, endIndex + contextLength);

    // Extract snippet
    let snippet = content.substring(snippetStart, snippetEnd);

    // Add "..." if truncated at start
    if (snippetStart > 0) {
      snippet = '...' + snippet;
    }

    // Add "..." if truncated at end
    if (snippetEnd < content.length) {
      snippet = snippet + '...';
    }

    return snippet;
  }

  /**
   * Validate query
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
