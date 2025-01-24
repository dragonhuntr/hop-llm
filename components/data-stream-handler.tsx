'use client';

import { useChat } from 'ai/react';
import { useEffect, useRef } from 'react';
import { BlockKind } from './block';
import { Suggestion } from '@/lib/db/schema';
import { initialBlockData, useBlock } from '@/hooks/use-block';
import { useUserMessageId } from '@/hooks/use-user-message-id';
import { cx } from 'class-variance-authority';

type DataStreamDelta = {
  type:
    | 'text-delta'
    | 'code-delta'
    | 'title'
    | 'id'
    | 'suggestion'
    | 'clear'
    | 'finish'
    | 'user-message-id'
    | 'kind';
  content: string | Suggestion;
};

export function DataStreamHandler({ id }: { id: string }) {
  const { data: dataStream } = useChat({ id });
  const { setUserMessageIdFromServer } = useUserMessageId();
  const { setBlock } = useBlock();
  const lastProcessedIndex = useRef(-1);
  const blockDataRef = useRef(initialBlockData);

  useEffect(() => {
    if (!dataStream) return;

    // Process only new items since last check
    for (let i = lastProcessedIndex.current + 1; i < dataStream.length; i++) {
      const delta = dataStream[i] as DataStreamDelta;

      if (!delta) continue;

      switch (delta.type) {
        case 'user-message-id':
          setUserMessageIdFromServer(delta.content as string);
          break;
        case 'kind':
          blockDataRef.current.kind = delta.content as BlockKind;
          break;
        case 'title':
          blockDataRef.current.title = delta.content as string;
          break;
        case 'text-delta':
        case 'code-delta':
          blockDataRef.current.content += delta.content as string;
          break;
        case 'suggestion':
          blockDataRef.current.suggestions = [
            ...(blockDataRef.current.suggestions || []),
            delta.content as Suggestion,
          ];
          break;
        case 'clear':
          blockDataRef.current = { ...initialBlockData };
          break;
        case 'finish':
          setBlock(blockDataRef.current);
          blockDataRef.current = { ...initialBlockData };
          break;
      }

      lastProcessedIndex.current = i;
    }
  }, [dataStream, setBlock, setUserMessageIdFromServer]);

  return null;
}
