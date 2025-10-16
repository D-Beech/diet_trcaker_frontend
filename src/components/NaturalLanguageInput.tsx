import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Mic, MicOff, Send, Loader2 } from 'lucide-react';

interface NaturalLanguageInputProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: string) => void;
  title: string;
  placeholder?: string;
  isLoading?: boolean;
}

export function NaturalLanguageInput({
  isOpen,
  onClose,
  onSubmit,
  title,
  placeholder = "Describe what you ate or did...",
  isLoading = false
}: NaturalLanguageInputProps) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  // Initialize speech recognition
  const initSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      setRecognition(recognition);
      return recognition;
    }
    return null;
  };

  const startRecording = () => {
    const rec = recognition || initSpeechRecognition();
    if (rec) {
      rec.start();
    }
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
    }
  };

  const handleSubmit = () => {
    if (input.trim()) {
      onSubmit(input.trim());
      setInput('');
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className="pr-20"
              disabled={isLoading}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isLoading}
                className="h-8 w-8 p-0"
              >
                {isRecording ? (
                  <MicOff className="h-4 w-4 text-red-500" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!input.trim() || isLoading}
                className="h-8 w-8 p-0"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>💡 Examples:</p>
            <ul className="mt-1 space-y-1 text-xs">
              <li>• "I had a chicken breast and rice for lunch"</li>
              <li>• "Ran for 30 minutes this morning"</li>
              <li>• "Big Mac and fries"</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
