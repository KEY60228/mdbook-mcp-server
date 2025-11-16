import { Chapter } from '../domain/Chapter.js';
import { ParseError } from '../utils/errors.js';

export class MarkdownParser {
  parseSummary(content: string): Chapter[] {
    try {
      const lines = content.split('\n');
      const chapters: Chapter[] = [];
      const stack: { level: number; chapter: Chapter }[] = [];

      for (const line of lines) {
        // Link format: - [Title](path.md) or skip empty lines/comments
        const match = line.match(/^(\s*)[-*]\s+\[([^\]]+)\]\(([^)]+)\)/);

        if (!match) {
          // Separator format: ---
          if (line.trim().match(/^---+$/)) {
            chapters.push({
              title: '---',
              path: null,
              level: 0,
            });
          }
          continue;
        }

        const [, indent, title, pathStr] = match;
        const level = Math.floor(indent.length / 2); // 1 level per 2 spaces

        const chapter: Chapter = {
          title,
          path: pathStr,
          level,
        };

        // Build hierarchy using stack
        while (stack.length > 0 && stack[stack.length - 1].level >= level) {
          stack.pop();
        }

        if (stack.length === 0) {
          // Top level
          chapters.push(chapter);
        } else {
          // Add as parent's child
          const parent = stack[stack.length - 1].chapter;
          if (!parent.children) {
            parent.children = [];
          }
          parent.children.push(chapter);
        }

        stack.push({ level, chapter });
      }

      return chapters;
    } catch (error: any) {
      throw new ParseError(`Failed to parse SUMMARY.md: ${error.message}`);
    }
  }
}
