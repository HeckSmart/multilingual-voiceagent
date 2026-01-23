import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Mic, MicOff } from "lucide-react";
import { toast } from "sonner";

interface VoiceCallProps {
  conversationId: string;
  onTranscript?: (text: string) => void;
  onResponse?: (text: string) => void;
  apiUrl?: string;
  language?: "en" | "hi";
}

export default function VoiceCall({
  conversationId,
  onTranscript,
  onResponse,
  apiUrl = "http://localhost:8000",
  language = "en",
}: VoiceCallProps) {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [noResponseCount, setNoResponseCount] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const noResponseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSpeakingRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCall();
    };
  }, []);

  const getSupportedMimeType = (): string | null => {
    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/ogg;codecs=opus",
    ];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return null;
  };

  const detectSilence = useCallback(() => {
    // Reset silence timer
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    
    // Reset no-response timer when user speaks
    if (noResponseTimerRef.current) {
      clearTimeout(noResponseTimerRef.current);
      setNoResponseCount(0);
    }

    // If user stops speaking for 1.5 seconds, process the audio
    silenceTimerRef.current = setTimeout(async () => {
      if (isListening && !isSpeakingRef.current && audioChunksRef.current.length > 0) {
        await processCurrentAudio();
      }
    }, 1500);
  }, [isListening]);

  const handleNoResponse = useCallback(async () => {
    // If user doesn't respond for 3 seconds, prompt naturally
    if (isListening && !isSpeakingRef.current && audioChunksRef.current.length === 0) {
      setNoResponseCount(prev => {
        const newCount = prev + 1;
        
        if (newCount < 2) {
          const prompts = {
            hi: [
              "बोलिए, मैं सुन रहा हूं।",
              "क्या आप वहाँ हैं?",
              "मैं यहाँ हूं, बताइए?",
            ],
            en: [
              "I'm listening, go ahead.",
              "Are you there?",
              "I'm here, what do you need?",
            ],
          };
          
          const prompt = language === "hi"
            ? prompts.hi[Math.floor(Math.random() * prompts.hi.length)]
            : prompts.en[Math.floor(Math.random() * prompts.en.length)];
          
          // Speak prompt asynchronously
          speakResponse(prompt);
        }
        
        return newCount;
      });
    }
  }, [isListening, language]);

  const startCall = async () => {
    try {
      // Check browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast.error("Your browser doesn't support microphone access.");
        return;
      }

      // Check HTTPS/localhost
      const isSecure =
        window.location.protocol === "https:" ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

      if (!isSecure) {
        toast.error("Microphone access requires HTTPS or localhost.");
        return;
      }

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      setIsCallActive(true);
      setIsListening(true);

      // Start recording
      const mimeType = getSupportedMimeType();
      const options = mimeType ? { mimeType } : {};

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          detectSilence(); // Reset silence timer on new audio
        }
      };

      mediaRecorder.onstop = async () => {
        // Process audio when recording stops
        if (audioChunksRef.current.length > 0) {
          await processCurrentAudio();
        }
      };

      // Start recording with small chunks for real-time feel
      mediaRecorder.start(100);

      // Wait a moment for microphone to stabilize, then send greeting
      // Don't start listening until greeting is done
      setIsListening(false); // Pause listening during greeting
      setNoResponseCount(0); // Reset no-response counter
      
      setTimeout(async () => {
        console.log("Sending greeting...");
        await sendGreeting();
        console.log("Greeting sent, resuming listening...");
        toast.success("Call started! Bot is speaking...");
        
        // Resume listening after greeting finishes
        setTimeout(() => {
          setIsListening(true);
          
          // Start no-response timer
          noResponseTimerRef.current = setTimeout(() => {
            handleNoResponse();
          }, 3000); // Prompt after 3 seconds of silence
        }, 2000); // Wait for speech to finish
      }, 500);
    } catch (error: any) {
      console.error("Error starting call:", error);
      let errorMessage = "Could not start call. ";

      if (error.name === "NotAllowedError") {
        errorMessage += "Please allow microphone access.";
      } else if (error.name === "NotFoundError") {
        errorMessage += "No microphone found.";
      } else {
        errorMessage += error.message || "Unknown error";
      }

      toast.error(errorMessage);
    }
  };

  const stopCall = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    
    if (noResponseTimerRef.current) {
      clearTimeout(noResponseTimerRef.current);
    }

    setIsCallActive(false);
    setIsListening(false);
    setIsProcessing(false);
    setTranscript("");
    setNoResponseCount(0);
    audioChunksRef.current = [];
  };

  const sendGreeting = async () => {
    // Casual, friendly greetings like friends talk
    const greetings = {
      hi: [
        "हैलो! क्या चाहिए?",
        "हैलो! बताओ क्या help चाहिए?",
        "हैलो! क्या जरूरत है?",
        "हैलो! क्या हो रहा है?",
      ],
      en: [
        "Hey! What do you need?",
        "Hello! What's up?",
        "Hi! How can I help?",
        "Hey! What do you want?",
      ],
    };
    
    const greetingText = language === "hi" 
      ? greetings.hi[Math.floor(Math.random() * greetings.hi.length)]
      : greetings.en[Math.floor(Math.random() * greetings.en.length)];

    // Speak greeting immediately (voice-only, no text display)
    await speakResponse(greetingText);
  };

  const processCurrentAudio = async () => {
    if (audioChunksRef.current.length === 0 || isProcessing) return;

    setIsProcessing(true);
    setIsListening(false);

    try {
      const blobType =
        mediaRecorderRef.current?.mimeType || "audio/webm";
      const audioBlob = new Blob(audioChunksRef.current, {
        type: blobType,
      });

      // Convert to base64
      const base64Audio = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

      // Send to backend
      const response = await fetch(`${apiUrl}/voice/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          audio_data: base64Audio,
          language: language === "hi" ? "hi-IN" : "en-US",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process voice");
      }

      const data = await response.json();

      // Handle proactive prompts (when no speech detected)
      if (data.proactive_prompt) {
        // Bot is proactively speaking because no speech was detected
        if (data.response_text) {
          await speakResponse(data.response_text);
        }
        
        // Reset and continue listening
        audioChunksRef.current = [];
        setTimeout(() => {
          setIsListening(true);
          if (mediaRecorderRef.current && streamRef.current) {
            mediaRecorderRef.current.start(100);
          }
          
          // Start no-response timer
          if (noResponseTimerRef.current) {
            clearTimeout(noResponseTimerRef.current);
          }
          noResponseTimerRef.current = setTimeout(() => {
            handleNoResponse();
          }, 3000);
        }, 2000);
        
        setIsProcessing(false);
        return;
      }

      // Normal response with speech detected
      if (data.transcribed_text) {
        setTranscript(data.transcribed_text);
      }

      // Speak response (voice-only, no text display)
      if (data.response_text) {
        await speakResponse(data.response_text);
      }

      // Clear audio chunks for next recording
      audioChunksRef.current = [];

      // Continue listening if call is still active - natural pause
      if (isCallActive && !data.should_end && !data.needs_escalation) {
        // Reset no-response counter after successful interaction
        setNoResponseCount(0);
        
        // Wait for bot to finish speaking, then resume listening
        setTimeout(() => {
          setIsListening(true);
          if (mediaRecorderRef.current && streamRef.current) {
            mediaRecorderRef.current.start(100);
          }
          
          // Start no-response timer again
          if (noResponseTimerRef.current) {
            clearTimeout(noResponseTimerRef.current);
          }
          noResponseTimerRef.current = setTimeout(() => {
            handleNoResponse();
          }, 3000);
        }, 1500); // Natural pause after response
      } else {
        stopCall();
      }
    } catch (error) {
      console.error("Error processing audio:", error);
      toast.error("Failed to process voice. Please try again.");

      // Continue listening on error
      if (isCallActive) {
        setTimeout(() => {
          setIsListening(true);
          if (mediaRecorderRef.current && streamRef.current) {
            mediaRecorderRef.current.start(100);
          }
        }, 1000);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const processTextMessage = async (text: string) => {
    try {
      const response = await fetch(`${apiUrl}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          text: text,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.text && onResponse) {
          onResponse(data.text);
        }
      }
    } catch (error) {
      console.error("Error processing text:", error);
    }
  };

  const speakResponse = async (text: string) => {
    isSpeakingRef.current = true;

    // Use Web Speech API for TTS (browser built-in)
    if ("speechSynthesis" in window) {
      // Cancel any ongoing speech
      speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set language
      if (language === "hi") {
        utterance.lang = "hi-IN";
        // Try to find Hindi voice
        const voices = speechSynthesis.getVoices();
        const hindiVoice = voices.find(
          (voice) => voice.lang.startsWith("hi") || voice.name.includes("Hindi")
        );
        if (hindiVoice) {
          utterance.voice = hindiVoice;
          console.log("Using Hindi voice:", hindiVoice.name);
        } else {
          console.warn("Hindi voice not found, using default");
        }
      } else {
        utterance.lang = "en-US";
        // Try to find a good English voice
        const voices = speechSynthesis.getVoices();
        const englishVoice = voices.find(
          (voice) => voice.lang.startsWith("en") && voice.name.includes("Female")
        ) || voices.find((voice) => voice.lang.startsWith("en"));
        if (englishVoice) {
          utterance.voice = englishVoice;
        }
      }

      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      await new Promise<void>((resolve) => {
        let resolved = false;
        
        utterance.onend = () => {
          if (!resolved) {
            console.log("Speech ended successfully");
            isSpeakingRef.current = false;
            resolved = true;
            resolve();
          }
        };
        utterance.onerror = (error) => {
          if (!resolved) {
            console.error("Speech error:", error);
            isSpeakingRef.current = false;
            resolved = true;
            resolve();
          }
        };
        utterance.onstart = () => {
          console.log("Speech started:", text.substring(0, 50));
        };
        
        // Ensure voices are loaded before speaking
        const voices = speechSynthesis.getVoices();
        if (voices.length === 0) {
          // Wait for voices to load
          const checkVoices = setInterval(() => {
            const newVoices = speechSynthesis.getVoices();
            if (newVoices.length > 0) {
              clearInterval(checkVoices);
              console.log("Voices loaded, speaking now...");
              speechSynthesis.speak(utterance);
            }
          }, 100);
          
          // Timeout after 2 seconds
          setTimeout(() => {
            clearInterval(checkVoices);
            if (!resolved) {
              console.log("Voices timeout, speaking anyway...");
              speechSynthesis.speak(utterance);
            }
          }, 2000);
        } else {
          // Voices already loaded, speak immediately
          console.log("Voices ready, speaking immediately...");
          speechSynthesis.speak(utterance);
        }
      });
    } else {
      // Fallback: just wait a bit
      console.warn("Speech synthesis not supported");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      isSpeakingRef.current = false;
    }
  };

  // Load voices when component mounts
  useEffect(() => {
    if ("speechSynthesis" in window) {
      // Chrome needs this - load voices immediately
      const voices = speechSynthesis.getVoices();
      console.log("Available voices:", voices.map(v => `${v.name} (${v.lang})`));
      
      const loadVoices = () => {
        const updatedVoices = speechSynthesis.getVoices();
        console.log("Voices loaded:", updatedVoices.length);
        // Log Hindi voices specifically
        const hindiVoices = updatedVoices.filter(v => v.lang.startsWith("hi"));
        if (hindiVoices.length > 0) {
          console.log("Hindi voices found:", hindiVoices.map(v => v.name));
        } else {
          console.warn("No Hindi voices found. Browser may not support Hindi TTS.");
        }
      };
      
      // Chrome needs this event
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
      }
      
      // Also try loading immediately
      loadVoices();
    }
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-3">
        <Button
          onClick={isCallActive ? stopCall : startCall}
          disabled={isProcessing}
          className={`rounded-full p-4 ${
            isCallActive
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
          title={isCallActive ? "End call" : "Start voice call"}
        >
          {isCallActive ? (
            <PhoneOff className="w-6 h-6" />
          ) : (
            <Phone className="w-6 h-6" />
          )}
        </Button>

        {isCallActive && (
          <div className="flex items-center gap-2">
            {isListening && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-gray-600">Listening...</span>
              </div>
            )}
            {isProcessing && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-sm text-gray-600">Processing...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Voice-only mode - transcript hidden by default, show only for debugging */}
      {false && transcript && (
        <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded">
          You said: {transcript}
        </div>
      )}
    </div>
  );
}
