import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VoiceRecorder({ onTranscriptUpdate, disabled = false }) {
  const [isRecording, setIsRecording] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        }
      }
      if (finalTranscript) {
        onTranscriptUpdate(finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition event:', event.error);
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscriptUpdate]);

  const toggleRecording = () => {
    if (disabled) return;

    if (!supported) {
      // Simulate speech input for demonstration if browser does not support it
      const simulatedResponses = [
        "In my previous project, I architected a distributed microservices platform using FastAPI and MongoDB with Redis caching, reducing API latency by 45%.",
        "When handling trade-offs between consistency and availability, I evaluated the CAP theorem and chose eventual consistency with idempotent workers.",
        "I led a team of four developers, implementing CI/CD pipelines with GitHub Actions and conducting thorough peer code reviews to maintain 95% test coverage."
      ];
      const randomText = simulatedResponses[Math.floor(Math.random() * simulatedResponses.length)];
      onTranscriptUpdate(randomText);
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Could not start recognition:', err);
      }
    }
  };

  return (
    <div className="flex items-center gap-3">
      <motion.button
        type="button"
        onClick={toggleRecording}
        disabled={disabled}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        className={`px-4 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2.5 transition-all shadow-md ${
          isRecording
            ? 'bg-rose-600 text-white shadow-rose-500/30 animate-pulse'
            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={supported ? 'Click to dictate answer via microphone' : 'Voice synthesis simulation'}
      >
        {isRecording ? (
          <>
            <MicOff className="w-4 h-4 text-white" />
            <span>Stop Speaking</span>
          </>
        ) : (
          <>
            <Mic className="w-4 h-4 text-indigo-400" />
            <span>{supported ? 'Dictate with Voice' : 'Insert Sample Speech'}</span>
          </>
        )}
      </motion.button>

      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono"
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            Listening...
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
