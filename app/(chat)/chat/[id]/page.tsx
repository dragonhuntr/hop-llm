import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/chat';
import { DEFAULT_MODEL_ID, models } from '@/lib/ai/models';
import { getChatById, getMessagesByChatId } from '@/prisma/queries';
import { convertToUIMessages } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

function ChatLoading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <LoadingSpinner />
    </div>
  );
}

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  
  // Run queries in parallel with Promise.all
  const [chat, session, messagesFromDb] = await Promise.all([
    getChatById({ id }),
    auth(),
    getMessagesByChatId({ id })
  ]);

  if (!chat) {
    notFound();
  }

  if (chat.visibility === 'private') {
    if (!session || !session.user) {
      return notFound();
    }

    if (session.user.id !== chat.userId) {
      return notFound();
    }
  }

  const isReadonly = session?.user?.id !== chat.userId;
  let selectedModelId = models.find((model) => model.id === chat.model)?.id || DEFAULT_MODEL_ID;

  return (
    <>
      <Suspense fallback={<ChatLoading />}>
        <Chat
          id={chat.id}
          initialMessages={convertToUIMessages(messagesFromDb)}
          selectedModelId={selectedModelId}
          selectedVisibilityType={chat.visibility}
          isReadonly={isReadonly}
        />
        <DataStreamHandler id={id} />
      </Suspense>
    </>
  );
}
