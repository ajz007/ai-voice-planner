import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import MDEditor, { commands } from '@uiw/react-md-editor';
import { useToast } from "@/hooks/use-toast";

interface EditNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  text: string;
  onSave: (newText: string) => Promise<void>;
}

export function EditNoteDialog({ open, onOpenChange, text, onSave }: EditNoteDialogProps) {
  const [editedText, setEditedText] = useState(text);
  const { toast } = useToast();

  useEffect(() => {
    setEditedText(text);
  }, [text]);

  const handleSave = async () => {
    try {
      await onSave(editedText);
      onOpenChange(false);
      toast({
        title: "Success",
        description: "Note updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Edit Note</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div data-color-mode="light" className="w-full">
            <MDEditor
              value={editedText}
              onChange={(val) => setEditedText(val || '')}
              preview="live"
              height={400}
              hideToolbar={false}
              enableScroll={true}
              commands={[
                commands.bold,
                commands.italic,
                commands.strikethrough,
                commands.hr,
                commands.title,
                commands.divider,
                commands.link,
                commands.quote,
                commands.code,
                commands.image,
                commands.divider,
                commands.unorderedList,
                commands.orderedList,
                commands.checkedList,
                commands.divider,
                {
                  name: 'table',
                  keyCommand: 'table',
                  buttonProps: { 'aria-label': 'Insert table' },
                  icon: <span>Table</span>,
                  execute: (state, api) => {
                    let modifyText = `
| Header | Header |
| ------ | ------ |
| Cell   | Cell   |
| Cell   | Cell   |
`;
                    api.replaceSelection(modifyText);
                  },
                },
              ]}
              textareaProps={{
                placeholder: "Enter your note text here... Use Markdown for formatting:\n# Heading\n**Bold** *Italic*\n```\nCode block\n```\n- List item",
              }}
            />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
