import { auth } from '@/app/(auth)/auth';
import { deleteChatById, getChatById } from '@/prisma/queries';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const params = await context.params;
    const chatId = params.id;
    if (!chatId) {
      return new NextResponse('Chat ID is required', { status: 400 });
    }

    const chat = await getChatById({ id: chatId });
    if (!chat) {
      return new NextResponse('Chat not found', { status: 404 });
    }

    if (chat.userId !== session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
      await deleteChatById({ id: chatId });
      return new NextResponse(null, { status: 200 });
    } catch (error) {
      console.error('Error deleting chat and attachments:', error);
      return new NextResponse('Failed to delete chat and its attachments', { status: 500 });
    }
  } catch (error) {
    console.error('Error in delete chat route:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 