import { Chapter } from '../domain/Chapter.js';
import { ParseError } from '../utils/errors.js';

export class MarkdownParser {
  parseSummary(content: string): Chapter[] {
    try {
      const lines = content.split('\n');
      const chapters: Chapter[] = [];
      const stack: { level: number; chapter: Chapter }[] = [];

      for (const line of lines) {
        // リンク形式: - [Title](path.md) または空行・コメントはスキップ
        const match = line.match(/^(\s*)[-*]\s+\[([^\]]+)\]\(([^)]+)\)/);

        if (!match) {
          // セパレーター形式: ---
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
        const level = Math.floor(indent.length / 2); // 2スペースでインデント1レベル

        const chapter: Chapter = {
          title,
          path: pathStr,
          level,
        };

        // スタックを使って階層構造を構築
        while (stack.length > 0 && stack[stack.length - 1].level >= level) {
          stack.pop();
        }

        if (stack.length === 0) {
          // トップレベル
          chapters.push(chapter);
        } else {
          // 親の子として追加
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
