import React from 'react';

type ContentElement = JSX.Element | null;

// Split content into paragraphs based on newline characters
const renderContent = (content: string): ContentElement[] => {
  // Regular expression to match headings, paragraphs, blockquotes, and lists
  const elementRegex = /^(#+\s.*)|(^>\s.*)|(^\*\s.*)|(\n\n)/g;

  const elements = content
    .split(elementRegex)
    .filter(text => text !== null && text !== undefined && text.trim() !== '') // Remove empty strings
    .map((element, index) => {
      if (element.startsWith('#')) {
        // Match headings (e.g., # Heading 1, ## Heading 2)
        const headingLevel = element.match(/^#+/)?.[0]?.length ?? 0;
        const headingText = element.replace(/^#+\s/, '');
        const Tag = `h${Math.min(6, headingLevel)}` as keyof JSX.IntrinsicElements; // Dynamic heading tag
        return (
          <Tag key={index} className={`heading-${headingLevel}`}>
            {headingText}
          </Tag>
        );
      } else if (element.startsWith('>')) {
        // Match blockquotes (e.g., > Quote)
        const quoteText = element.replace(/^>\s/, '');
        return (
          <blockquote key={index} className="blockquote">
            <p>{quoteText}</p>
          </blockquote>
        );
      } else if (element.startsWith('*')) {
        // Match lists (e.g., * Item 1)
        const listItemText = element.replace(/^\*\s/, '');
        return (
          <li key={index}>{listItemText}</li>
        );
      } else {
        // Match paragraphs
        return (
          <p key={index} className="mb-4">
            {element}
          </p>
        );
      }
    });

  // Wrap list items in a <ul>
  const wrappedElements: JSX.Element[] = [];
  let insideList = false;
  elements.forEach((el, idx) => {
    if (el && el.type === 'li') {
      if (!insideList) {
        wrappedElements.push(<ul key={`ul-${idx}`} className="list-disc">{el}</ul>);
        insideList = true;
      } else {
        wrappedElements.push(el);
      }
    } else {
      if (insideList) {
        insideList = false;
      }
      wrappedElements.push(el);
    }
  });

  return wrappedElements;
};

export default renderContent;
