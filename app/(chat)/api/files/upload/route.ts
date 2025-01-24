import { PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/app/(auth)/auth';
import { s3Client } from '@/lib/s3';
import { prisma } from '@/prisma/queries';

const fileSchema = z.object({
  file: z
    .any()
    .refine((file) => file instanceof File || file instanceof Blob, {
      message: 'Expected a File or Blob',
    })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: 'File size should be less than 5MB',
    })
    .refine((file) => ['image/jpeg', 'image/png'].includes(file.type), {
      message: 'File type should be JPEG or PNG',
    }),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const chatId = formData.get('chatId') as string;
    const messageId = formData.get('messageId') as string;

    if (!file || !chatId || !messageId) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const validationResult = fileSchema.safeParse({ file });
    if (!validationResult.success) {
      console.error('File validation failed:', validationResult.error);
      return new NextResponse('Invalid file', { status: 400 });
    }

    const validatedFile = validationResult.data.file as File;
    const timestamp = Date.now();
    const fileName = `${timestamp}-${validatedFile.name}`;
    const buffer = Buffer.from(await validatedFile.arrayBuffer());

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: fileName,
      Body: buffer,
      ContentType: validatedFile.type,
    });

    await s3Client.send(command);

    const url = `${process.env.AWS_S3_ENDPOINT}/${process.env.AWS_S3_BUCKET_NAME}/${fileName}`;

    // Get current message
    const message = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!message) {
      return new NextResponse('Message not found', { status: 404 });
    }

    // Update the message with the attachment URL
    await prisma.message.update({
      where: { id: messageId },
      data: {
        attachments: [...message.attachments, url]
      }
    });

    return new NextResponse(JSON.stringify({ url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}