import { useState, useEffect, useRef, useCallback } from 'react';
import { Language } from '../contexts/SettingsContext';

// Definisikan antarmuka untuk SpeechRecognition, termasuk versi prefixed
interface ISpeechRecognition extends SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
}

// Cek apakah SpeechRecognition API tersedia di window, termasuk versi prefixed
const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const useSpeechRecognition = (language: Language = 'id-ID') => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  // Efek untuk inisialisasi dan cleanup
  useEffect(() => {
    if (!SpeechRecognition) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    const handleResult = (event: SpeechRecognitionEvent) => {
      const fullTranscript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      setTranscript(fullTranscript);
    };

    const handleError = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setError(`Speech recognition error: ${event.error}`);
    };

    const handleEnd = () => {
      setIsListening(false);
    };

    recognition.addEventListener('result', handleResult);
    recognition.addEventListener('error', handleError);
    recognition.addEventListener('end', handleEnd);

    // Cleanup saat komponen unmount
    return () => {
      recognition.removeEventListener('result', handleResult);
      recognition.removeEventListener('error', handleError);
      recognition.removeEventListener('end', handleEnd);
      recognition.stop();
    };
  }, []); // Dijalankan hanya sekali saat mount

  // Efek untuk memperbarui bahasa
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
    }
  }, [language]);

  const startListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (recognition && !isListening) {
      try {
        setTranscript('');
        setError(null);
        recognition.start();
        setIsListening(true);
      } catch (e) {
        console.error("Could not start recognition:", e);
        setError("Could not start speech recognition.");
        setIsListening(false);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current;
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    hasRecognitionSupport: !!SpeechRecognition,
  };
};
