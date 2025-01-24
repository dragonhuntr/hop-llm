'use client';

import type { Attachment, Message } from 'ai';
import { useChat } from 'ai/react';
import { useState, useCallback, useMemo, useRef, type SetStateAction, useEffect } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import dynamic from 'next/dynamic';
import { memo } from 'react';

import { ChatHeader } from '@/components/chat-header';
import type { Vote } from '@/lib/db/schema';
import { fetcher } from '@/lib/utils';
import { models } from '@/lib/ai/models';

import { Block } from './block';
import { VisibilityType } from './visibility-selector';
import { useBlockSelector } from '@/hooks/use-block';

// Preload dynamic components
const MultimodalInputPromise = () => import('./multimodal-input').then(mod => mod.MultimodalInput);
const MessagesPromise = () => import('./messages').then(mod => mod.Messages);

// Dynamically import heavy components with loading state
const DynamicMultimodalInput = dynamic(MultimodalInputPromise, {
  ssr: false,
  loading: () => <div className="h-[50px] w-full bg-muted animate-pulse rounded-lg" />
});

const DynamicMessages = dynamic(MessagesPromise, {
  ssr: false,
  loading: () => <div className="flex-1 flex items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
});

// Preload components on mount
const preloadComponents = () => {
  MultimodalInputPromise();
  MessagesPromise();
};

export const Chat = memo(function Chat({
  id,
  initialMessages,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
}: {
  id: string;
  initialMessages: Array<Message>;
  selectedModelId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {
  // Preload components on mount
  useEffect(() => {
    preloadComponents();
  }, []);

  const { mutate } = useSWRConfig();
  const [currentModelId, setCurrentModelId] = useState(selectedModelId);
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  
  // Use refs for event handlers and stable values
  const messageEventRef = useRef(() => {
    window.dispatchEvent(new Event('message-sent'));
  });
  
  const mutateRef = useRef(mutate);
  useEffect(() => {
    mutateRef.current = mutate;
  }, [mutate]);
  
  // Memoize the mutate callback
  const handleMutate = useCallback(() => {
    mutateRef.current('/api/history');
  }, []);

  // Memoize model change handler
  const handleModelChange = useCallback((modelId: string) => {
    setCurrentModelId(modelId);
  }, []);

  const chatConfig = useMemo(() => ({
    id,
    body: { id, modelId: currentModelId },
    initialMessages,
    experimental_throttle: 100,
    onFinish: () => {
      handleMutate();
      messageEventRef.current();
    },
    onResponse: handleMutate
  }), [id, currentModelId, initialMessages, handleMutate]);

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    isLoading,
    stop,
    reload,
  } = useChat(chatConfig);

  // Memoize SWR key and cache result
  const votesKey = useMemo(() => `/api/vote?chatId=${id}`, [id]);
  const { data: votes } = useSWR<Array<Vote>>(votesKey, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false
  });

  const isBlockVisible = useBlockSelector((state) => state.isVisible);

  // Memoize handlers
  const handleSetInput = useCallback((value: string) => {
    setInput(value);
  }, [setInput]);

  const handleSetMessages = useCallback((value: SetStateAction<Message[]>) => {
    setMessages(value);
  }, [setMessages]);

  const handleSetAttachments = useCallback((value: SetStateAction<Attachment[]>) => {
    setAttachments(value);
  }, []);

  // Memoize props passed to child components
  const headerProps = useMemo(() => ({
    chatId: id,
    selectedModelId: currentModelId,
    onModelChange: handleModelChange,
    selectedVisibilityType,
    isReadonly
  }), [id, currentModelId, handleModelChange, selectedVisibilityType, isReadonly]);

  const messagesProps = useMemo(() => ({
    chatId: id,
    isLoading,
    votes,
    messages,
    setMessages: handleSetMessages,
    reload,
    isReadonly,
    isBlockVisible
  }), [id, isLoading, votes, messages, handleSetMessages, reload, isReadonly, isBlockVisible]);

  // Get model vision capability
  const isVisionModel = useMemo(() => {
    const model = models.find(m => m.id === currentModelId);
    return model?.vision ?? false;
  }, [currentModelId]);

  const multimodalInputProps = useMemo(() => ({
    chatId: id,
    input,
    setInput: handleSetInput,
    handleSubmit,
    isLoading,
    stop,
    attachments,
    setAttachments: handleSetAttachments,
    messages,
    setMessages: handleSetMessages,
    append,
    isVisionModel
  }), [id, input, handleSetInput, handleSubmit, isLoading, stop, attachments, handleSetAttachments, messages, handleSetMessages, append, isVisionModel]);

  const blockProps = useMemo(() => ({
    chatId: id,
    input,
    setInput: handleSetInput,
    handleSubmit,
    isLoading,
    stop,
    attachments,
    setAttachments: handleSetAttachments,
    append,
    messages,
    setMessages: handleSetMessages,
    reload,
    votes,
    isReadonly,
    isVisionModel
  }), [id, input, handleSetInput, handleSubmit, isLoading, stop, attachments, handleSetAttachments, append, messages, handleSetMessages, reload, votes, isReadonly, isVisionModel]);

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader {...headerProps} />
        <DynamicMessages {...messagesProps} />
        <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          {!isReadonly && <DynamicMultimodalInput {...multimodalInputProps} />}
        </form>
      </div>
      <Block {...blockProps} />
    </>
  );
});
