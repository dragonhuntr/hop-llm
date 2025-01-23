'use client';

import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import type { User } from 'next-auth';
import { memo, useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import useSWR from 'swr';

import {
  CheckCircleFillIcon,
  GlobeIcon,
  LockIcon,
  MoreHorizontalIcon,
  ShareIcon,
  TrashIcon,
} from '@/components/icons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import type { Chat } from '@/lib/db/schema';
import { fetcher } from '@/lib/utils';
import { useChatVisibility } from '@/hooks/use-chat-visibility';

type TempChat = {
  id: string;
  title: string;
  isTemp: true;
};

const PureChatItem = ({
  chat,
  isActive,
  onDelete,
  setOpenMobile,
}: {
  chat: Chat | TempChat;
  isActive: boolean;
  onDelete: (chatId: string) => void;
  setOpenMobile: (open: boolean) => void;
}) => {
  // Only show visibility options for non-temporary chats
  if ('isTemp' in chat) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive}>
          <Link href={`/chat/${chat.id}`} onClick={() => setOpenMobile(false)}>
            <span className="text-sidebar-foreground/70">{chat.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  const { visibilityType, setVisibilityType } = useChatVisibility({
    chatId: chat.id,
    initialVisibility: chat.visibility,
  });

  const handleVisibilityChange = async (newVisibility: 'private' | 'public') => {
    try {
      await setVisibilityType(newVisibility);
    } catch (error) {
      toast.error('Failed to update chat visibility');
    }
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link href={`/chat/${chat.id}`} onClick={() => setOpenMobile(false)}>
          <span>{chat.title}</span>
          {visibilityType === 'public' && (
            <div className="ml-2 inline-block text-sidebar-foreground/50">
              <GlobeIcon size={16} />
            </div>
          )}
        </Link>
      </SidebarMenuButton>

      <DropdownMenu modal={true}>
        <DropdownMenuTrigger asChild>
          <SidebarMenuAction
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground mr-0.5"
            showOnHover={!isActive}
          >
            <MoreHorizontalIcon />
            <span className="sr-only">More</span>
          </SidebarMenuAction>
        </DropdownMenuTrigger>

        <DropdownMenuContent side="bottom" align="end">
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer">
              <ShareIcon />
              <span>Share</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  className="cursor-pointer flex-row justify-between"
                  onClick={() => handleVisibilityChange('private')}
                >
                  <div className="flex flex-row gap-2 items-center">
                    <LockIcon size={12} />
                    <span>Private</span>
                  </div>
                  {visibilityType === 'private' ? <CheckCircleFillIcon /> : null}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer flex-row justify-between"
                  onClick={() => handleVisibilityChange('public')}
                >
                  <div className="flex flex-row gap-2 items-center">
                    <GlobeIcon />
                    <span>Public</span>
                  </div>
                  {visibilityType === 'public' ? <CheckCircleFillIcon /> : null}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuItem
            className="cursor-pointer text-destructive focus:bg-destructive/15 focus:text-destructive dark:text-red-500"
            onSelect={() => onDelete(chat.id)}
          >
            <TrashIcon />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
};

export const ChatItem = memo(PureChatItem, (prevProps, nextProps) => {
  if (prevProps.isActive !== nextProps.isActive) return false;
  return true;
});

export function SidebarHistory({ user }: { user: User | undefined }) {
  const { setOpenMobile } = useSidebar();
  const { id } = useParams();
  const pathname = usePathname();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const {
    data: history,
    isLoading,
    mutate,
  } = useSWR<Array<Chat>>(user ? '/api/history' : null, fetcher, {
    fallbackData: [],
    dedupingInterval: 1000,
    revalidateOnFocus: true,
  });

  // Simplified temp chat handling - only store the current temp chat
  const [tempChat, setTempChat] = useState<TempChat | null>(null);
  const currentChatId = pathname.startsWith('/chat/') ? pathname.split('/').pop() : null;
  
  // Simple temp chat management
  useEffect(() => {
    if (!user || isLoading || !currentChatId) {
      setTempChat(null);
      return;
    }

    const existsInHistory = history?.some(chat => chat.id === currentChatId);
    
    if (!existsInHistory && currentChatId) {
      setTempChat({ id: currentChatId, title: 'New Chat', isTemp: true });
    } else {
      setTempChat(null);
    }
  }, [currentChatId, history, user, isLoading]);

  useEffect(() => {
    const handler = () => mutate();
    window.addEventListener('message-sent', handler);
    return () => window.removeEventListener('message-sent', handler);
  }, [mutate]);

  const handleDelete = useCallback((chatId: string) => {
    setDeleteId(chatId);
    setShowDeleteDialog(true);
  }, []);

  const router = useRouter();
  const handleDeleteConfirmed = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/chat/${deleteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete chat');

      setDeleteId(null);
      setShowDeleteDialog(false);
      mutate((chats) => chats?.filter((chat) => chat.id !== deleteId), false);

      if (id === deleteId) {
        router.push('/');
      }

      toast.success('Chat deleted successfully');
      mutate();
    } catch (error) {
      console.error('Failed to delete chat:', error);
      toast.error('Failed to delete chat');
      mutate();
    }
  };

  if (!user) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="px-2 text-zinc-500 w-full flex flex-row justify-center items-center text-sm gap-2">
            Login to save and revisit previous chats!
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (isLoading) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="flex flex-col">
            {[44, 32, 28].map((width) => (
              <div key={width} className="rounded-md h-8 flex gap-2 px-2 items-center">
                <div
                  className="h-4 rounded-md flex-1 max-w-[--skeleton-width] bg-sidebar-accent-foreground/10"
                  style={{ '--skeleton-width': `${width}%` } as React.CSSProperties}
                />
              </div>
            ))}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {tempChat && (
              <ChatItem
                key={tempChat.id}
                chat={tempChat}
                isActive={tempChat.id === currentChatId}
                onDelete={handleDelete}
                setOpenMobile={setOpenMobile}
              />
            )}
            {history?.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isActive={chat.id === currentChatId}
                onDelete={handleDelete}
                setOpenMobile={setOpenMobile}
              />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              chat and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirmed}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

