import * as toml from '@iarna/toml';
import { ParseError } from '../utils/errors.js';

export interface BookTomlData {
  title: string;
  authors: string[];
  language: string;
  src: string;
}

export class TomlParser {
  parse(content: string): BookTomlData {
    try {
      const parsed: any = toml.parse(content);

      const book = parsed.book || {};
      const build = parsed.build || {};

      return {
        title: book.title || 'Untitled',
        authors: book.authors || [],
        language: book.language || 'en',
        src: build.src || 'src',
      };
    } catch (error: any) {
      throw new ParseError(`Failed to parse TOML: ${error.message}`);
    }
  }
}
