import { ChatRequestOptions, Message } from 'ai';
import { PreviewMessage, ThinkingMessage } from './message';
import { useScrollToBottom } from './use-scroll-to-bottom';
import { memo } from 'react';
import { Vote } from '@/lib/db/schema';
import equal from 'fast-deep-equal';

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

function PureMessages({
  chatId,
  isLoading,
  votes,
  messages,
  setMessages,
  reload,
  isReadonly,
  isBlockVisible,
}: MessagesProps) {
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  return (
    <div
      ref={messagesContainerRef}
      className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4"
      data-block-visible={isBlockVisible}
    >
      {/* {messages.length === 0 && <Overview />} */}

      {messages.map((message, index) => (
        <PreviewMessage
          key={message.id}
          chatId={chatId}
          message={message}
          isLoading={isLoading && messages.length - 1 === index}
          vote={
            votes
              ? votes.find((vote) => vote.messageId === message.id)
              : undefined
          }
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
        />
      ))}

      {isLoading &&
        messages.length > 0 &&
        messages[messages.length - 1].role === 'user' && <ThinkingMessage />}

      <div
        ref={messagesEndRef}
        className="shrink-0 min-w-[24px] min-h-[24px]"
      />
    </div>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  // Block visibility check - if either has changed, we should re-render
  if (prevProps.isBlockVisible !== nextProps.isBlockVisible) return false;

  // Loading state changes
  if (prevProps.isLoading !== nextProps.isLoading) return false;

  // Message length check (quick fail)
  if (prevProps.messages.length !== nextProps.messages.length) return false;

  // Only do shallow comparison of last message if lengths are same
  // This covers most common case of new messages being added
  const prevLastMsg = prevProps.messages[prevProps.messages.length - 1];
  const nextLastMsg = nextProps.messages[nextProps.messages.length - 1];
  if (prevLastMsg?.id !== nextLastMsg?.id || 
      prevLastMsg?.content !== nextLastMsg?.content ||
      prevLastMsg?.role !== nextLastMsg?.role) {
    return false;
  }

  // Votes comparison
  if (!equal(prevProps.votes, nextProps.votes)) return false;

  return true;
});