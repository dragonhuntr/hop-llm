import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/app/(auth)/auth';

// Initialize S3 client
// https://supabase.com/docs/guides/storage/s3/authentication?queryGroups=language&language=javascript
const s3Client = new S3Client({
  forcePathStyle: true,
  region: process.env.AWS_REGION,
  endpoint: process.env.AWS_S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Use Blob instead of File since File is not available in Node.js environment
const FileSchema = z.object({
  file: z
    .instanceof(Blob)
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: 'File size should be less than 5MB',
    })
    // Update the file type based on the kind of files you want to accept
    .refine((file) => ['image/jpeg', 'image/png'].includes(file.type), {
      message: 'File type should be JPEG or PNG',
    }),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (request.body === null) {
    return new Response('Request body is empty', { status: 400 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as Blob;

    // Validate the file
    const parsedFile = FileSchema.parse({ file });

    // Get fileName from formData since Blob doesn't have name property
    const fileName = `${Date.now()}-${(formData.get('file') as File).name}`;

    // Convert Blob to Buffer
    const arrayBuffer = await parsedFile.file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload the file to AWS S3
    const uploadCommand = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: fileName,
      Body: buffer,
      ContentType: parsedFile.file.type,
    });

    await s3Client.send(uploadCommand);

    const url = `https://${process.env.PROJECT_ID}.supabase.co/storage/v1/object/public/${process.env.AWS_S3_BUCKET_NAME}/${fileName}`;;
    const contentType = parsedFile.file.type;

    return NextResponse.json({
      url,
      name: fileName,
      contentType,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as any).message }, { status: 400 });
  }
}