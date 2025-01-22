import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/chat';
import { DEFAULT_MODEL_NAME, models } from '@/lib/ai/models';
import { getChatById, getMessagesByChatId } from '@/prisma/queries';
import { convertToUIMessages } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  
  // Run queries in parallel
  const [chat, session] = await Promise.all([
    getChatById({ id }),
    auth()
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

  // Check if user is readonly before getting messages and cookie
  const isReadonly = session?.user?.id !== chat.userId;
  
  // Only get cookie if user is not readonly
  let selectedModelId = DEFAULT_MODEL_NAME;
  if (!isReadonly) {
      selectedModelId = models.find((model) => model.id === chat.model)?.id || DEFAULT_MODEL_NAME;
  }

  // Get messages after auth check
  const messagesFromDb = await getMessagesByChatId({ id });

  return (
    <>
      <Chat
        id={chat.id}
        initialMessages={convertToUIMessages(messagesFromDb)}
        selectedModelId={selectedModelId}
        selectedVisibilityType={chat.visibility}
        isReadonly={isReadonly}
      />
      <DataStreamHandler id={id} />
    </>
  );
}
