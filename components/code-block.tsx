'use client';

import { useState } from 'react';

interface CodeBlockProps {
  node: any;
  inline: boolean;
  className: string;
  children: any;
}

export function CodeBlock({
  node,
  inline,
  className,
  children,
  ...props
}: CodeBlockProps) {
  const [output, setOutput] = useState<string | null>(null);
  const [tab, setTab] = useState<'code' | 'run'>('code');

  // For inline code, render with inline styling
  if (inline) {
    return (
      <code
        className={`${className} inline-block text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md`}
        {...props}
      >
        {children}
      </code>
    );
  }

  // For code blocks in paragraphs, render without a div wrapper
  const parent = node.parent;
  if (parent?.type === 'paragraph') {
    return (
      <code
        className="block text-sm bg-zinc-100 dark:bg-zinc-800 p-4 rounded-md whitespace-pre-wrap break-words my-4"
        {...props}
      >
        {children}
      </code>
    );
  }

  // For standalone code blocks, use the full featured version
  return (
    <div className="not-prose my-4">
      {tab === 'code' && (
        <code
          {...props}
          className="block text-sm w-full overflow-x-auto dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl dark:text-zinc-50 text-zinc-900 whitespace-pre-wrap break-words"
        >
          {children}
        </code>
      )}

      {tab === 'run' && output && (
        <div className="text-sm w-full overflow-x-auto bg-zinc-800 dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-50">
          <code>{output}</code>
        </div>
      )}
    </div>
  );
}