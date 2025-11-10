import { Chapter } from './Chapter.js';

export interface BookStructure {
  title: string;
  authors: string[];
  language: string;
  src: string;
  chapters: Chapter[];
}
