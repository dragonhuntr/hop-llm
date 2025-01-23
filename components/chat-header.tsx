'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';
import dynamic from 'next/dynamic';
import { memo, useMemo } from 'react';
import { useSWRConfig } from 'swr';

import { SidebarToggle } from '@/components/sidebar-toggle';
import { Button } from '@/components/ui/button';
import { PlusIcon, VercelIcon } from './icons';
import { useSidebar } from './ui/sidebar';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { VisibilityType } from './visibility-selector';

// Dynamically import heavy components
const DynamicModelSelector = dynamic(() => import('./model-selector').then(mod => mod.ModelSelector), {
  ssr: false
});

const DynamicVisibilitySelector = dynamic(() => import('./visibility-selector').then(mod => mod.VisibilitySelector), {
  ssr: false
});

function PureChatHeader({
  chatId,
  selectedModelId,
  onModelChange,
  selectedVisibilityType,
  isReadonly,
}: {
  chatId: string;
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {
  const router = useRouter();
  const { open } = useSidebar();
  const { width: windowWidth } = useWindowSize();
  const { mutate } = useSWRConfig();

  const handleNewChat = () => {
    // Optimistically update the history to show the change immediately
    mutate('/api/history', (currentChats: any) => {
      if (!Array.isArray(currentChats)) return currentChats;
      return currentChats;
    }, false);
    
    router.push('/');
  };

  const newChatButton = useMemo(() => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          className="order-2 md:order-1 md:px-2 px-2 md:h-fit ml-auto md:ml-0"
          onClick={handleNewChat}
        >
          <PlusIcon />
          <span className="md:sr-only">New Chat</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>New Chat</TooltipContent>
    </Tooltip>
  ), [router]);

  return (
    <header className="flex sticky top-0 bg-background py-1.5 items-center px-2 md:px-2 gap-2">
      <SidebarToggle />

      {(!open || windowWidth < 768) && newChatButton}

      <div className="flex items-center gap-2 md:ml-0 ml-auto order-1 md:order-2">
        {!isReadonly && (
          <>
            <DynamicModelSelector
              selectedModelId={selectedModelId}
              onModelChange={onModelChange}
              chatId={chatId}
            />
            <DynamicVisibilitySelector
              selectedVisibilityType={selectedVisibilityType}
              chatId={chatId}
            />
          </>
        )}
      </div>
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prev, next) => {
  return prev.chatId === next.chatId &&
         prev.selectedModelId === next.selectedModelId &&
         prev.selectedVisibilityType === next.selectedVisibilityType &&
         prev.isReadonly === next.isReadonly;
});
