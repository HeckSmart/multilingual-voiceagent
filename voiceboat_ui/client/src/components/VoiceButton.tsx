import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Mic, MicOff } from "lucide-react";
import { toast } from "sonner";

interface VoiceButtonProps {
  conversationId: string;
  onTranscript?: (text: string) => void;
  onResponse?: (text: string) => void;
  apiUrl?: string;
}

export default function VoiceButton({
  conversationId,
  onTranscript,
  onResponse,
  apiUrl = "http://localhost:8000",
}: VoiceButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const getSupportedMimeType = (): string | null => {
    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/ogg;codecs=opus",
      "audio/wav",
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return null; // Browser will use default
  };

  const startRecording = async () => {
    try {
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error(
          "Your browser doesn't support microphone access. Please use Chrome, Firefox, or Edge."
        );
        return;
      }

      // Check if we're on HTTPS or localhost
      const isSecure = window.location.protocol === "https:" || 
                       window.location.hostname === "localhost" ||
                       window.location.hostname === "127.0.0.1";
      
      if (!isSecure) {
        toast.error(
          "Microphone access requires HTTPS. Please use https:// or localhost."
        );
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      streamRef.current = stream;

      // Try to find a supported MIME type
      const mimeType = getSupportedMimeType();
      const options = mimeType ? { mimeType } : {};

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (audioChunksRef.current.length > 0) {
          // Determine blob type from recorder
          const blobType = mediaRecorder.mimeType || "audio/webm";
          const audioBlob = new Blob(audioChunksRef.current, {
            type: blobType,
          });
          await processAudio(audioBlob);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        toast.error("Recording error occurred. Please try again.");
        setIsRecording(false);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
        }
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      toast.success("Recording started - speak now!");
    } catch (error: any) {
      console.error("Error accessing microphone:", error);
      
      let errorMessage = "Could not access microphone. ";
      
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        errorMessage += "Please allow microphone access in your browser settings and try again.";
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        errorMessage += "No microphone found. Please connect a microphone and try again.";
      } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
        errorMessage += "Microphone is being used by another application. Please close it and try again.";
      } else if (error.name === "OverconstrainedError") {
        errorMessage += "Microphone doesn't support required settings. Trying with basic settings...";
        // Retry with basic settings
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          streamRef.current = stream;
          const mimeType = getSupportedMimeType();
          const options = mimeType ? { mimeType } : {};
          const mediaRecorder = new MediaRecorder(stream, options);
          mediaRecorderRef.current = mediaRecorder;
          audioChunksRef.current = [];
          
          mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              audioChunksRef.current.push(event.data);
            }
          };
          
          mediaRecorder.onstop = async () => {
            if (audioChunksRef.current.length > 0) {
              const blobType = mediaRecorder.mimeType || "audio/webm";
              const audioBlob = new Blob(audioChunksRef.current, { type: blobType });
              await processAudio(audioBlob);
            }
          };
          
          mediaRecorder.start(100);
          setIsRecording(true);
          toast.success("Recording started!");
          return;
        } catch (retryError) {
          errorMessage = "Failed to access microphone even with basic settings.";
        }
      } else {
        errorMessage += `Error: ${error.message || "Unknown error"}`;
      }
      
      toast.error(errorMessage, {
        duration: 5000,
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsCalling(true);
    try {
      // Convert blob to base64
      const base64Audio = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          const base64 = result.split(",")[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      const response = await fetch(`${apiUrl}/voice/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          audio_data: base64Audio,
          language: "en-US",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to process voice");
      }

      const data = await response.json();

      if (data.transcribed_text && onTranscript) {
        onTranscript(data.transcribed_text);
      }

      if (data.response_text && onResponse) {
        onResponse(data.response_text);
      }

      // Play audio response if available
      if (data.audio) {
        playAudioResponse(data.audio);
      }

      toast.success("Voice processed successfully");
    } catch (error) {
      console.error("Error processing audio:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to process voice. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsCalling(false);
    }
  };

  const playAudioResponse = (base64Audio: string) => {
    try {
      const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
        // If audio playback fails, just show the text response
      });
    } catch (error) {
      console.error("Error creating audio:", error);
    }
  };

  const handleToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Check browser support on mount
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn("getUserMedia not supported in this browser");
    }
  }, []);

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleToggle}
        disabled={isCalling}
        className={`rounded-full p-3 ${
          isRecording
            ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
            : "bg-green-600 hover:bg-green-700 text-white"
        }`}
        title={
          isRecording
            ? "Click to stop recording"
            : "Click to start voice recording"
        }
      >
        {isRecording ? (
          <MicOff className="w-5 h-5" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </Button>
      {isRecording && (
        <span className="text-sm text-red-600 font-medium animate-pulse">
          Recording...
        </span>
      )}
      {isCalling && (
        <span className="text-sm text-gray-600 animate-pulse">Processing...</span>
      )}
    </div>
  );
}
