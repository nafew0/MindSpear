import React, { JSX, useEffect, useState } from 'react';
import DOMPurify from 'dompurify';

interface SafeHTMLRendererProps {
  html: string;
  className?: string;
  tag?: keyof JSX.IntrinsicElements;
  wordLimit?: number; 
}

const SafeHTMLRenderer: React.FC<SafeHTMLRendererProps> = ({
  html,
  className,
  tag: Tag = 'div',
  wordLimit, 
}) => {
  const [processedHtml, setProcessedHtml] = useState('');

  useEffect(() => {
    const processHtml = () => {
      const cleanHtml = DOMPurify.sanitize(html);
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = cleanHtml;

      const text = tempDiv.textContent || tempDiv.innerText || '';

      if (wordLimit && text.length > wordLimit) {
        let charCount = 0;
        let truncatedHtml = '';
        const parser = new DOMParser();
        const doc = parser.parseFromString(cleanHtml, 'text/html');
        
        const traverse = (node: Node) => {
          if (charCount >= wordLimit) return;

          if (node.nodeType === Node.TEXT_NODE) {
            const remainingChars = wordLimit - charCount;
            const textContent = node.textContent || '';
            const truncatedText = textContent.slice(0, remainingChars);
            truncatedHtml += truncatedText;
            charCount += truncatedText.length;
            if (charCount >= wordLimit) {
              truncatedHtml += '...';
            }
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            const tagName = element.tagName.toLowerCase();
            truncatedHtml += `<${tagName}`;

            for (let i = 0; i < element.attributes.length; i++) {
              const attr = element.attributes[i];
              truncatedHtml += ` ${attr.name}="${attr.value}"`;
            }
            
            truncatedHtml += '>';
            
            for (let i = 0; i < node.childNodes.length; i++) {
              traverse(node.childNodes[i]);
              if (charCount >= wordLimit) break;
            }
            
            truncatedHtml += `</${tagName}>`;
          }
        };

        traverse(doc.body);
        setProcessedHtml(DOMPurify.sanitize(truncatedHtml));
      } else {
        setProcessedHtml(cleanHtml);
      }
    };

    processHtml();
  }, [html, wordLimit]);

  return React.createElement(Tag, {
    className,
    dangerouslySetInnerHTML: { __html: processedHtml },
  });
};

export default SafeHTMLRenderer;