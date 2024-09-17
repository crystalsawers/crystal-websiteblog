import { remark } from 'remark';
import remarkHtml from 'remark-html';
import stripMarkdown from 'strip-markdown';

// Convert Markdown to plain text
const markdownToPlainText = (markdown: string): string => {
  const result = remark().use(stripMarkdown).processSync(markdown);
  return result.toString();
};

// Convert plain text back to Markdown HTML
const markdownToHtmlSync = (plainText: string): string => {
  const result = remark().use(remarkHtml).processSync(plainText);
  return result.toString();
};

// Truncate content safely without breaking Markdown
export const truncateContent = (content: string, maxLength: number): string => {
  const plainText = markdownToPlainText(content);

  if (plainText.length <= maxLength) {
    return content; // No truncation needed
  }

  // Truncate the plain text
  const truncatedText = plainText.slice(0, maxLength) + '...';

  // Convert the truncated plain text back to HTML/Markdown format
  return markdownToHtmlSync(truncatedText);
};
