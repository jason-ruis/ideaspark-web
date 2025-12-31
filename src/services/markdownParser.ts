// Ported from MarkdownParser.swift

// Pre-compiled regex patterns (matching Swift implementation)
const TAG_REGEX = /(?:^|\s)(#[a-zA-Z0-9_-]+)/g;
const LINK_REGEX = /\[\[([^\]]+)\]\]/g;

export interface ParsedNote {
  title: string;
  content: string;
  tags: string[];
  links: string[];
}

export function parseMarkdown(content: string, fileName: string): ParsedNote {
  const title = extractTitle(fileName);
  const tags = extractTags(content);
  const links = extractLinks(content);
  const cleanedContent = cleanContent(content);

  return {
    title,
    content: cleanedContent,
    tags,
    links
  };
}

function extractTitle(fileName: string): string {
  // Use filename as title - most reliable approach (matching Swift logic)
  const baseFileName = fileName.replace(/\.md$/, '');

  // Clean up common Obsidian filename patterns
  const cleanedTitle = baseFileName
    .replace(/_/g, ' ')
    .replace(/-/g, ' ')
    .trim();

  return cleanedTitle || 'Untitled Note';
}

function extractTags(content: string): string[] {
  const tags = new Set<string>();
  let match;

  // Reset lastIndex before matching
  TAG_REGEX.lastIndex = 0;

  while ((match = TAG_REGEX.exec(content)) !== null) {
    tags.add(match[1]);
  }

  return Array.from(tags).sort();
}

function extractLinks(content: string): string[] {
  const links = new Set<string>();
  let match;

  // Reset lastIndex before matching
  LINK_REGEX.lastIndex = 0;

  while ((match = LINK_REGEX.exec(content)) !== null) {
    links.add(`[[${match[1]}]]`);
  }

  return Array.from(links);
}

function cleanContent(content: string): string {
  let lines = content.split('\n');

  // Remove h1 title if present (matching Swift)
  if (lines.length > 0 && lines[0].startsWith('# ')) {
    lines = lines.slice(1);
  }

  // Remove leading empty lines
  while (lines.length > 0 && lines[0].trim() === '') {
    lines.shift();
  }

  let cleanedContent = lines.join('\n');

  // Remove everything from ```dataviewjs onwards (matching Swift)
  const dataviewIndex = cleanedContent.indexOf('```dataviewjs');
  if (dataviewIndex !== -1) {
    cleanedContent = cleanedContent.substring(0, dataviewIndex);
  }

  // Remove tags from content display
  cleanedContent = cleanedContent.replace(TAG_REGEX, '');

  return cleanedContent.trim();
}

// Check if note has relevant insight keywords (fallback filter)
export function hasInsightKeywords(content: string): boolean {
  const keywords = ['insight', 'idea', 'concept', 'thought', 'observation'];
  const lowercaseContent = content.toLowerCase();

  return keywords.some(keyword => lowercaseContent.includes(keyword));
}
