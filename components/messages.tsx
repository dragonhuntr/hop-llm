import { ChatRequestOptions, Message } from 'ai';
import { PreviewMessage, ThinkingMessage } from './message';
import { useScrollToBottom } from './use-scroll-to-bottom';
import { Overview } from './overview';
import { memo } from 'react';
import { Vote } from '@/lib/db/schema';
import equal from 'fast-deep-equal';
import { useVirtualizer } from '@tanstack/react-virtual';

interface MessagesProps {
  chatId: string;
  isLoading: boolean;
  votes: Array<Vote> | undefined;
  messages: Array<Message>;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[]),
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  isReadonly: boolean;
  isBlockVisible: boolean;
}

interface VirtualItem {
  index: number;
  start: number;
  size: number;
  key: string | number | bigint;
}

const MemoizedPreviewMessage = memo(PreviewMessage, (prev, next) => {
  return prev.message.id === next.message.id && 
         prev.isLoading === next.isLoading &&
         equal(prev.vote, next.vote);
});

function PureMessages({
  chatId,
  isLoading,
  votes,
  messages,
  setMessages,
  reload,
  isReadonly,
}: MessagesProps) {
  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();

  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => messagesContainerRef.current,
    estimateSize: () => 100,
    overscan: 5
  });

  return (
    <div
      ref={messagesContainerRef}
      className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4"
    >
      {/* {messages.length === 0 && <Overview />} */}

      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow: VirtualItem) => {
          const message = messages[virtualRow.index];
          return (
            <div
              key={message.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <MemoizedPreviewMessage
                chatId={chatId}
                message={message}
                isLoading={isLoading && messages.length - 1 === virtualRow.index}
                vote={votes?.find((v) => v.messageId === message.id)}
                setMessages={setMessages}
                reload={reload}
                isReadonly={isReadonly}
              />
            </div>
          );
        })}
      </div>

      {isLoading &&
        messages.length > 0 &&
        messages[messages.length - 1].role === 'user' && <ThinkingMessage />}

      <div ref={messagesEndRef} />
    </div>
  );
}

export const Messages = memo(PureMessages, (prev, next) => {
  return prev.chatId === next.chatId &&
         prev.isLoading === next.isLoading &&
         equal(prev.votes, next.votes) &&
         equal(prev.messages, next.messages) &&
         prev.isReadonly === next.isReadonly;
});
