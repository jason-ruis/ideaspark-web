export interface Note {
  id: string;
  title: string;
  content: string;
  filePath: string;
  tags: string[];
  links: string[];
}

// Computed property helpers (ported from Note.swift)
export function getPrimaryTag(note: Note): string | null {
  const priorityTags = ['#insight', '#idea', '#concept', '#thought'];
  return note.tags.find(tag =>
    priorityTags.includes(tag.toLowerCase())
  ) || null;
}

export function getContentSnippet(note: Note, maxLength = 400): string {
  if (note.content.length <= maxLength) {
    return note.content;
  }
  return note.content.substring(0, maxLength) + '...';
}
