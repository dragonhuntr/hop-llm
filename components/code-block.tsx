'use client';

type CodeBlockProps = {
  node?: {
    parent?: {
      type: string;
    };
  };
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
}

const styles = {
  inline: 'inline-block text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md',
  paragraph: 'block text-sm bg-zinc-100 dark:bg-zinc-800 p-4 rounded-md whitespace-pre-wrap break-words my-4',
  block: 'block text-sm w-full overflow-x-auto dark:bg-zinc-900 p-4 border border-zinc-200 dark:border-zinc-700 rounded-xl dark:text-zinc-50 text-zinc-900 whitespace-pre-wrap break-words'
};

export function CodeBlock({
  node,
  inline = false,
  className = '',
  children,
  ...props
}: CodeBlockProps) {
  // For inline code
  if (inline) {
    return (
      <code className={`${className} ${styles.inline}`} {...props}>
        {children}
      </code>
    );
  }

  // For code blocks in paragraphs
  if (node?.parent?.type === 'paragraph') {
    return (
      <code className={`${className} ${styles.paragraph}`} {...props}>
        {children}
      </code>
    );
  }

  // For standalone code blocks
  return (
    <div className="not-prose my-4">
      <code className={`${className} ${styles.block}`} {...props}>
        {children}
      </code>
    </div>
  );
}