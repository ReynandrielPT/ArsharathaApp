import { useState, useRef, useCallback } from 'react';

// Helper function to convert Base64 to an ArrayBuffer
const base64ToArrayBuffer = (base64: string) => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

export const useAudioPlayer = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const play = useCallback((audioContent: string, onEnd: () => void) => {
    if (isSpeaking || !audioContent) {
      if (!audioContent) {
        console.warn("AudioPlayer: play() called with empty audioContent. Skipping.");
        onEnd();
      }
      return;
    }

    try {
      // Initialize AudioContext on user interaction (best practice)
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      // Resume context if it's suspended (required by modern browsers)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const audioBuffer = base64ToArrayBuffer(audioContent);
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      setIsSpeaking(true);

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        onEnd();
      };

      audio.onerror = (e) => {
        console.error('AudioPlayer: Playback error.', e);
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        onEnd();
      };

      audio.play().catch(e => {
        console.error('AudioPlayer: audio.play() promise was rejected.', e);
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        onEnd();
      });

    } catch (error) {
      console.error("AudioPlayer: Error processing audio content.", error);
      onEnd();
    }
  }, [isSpeaking]);

  const cancel = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  return { isSpeaking, play, cancel };
};
