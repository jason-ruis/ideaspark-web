import type { Note } from '../types/Note';
import { parseMarkdown } from './markdownParser';
import rawNotesData from '../data/notes.json';

interface RawNote {
  path: string;
  name: string;
  content: string;
}

export function loadNotes(): Note[] {
  const notes = rawNotesData as RawNote[];

  return notes.map((raw, index) => {
    const parsed = parseMarkdown(raw.content, raw.name);

    return {
      id: `note-${index}-${raw.path.replace(/[^a-zA-Z0-9]/g, '-')}`,
      title: parsed.title,
      content: parsed.content,
      filePath: raw.path,
      tags: parsed.tags,
      links: parsed.links
    };
  });
}

export function shuffleNotes(notes: Note[]): Note[] {
  const shuffled = [...notes];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
