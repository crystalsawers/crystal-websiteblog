import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // For GitHub Flavored Markdown support
import rehypeRaw from 'rehype-raw'; // To handle raw HTML if needed (optional)

type ContentElement = JSX.Element | null;

const renderContent = (content: string): ContentElement => {
  return (
    <div className="markdown-wrapper">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]} // Optional: to support raw HTML if used in content
        className="markdown-content"
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};


export default renderContent;
