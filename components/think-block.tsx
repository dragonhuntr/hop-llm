'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThinkBlockProps {
  children: string;
  isDoneThinking: boolean;
}

export function ThinkBlock({ children, isDoneThinking }: ThinkBlockProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const content = children;
  
    return (
      <div className="not-prose">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {isDoneThinking ? "Model done thinking" : "Thinking..."}
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", {
              "transform rotate-180": isExpanded
            })}
          />
        </button>
        {isExpanded && (
          <div className="block text-sm w-full overflow-x-auto bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 p-4 border border-purple-200 dark:border-purple-800 rounded-xl whitespace-pre-wrap break-words mt-2">
            {content}
          </div>
        )}
      </div>
    );
  }