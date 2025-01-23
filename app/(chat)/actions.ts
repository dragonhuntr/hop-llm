'use server';

import { type CoreUserMessage, generateText } from 'ai';

import { customModel } from '@/lib/ai';
import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
  getChatById,
  updateChatVisiblityById,
  updateChatModelById
} from '@/prisma/queries';
import { VisibilityType } from '@/components/visibility-selector';

export async function saveModelId(chatId: string, model: string) {
  const chat = await getChatById({ id: chatId });
  
  // Only update if chat exists
  if (chat) {
    await updateChatModelById({ chatId, model });
    // Remove revalidation since we're handling state client-side
  }
}

export async function generateTitleFromUserMessage({
  message,
  model,
}: {
  message: CoreUserMessage;
  model: string;
}) {
  const { text: title } = await generateText({
    model: customModel(model),
    system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
    prompt: JSON.stringify(message),
  });

  return title;
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const message = await getMessageById({ id });

  if (!message) {
    throw new Error(`Message with id ${id} not found`);
  }

  await deleteMessagesByChatIdAfterTimestamp({
    chatId: message.chatId,
    timestamp: message.createdAt,
  });
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  await updateChatVisiblityById({ chatId, visibility });
}
