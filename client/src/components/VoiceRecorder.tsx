import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, Square, Loader2 } from 'lucide-react';
import { VoiceRecorder, VoiceTranscriber } from '@/lib/voice';
import { useToast } from '@/hooks/use-toast';

interface Props {
  onRecordingComplete: (text: string, audioBlob?: Blob) => void;
}

export default function VoiceRecorderComponent({ onRecordingComplete }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [currentText, setCurrentText] = useState('');
  const [finalText, setFinalText] = useState('');
  const [recorder] = useState(() => new VoiceRecorder());
  const [transcriber] = useState(() => new VoiceTranscriber());
  const { toast } = useToast();

  const startRecording = useCallback(async () => {
    try {
      await recorder.start();
      transcriber.start((text, isFinal) => {
        if (isFinal) {
          setFinalText(text);
          setCurrentText('');
        } else {
          setCurrentText(text);
        }
      });
      setIsRecording(true);
      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone",
      });
    } catch (err) {
      console.error('Failed to start recording:', err);
      toast({
        title: "Error",
        description: "Failed to start recording. Please check your microphone permissions.",
        variant: "destructive",
      });
    }
  }, [recorder, transcriber, toast]);

  const stopRecording = useCallback(async () => {
    try {
      const audioBlob = await recorder.stop();
      transcriber.stop();
      setIsRecording(false);
      
      // Combine final and current text for the complete transcription
      const completeText = finalText + (currentText ? ' ' + currentText : '');
      onRecordingComplete(completeText, audioBlob);
      
      // Reset both text states
      setCurrentText('');
      setFinalText('');
    } catch (err) {
      console.error('Failed to stop recording:', err);
      toast({
        title: "Error",
        description: "Failed to stop recording. Please try again.",
        variant: "destructive",
      });
    }
  }, [recorder, transcriber, currentText, finalText, onRecordingComplete, toast]);

  return (
    <Card className="p-4 space-y-4">
      {/* Transcription display */}
      <div className="space-y-4">
        {/* Final transcription */}
        {finalText && (
          <div className="p-4 bg-muted rounded-md">
            <h3 className="font-medium mb-2">Final Text:</h3>
            <p className="text-sm leading-relaxed">{finalText}</p>
          </div>
        )}
        
        {/* Current transcription */}
        {currentText && (
          <div className="p-4 bg-background border rounded-md">
            <h3 className="font-medium mb-2">Current Text:</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{currentText}</p>
          </div>
        )}
      </div>

      {/* Recording controls */}
      <div className="flex items-center justify-between">
        <Button
          variant={isRecording ? "destructive" : "default"}
          onClick={isRecording ? stopRecording : startRecording}
          className="w-full"
        >
          {isRecording ? (
            <>
              <Square className="w-4 h-4 mr-2" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 mr-2" />
              Start Recording
            </>
          )}
        </Button>
      </div>

      {/* Recording status */}
      {isRecording && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Recording in progress... Speak clearly into your microphone</span>
        </div>
      )}
    </Card>
  );
}