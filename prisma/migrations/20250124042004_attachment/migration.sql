/*
  Warnings:

  - You are about to drop the column `attachments` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "attachments";

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
