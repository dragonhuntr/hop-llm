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

  if (inline) {
    return (
      <code
        className={`${className} text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md`}
        {...props}
      >
        {children}
      </code>
    );
  } else {
    // Check if we are rendering inside a paragraph
    const parent = node.parent;
    if (parent && parent.type === 'paragraph') {
      // If so, render as a block-level element without the extra div
      return (
        <code
          {...props}
          className={`text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md`}
        >
          {children}
        </code>
      );
    } else {
      // Otherwise, render as before
      return (
        <div className="not-prose flex flex-col">
          {tab === 'code' && (
            <pre
              {...props}
              className={`text-sm w-full overflow-x-auto dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl dark:text-zinc-50 text-zinc-900`}
            >
              <code className="whitespace-pre-wrap break-words">{children}</code>
            </pre>
          )}

          {tab === 'run' && output && (
            <div className="text-sm w-full overflow-x-auto bg-zinc-800 dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-700 border-t-0 rounded-b-xl text-zinc-50">
              <code>{output}</code>
            </div>
          )}
        </div>
      );
    }
  }
}