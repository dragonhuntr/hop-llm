import type { Attachment } from 'ai';
import { memo } from 'react';
import { Button } from './ui/button';
import { LoaderIcon, CrossSmallIcon } from './icons';

export const PreviewAttachment = memo(function PreviewAttachment({
  attachment,
  isUploading = false,
  onDelete,
}: {
  attachment: Attachment;
  isUploading?: boolean;
  onDelete?: () => void;
}) {
  const { name, url, contentType } = attachment;

  return (
    <div className="flex flex-col gap-2 group relative">
      <div className="w-20 h-16 aspect-video bg-muted rounded-md relative flex flex-col items-center justify-center overflow-x">
        {contentType ? (
          contentType.startsWith('image') ? (
            // NOTE: it is recommended to use next/image for images
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={url}
              alt={name}
              className="rounded-md size-full object-cover"
            />
          ) : (
            <div className="" />
          )
        ) : (
          <div className="" />
        )}

        {isUploading && (
          <div className="animate-spin absolute text-zinc-500">
            <LoaderIcon />
          </div>
        )}

        {!isUploading && onDelete && (
          <Button
            size="icon"
            variant="destructive"
            className="absolute size-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
            }}
          >
            <CrossSmallIcon size={12} />
          </Button>
        )}
      </div>
    </div>
  );
});