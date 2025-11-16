import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Mic, MicOff, Send, Loader2, Keyboard, Radio } from 'lucide-react';

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
  const [isHoldRecording, setIsHoldRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Hold-to-record functionality
  const startHoldRecording = async () => {
    try {
      console.log('Initializing audio recording...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log(`Audio chunk received: ${event.data.size} bytes`);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('Recording stopped, processing audio...');
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log(`Total audio size: ${audioBlob.size} bytes`);

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());

        // Simulate sending to transcription API
        await simulateTranscription(audioBlob);
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsHoldRecording(true);
      setRecordingDuration(0);

      // Start duration timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 0.1);
      }, 100);

      console.log('Recording started');
    } catch (error) {
      console.error('Microphone access denied:', error);
      alert('Microphone access is required for voice recording');
    }
  };

  const stopHoldRecording = () => {
    if (mediaRecorderRef.current && isHoldRecording) {
      console.log('Stopping recording...');
      mediaRecorderRef.current.stop();
      setIsHoldRecording(false);

      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const simulateTranscription = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    console.log('Sending audio to OpenAI Whisper API...');
    console.log(`Audio format: ${audioBlob.type}, Size: ${audioBlob.size} bytes`);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Fake transcription result
    const fakeTranscriptions = [
      "I ate 2 eggs and toast for breakfast",
      "Ran 5 kilometers in 30 minutes",
      "Had chicken breast with rice and vegetables",
      "Did 3 sets of 10 pushups and 20 situps",
      "Drank a protein shake after workout"
    ];

    const transcription = fakeTranscriptions[Math.floor(Math.random() * fakeTranscriptions.length)];

    console.log('Transcription received from Whisper API');
    console.log(`Transcript: "${transcription}"`);

    setInput(transcription);
    setIsTranscribing(false);
    setRecordingDuration(0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

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

            {/* Voice input buttons and hints */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1">
                {/* Hold to Record Button */}
                <Button
                  size="sm"
                  variant={isHoldRecording ? "destructive" : "default"}
                  onMouseDown={startHoldRecording}
                  onMouseUp={stopHoldRecording}
                  onMouseLeave={stopHoldRecording}
                  onTouchStart={startHoldRecording}
                  onTouchEnd={stopHoldRecording}
                  disabled={isLoading || isTranscribing}
                  className="h-9 transition-all relative overflow-hidden"
                  title="Hold to record voice message"
                >
                  {isHoldRecording ? (
                    <>
                      <Radio className="h-4 w-4 mr-2 animate-pulse" />
                      <span className="text-sm font-medium">{recordingDuration.toFixed(1)}s</span>
                    </>
                  ) : isTranscribing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <span className="text-sm">Transcribing...</span>
                    </>
                  ) : (
                    <>
                      <Radio className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline text-sm">Hold to Record</span>
                    </>
                  )}
                </Button>

                {/* Quick Voice Input (Browser API) */}
                <Button
                  size="sm"
                  variant={isRecording ? "destructive" : "outline"}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isLoading || isHoldRecording || isTranscribing}
                  className="h-9 transition-all"
                  title={isRecording ? "Stop recording" : "Quick voice input"}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="h-4 w-4 animate-pulse mr-2" />
                      <span className="text-sm">Listening...</span>
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4" />
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

            {/* Recording indicator */}
            {isHoldRecording && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                  Recording audio... Release to transcribe
                </span>
              </div>
            )}

            {/* Transcribing indicator */}
            {isTranscribing && (
              <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <Loader2 className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" />
                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                  Sending to OpenAI Whisper API for transcription...
                </span>
              </div>
            )}
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
