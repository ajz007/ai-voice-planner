import { useState, useCallback, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { CreateTaskDialog } from '@/components/CreateTaskDialog';
import { NoteCard } from '@/components/NoteCard';
import VoiceRecorderComponent from '../components/VoiceRecorder';
import { useToast } from '@/hooks/use-toast';
import { db } from '../lib/db';

export function Notes() {
  console.log('Notes: Rendering');
  const [showRecorder, setShowRecorder] = useState(false);
  const [notes, setNotes] = useState<Array<{
    id?: number;
    text: string;
    audioBlob?: Blob;
    timestamp: number;
  }>>([]);
  const { toast } = useToast();

  const fetchNotes = useCallback(async () => {
    try {
      const fetchedNotes = await db.getNotes();
      // Sort notes by timestamp in descending order (latest first)
      setNotes(fetchedNotes.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error('Failed to fetch notes:', error);
      toast({
        title: "Error",
        description: "Failed to load notes. Please refresh the page.",
        variant: "destructive"
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleRecordingComplete = useCallback(async (text: string, audioBlob?: Blob) => {
    try {
      await db.addNote({
        text,
        audioBlob,
        timestamp: Date.now(),
        transcribed: true,
        synced: false
      });
      
      toast({
        title: "Note saved",
        description: "Your voice note has been saved successfully"
      });
      
      setShowRecorder(false);
      fetchNotes(); // Refresh notes after adding a new one
    } catch (error) {
      console.error('Failed to save note:', error);
      toast({
        title: "Error",
        description: "Failed to save note. Please try again.",
        variant: "destructive"
      });
    }
  }, [toast, fetchNotes]);

  const [showCreateTaskDialog, setShowCreateTaskDialog] = useState(false);
  const [selectedNoteText, setSelectedNoteText] = useState('');

  const handleCreateTask = useCallback((noteId: number, noteText: string) => {
    setSelectedNoteText(noteText);
    setShowCreateTaskDialog(true);
  }, []);

  const handleTaskCreated = useCallback(() => {
    setShowCreateTaskDialog(false);
    toast({
      title: "Success",
      description: "Task created from note"
    });
  }, [toast]);

  const handleUpdateNote = useCallback(async (noteId: number, newText: string) => {
    try {
      await db.updateNote(noteId, { text: newText });
      toast({
        title: "Success",
        description: "Note updated successfully",
      });
      fetchNotes(); // Refresh notes after update
    } catch (error) {
      console.error('Failed to update note:', error);
      toast({
        title: "Error",
        description: "Failed to update note. Please try again.",
        variant: "destructive"
      });
    }
  }, [fetchNotes, toast]);

  const handlePlayAudio = useCallback((audioBlob?: Blob) => {
    if (!audioBlob) return;
    
    const url = URL.createObjectURL(audioBlob);
    const audio = new Audio(url);
    audio.play().catch(console.error);
    
    // Clean up the URL after the audio loads
    audio.onloadeddata = () => URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="container max-w-2xl mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Voice Notes</h1>
        {!showRecorder && (
          <Button 
            onClick={() => setShowRecorder(true)}
            variant="default"
          >
            New Note
          </Button>
        )}
      </div>

      {showRecorder && (
        <div className="space-y-4">
          <VoiceRecorderComponent onRecordingComplete={handleRecordingComplete} />
          <Button 
            onClick={() => setShowRecorder(false)}
            variant="outline"
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      )}

      <div className="space-y-4">
        {notes.length === 0 ? (
          <p className="text-muted-foreground">No notes yet. Click "New Note" to create one.</p>
        ) : (
          notes.map((note) => (
            <NoteCard
              key={note.id}
              text={note.text}
              timestamp={note.timestamp}
              hasAudio={!!note.audioBlob}
              onCreateTask={(noteText) => note.id && handleCreateTask(note.id, noteText)}
              onPlayAudio={() => handlePlayAudio(note.audioBlob)}
              onUpdateText={async (newText) => note.id && await handleUpdateNote(note.id, newText)}
            />
          ))
        )}
      </div>

      {/* Task Creation Dialog */}
      {showCreateTaskDialog && (
        <CreateTaskDialog
          open={showCreateTaskDialog}
          onOpenChange={setShowCreateTaskDialog}
          initialDescription={selectedNoteText}
          onTaskCreated={handleTaskCreated}
        />
      )}
    </div>
  );
}