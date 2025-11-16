import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Mic, MicOff, Send, Loader2, Keyboard } from 'lucide-react';

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

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
          <DialogDescription className="text-base">
            Describe what you ate, your workout, or weight in natural language
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Input Area */}
          <div className="space-y-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={placeholder}
              className="min-h-[120px] resize-none text-base"
              disabled={isLoading}
              autoFocus
            />

            {/* Voice input button and hints */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                <Button
                  size="sm"
                  variant={isRecording ? "destructive" : "outline"}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isLoading}
                  className="h-9 transition-all"
                  title={isRecording ? "Stop recording" : "Start voice input"}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="h-4 w-4 animate-pulse mr-2" />
                      <span className="text-sm">Recording...</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline text-sm">Voice Input</span>
                    </>
                  )}
                </Button>
                <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                  <Keyboard className="h-3 w-3" />
                  <span>Press Enter to submit</span>
                </div>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                <span className={input.length > 500 ? "text-orange-500 font-medium" : ""}>
                  {input.length}
                </span>
                <span className="text-muted-foreground/60"> / 1000</span>
              </span>
            </div>
          </div>

          {/* Examples Section */}
          <div className="rounded-lg bg-muted/50 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-primary" />
              <p className="text-sm font-medium">Quick Examples</p>
            </div>
            <div className="grid gap-2">
              <button
                onClick={() => setInput("I weigh 70kg, ate 300g chicken breast and 200g rice, did 10 pushups")}
                disabled={isLoading}
                className="text-left text-sm p-2 rounded-md hover:bg-muted transition-colors disabled:opacity-50"
              >
                <span className="text-muted-foreground">"</span>
                <span className="text-foreground">I weigh 70kg, ate 300g chicken breast and 200g rice, did 10 pushups</span>
                <span className="text-muted-foreground">"</span>
              </button>
              <button
                onClick={() => setInput("Ran 5km in 30 minutes")}
                disabled={isLoading}
                className="text-left text-sm p-2 rounded-md hover:bg-muted transition-colors disabled:opacity-50"
              >
                <span className="text-muted-foreground">"</span>
                <span className="text-foreground">Ran 5km in 30 minutes</span>
                <span className="text-muted-foreground">"</span>
              </button>
              <button
                onClick={() => setInput("Breakfast: 2 eggs, whole wheat toast, and coffee")}
                disabled={isLoading}
                className="text-left text-sm p-2 rounded-md hover:bg-muted transition-colors disabled:opacity-50"
              >
                <span className="text-muted-foreground">"</span>
                <span className="text-foreground">Breakfast: 2 eggs, whole wheat toast, and coffee</span>
                <span className="text-muted-foreground">"</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
