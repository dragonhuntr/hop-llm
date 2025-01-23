import Link from 'next/link';
import React, { memo } from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './code-block';

interface MarkdownProps {
  children: string;
  components?: Partial<Components>;
}

const defaultComponents: Partial<Components> = {
  code: ({ node, inline, className, children, ...props }) => {
    if (inline) {
      return <code {...props}>{children}</code>;
    }
    return (
      <pre>
        <CodeBlock node={node} inline={false} className={className}>
          {children}
        </CodeBlock>
      </pre>
    );
  },
  pre: ({ children }) => <>{children}</>,
  p: ({ children }) => <p className="my-2">{children}</p>,
  ol: ({ children }) => <ol className="list-decimal list-outside ml-4 my-2">{children}</ol>,
  ul: ({ children }) => <ul className="list-disc list-outside ml-4 my-2">{children}</ul>,
  li: ({ children }) => <li className="py-1">{children}</li>,
  strong: ({ children }) => <span className="font-semibold">{children}</span>,
  a: ({ children, href }) => (
    <Link href={href || '#'} className="text-blue-500 hover:underline" target="_blank" rel="noreferrer">
      {children}
    </Link>
  ),
  h1: ({ children }) => <h1 className="text-3xl font-semibold mt-6 mb-2">{children}</h1>,
  h2: ({ children }) => <h2 className="text-2xl font-semibold mt-6 mb-2">{children}</h2>,
  h3: ({ children }) => <h3 className="text-xl font-semibold mt-6 mb-2">{children}</h3>,
  h4: ({ children }) => <h4 className="text-lg font-semibold mt-6 mb-2">{children}</h4>,
  h5: ({ children }) => <h5 className="text-base font-semibold mt-6 mb-2">{children}</h5>,
  h6: ({ children }) => <h6 className="text-sm font-semibold mt-6 mb-2">{children}</h6>,
};

export const Markdown = memo(
  ({ children, components = {} }: MarkdownProps) => (
    <ReactMarkdown 
      remarkPlugins={[remarkGfm]} 
      components={{ ...defaultComponents, ...components }}
    >
      {children}
    </ReactMarkdown>
  ),
  (prev, next) => prev.children === next.children
);
