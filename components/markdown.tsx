import Link from 'next/link';
import React, { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './code-block';
import { ThinkBlock } from './think-block';

interface MarkdownProps {
  children: string;
}

function chatBlocks(content: string) {
  const parts = content.split(/(<think>[\s\S]*?<\/think>)/g);

  return parts.map((part, index) => {
    if (part.startsWith('<think>')) {
      const thinkContent = part.replace(/<think>|<\/think>/g, '').trim();
      const isDoneThinking = part.includes('</think>');
      return <ThinkBlock key={index} isDoneThinking={isDoneThinking}>{thinkContent}</ThinkBlock>;
    }

    if (part.trim()) {
      return (
        <ReactMarkdown
          key={index}
          remarkPlugins={[remarkGfm]}
          components={{
            code(props: React.ComponentPropsWithoutRef<'code'> & { inline?: boolean; node?: any }) {
              const { children, className, node, ...rest } = props;
              if (props.inline) {
                return <code className="px-1 py-0.5 rounded-md bg-muted" {...rest}>{children}</code>;
              }
              return (
                <pre className="my-4">
                  <CodeBlock node={node} inline={false} className={className || ''}>
                    {children}
                  </CodeBlock>
                </pre>
              );
            },
            pre(props) {
              return <>{props.children}</>;
            },
            p(props) {
              return <p className="my-2">{props.children}</p>;
            },
            ol(props) {
              return <ol className="list-decimal list-outside ml-4 my-2">{props.children}</ol>;
            },
            ul(props) {
              return <ul className="list-disc list-outside ml-4 my-2">{props.children}</ul>;
            },
            li(props) {
              return <li className="py-1">{props.children}</li>;
            },
            strong(props) {
              return <span className="font-semibold">{props.children}</span>;
            },
            a(props) {
              return (
                <Link href={props.href || '#'} className="text-blue-500 hover:underline" target="_blank" rel="noreferrer">
                  {props.children}
                </Link>
              );
            },
            h1(props) {
              return <h1 className="text-3xl font-semibold mt-6 mb-2">{props.children}</h1>;
            },
            h2(props) {
              return <h2 className="text-2xl font-semibold mt-6 mb-2">{props.children}</h2>;
            },
            h3(props) {
              return <h3 className="text-xl font-semibold mt-6 mb-2">{props.children}</h3>;
            },
            h4(props) {
              return <h4 className="text-lg font-semibold mt-6 mb-2">{props.children}</h4>;
            },
            h5(props) {
              return <h5 className="text-base font-semibold mt-6 mb-2">{props.children}</h5>;
            },
            h6(props) {
              return <h6 className="text-sm font-semibold mt-6 mb-2">{props.children}</h6>;
            },
          }}
        >
          {part}
        </ReactMarkdown>
      );
    }
    return null;
  });
}

export const Markdown = memo(
  ({ children }: MarkdownProps) => {
    return <div className="markdown">{chatBlocks(children)}</div>;
  },
  (prev, next) => prev.children === next.children
);
