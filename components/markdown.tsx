import Link from 'next/link';
import React, { memo, useMemo, useState } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './code-block';

const defaultComponents: Partial<Components> = {
  // Handle code blocks at the root level
  code: ({ node, className, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    const inline = !match && !node?.position?.start.line;
    if (inline) {
      return <code {...props} />;
    }
    return <CodeBlock node={node} {...props} />;
  },
  // Remove the pre wrapper since CodeBlock handles its own container
  pre: ({ children }) => <>{children}</>,
  // Handle paragraphs that might contain code blocks
  p: ({ children, ...props }) => {
    // Convert children to array once
    const childArray = Array.isArray(children) ? children : [children];
    
    // Check if any child is a code block using a simple array method
    const hasCodeBlock = childArray.some(
      child => React.isValidElement(child) && (child.type === 'pre' || child.type === CodeBlock)
    );

    // If there's a code block, handle each child directly
    if (hasCodeBlock) {
      return (
        <>
          {childArray.map((child, index) => {
            if (React.isValidElement(child) && (child.type === 'pre' || child.type === CodeBlock)) {
              return React.cloneElement(child, { key: index });
            }
            return <span key={index} {...props}>{child}</span>;
          })}
        </>
      );
    }
    return <p {...props}>{children}</p>;
  },
  ol: ({ node, children, ...props }) => {
    return (
      <ol className="list-decimal list-outside ml-4" {...props}>
        {children}
      </ol>
    );
  },
  li: ({ node, children, ...props }) => {
    return (
      <li className="py-1" {...props}>
        {children}
      </li>
    );
  },
  ul: ({ node, children, ...props }) => {
    return (
      <ul className="list-decimal list-outside ml-4" {...props}>
        {children}
      </ul>
    );
  },
  strong: ({ node, children, ...props }) => {
    return (
      <span className="font-semibold" {...props}>
        {children}
      </span>
    );
  },
  a: ({ node, children, ...props }) => {
    return (
      // @ts-expect-error
      <Link
        className="text-blue-500 hover:underline"
        target="_blank"
        rel="noreferrer"
        {...props}
      >
        {children}
      </Link>
    );
  },
  h1: ({ node, children, ...props }) => {
    return (
      <h1 className="text-3xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h1>
    );
  },
  h2: ({ node, children, ...props }) => {
    return (
      <h2 className="text-2xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h2>
    );
  },
  h3: ({ node, children, ...props }) => {
    return (
      <h3 className="text-xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h3>
    );
  },
  h4: ({ node, children, ...props }) => {
    return (
      <h4 className="text-lg font-semibold mt-6 mb-2" {...props}>
        {children}
      </h4>
    );
  },
  h5: ({ node, children, ...props }) => {
    return (
      <h5 className="text-base font-semibold mt-6 mb-2" {...props}>
        {children}
      </h5>
    );
  },
  h6: ({ node, children, ...props }) => {
    return (
      <h6 className="text-sm font-semibold mt-6 mb-2" {...props}>
        {children}
      </h6>
    );
  },
};

const remarkPlugins = [remarkGfm];

const NonMemoizedMarkdown = ({ 
  children,
  components: customComponents = {} 
}: { 
  children: string;
  components?: Partial<Components>;
}) => {
  const mergedComponents = {
    ...defaultComponents,
    ...customComponents
  };

  return (
    <ReactMarkdown 
      remarkPlugins={remarkPlugins} 
      components={mergedComponents}
    >
      {children}
    </ReactMarkdown>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children
);
