import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileAudio, Send, Edit2 } from 'lucide-react';
import { EditNoteDialog } from './EditNoteDialog';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface NoteCardProps {
  text: string;
  timestamp: number;
  hasAudio: boolean;
  onCreateTask: (noteText: string) => void;
  onPlayAudio?: () => void;
  onUpdateText?: (newText: string) => Promise<void>;
}

export function NoteCard({ text, timestamp, hasAudio, onCreateTask, onPlayAudio, onUpdateText }: NoteCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  // Check if text is long (more than 280 characters or has more than 4 lines)
  const isLongText = text.length > 280 || text.split('\n').length > 4;

  return (
    <Card className="p-4 space-y-3">
      {/* Main content */}
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-medium">
                {text.split('\n')[0].length > 100 
                  ? `${text.split('\n')[0].slice(0, 100)}...` 
                  : text.split('\n')[0]}
              </h3>
              <span className="text-xs text-muted-foreground ml-4">
                {text.length} characters
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{formatDistanceToNow(timestamp, { addSuffix: true })}</p>
          </div>
        </div>
        
        {/* Transcribed text */}
        <div className="bg-muted p-3 rounded-md">
          <div className={`transition-all duration-200 ease-in-out prose prose-sm max-w-none prose-table:my-0 prose-table:border prose-td:border prose-th:border prose-thead:bg-muted-foreground/5 ${!isExpanded && isLongText ? 'line-clamp-4' : ''}`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                table: ({ node, ...props }) => (
                  <table className="border-collapse" {...props} />
                ),
                th: ({ node, ...props }) => (
                  <th className="p-2 font-semibold" {...props} />
                ),
                td: ({ node, ...props }) => (
                  <td className="p-2" {...props} />
                ),
              }}
            >
              {text}
            </ReactMarkdown>
          </div>
          
          {isLongText && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2 h-8 text-xs"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Show less' : 'Show more'}
              <span className="sr-only">
                {isExpanded ? 'Show less text' : 'Show more text'}
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2">
        <Button 
          variant="default" 
          size="sm" 
          onClick={() => onCreateTask(text)}
        >
          <Send className="w-4 h-4 mr-2" />
          Create Task
        </Button>
        {hasAudio && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onPlayAudio}
          >
            <FileAudio className="w-4 h-4 mr-2" />
            Play Original Audio
          </Button>
        )}
        {onUpdateText && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowEditDialog(true)}
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
        )}
      </div>

      {onUpdateText && (
        <EditNoteDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          text={text}
          onSave={onUpdateText}
        />
      )}
    </Card>
  );
}