export interface Chapter {
  title: string;
  path: string | null;  // null indicates separator
  level: number;        // 0-based nesting level
  children?: Chapter[]; // Nested chapters
}
