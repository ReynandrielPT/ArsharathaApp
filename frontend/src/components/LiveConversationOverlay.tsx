import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import './orb.css';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { useSettings } from '../contexts/SettingsContext';

interface LiveConversationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId?: string;
}

interface TranscriptLine {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

const LiveConversationOverlay: React.FC<LiveConversationOverlayProps> = ({ isOpen, onClose, sessionId }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { play: playAudio, cancel: cancelAudio } = useAudioPlayer();
  const { language } = useSettings();

  useEffect(() => {
    if (isOpen && sessionId) {
      const token = localStorage.getItem('token');
      const newSocket = io('/live-conversation', {
        auth: { token },
      });
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('[Live] Connected to live conversation namespace.');
        newSocket.emit('start_conversation', { sessionId, languageCode: language });
      });

      newSocket.on('transcript_update', ({ transcript, isFinal }) => {
        setTranscript(prev => {
          const last = prev[prev.length - 1];
          if (last && last.sender === 'user' && !isFinal) {
            return [...prev.slice(0, -1), { ...last, text: transcript }];
          }
          if (isFinal) {
             return [...prev, { id: `user-${Date.now()}`, sender: 'user', text: transcript }];
          }
          return prev;
        });
      });

      newSocket.on('ai_audio_response', ({ audioContent, transcript: aiTranscript }) => {
        setTranscript(prev => [...prev, { id: `ai-${Date.now()}`, sender: 'ai', text: aiTranscript }]);
        playAudio(audioContent, () => {});
      });

      newSocket.on('stop_ai_playback', () => {
        console.log('[Live] Received stop_ai_playback event. Stopping audio.');
        cancelAudio();
      });
      
      newSocket.on('trigger_visualization', ({ prompt }) => {
        onClose(); // Close the overlay first
        // Use a custom event to communicate back to ChatPage
        window.dispatchEvent(new CustomEvent('triggerVisualization', { detail: { prompt } }));
      });

      return () => {
        console.log('[Live] Disconnecting from live conversation namespace.');
        newSocket.disconnect();
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      };
    }
  }, [isOpen, sessionId, onClose, language]);

  const startRecording = async () => {
    if (socket) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            socket.emit('audio_stream_from_client', event.data);
          }
        };
        
        mediaRecorder.start(500); // Send data every 500ms
        setIsListening(true);
      } catch (err) {
        console.error("Error accessing microphone:", err);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
  };

  const handleClose = () => {
    if (isListening) {
      stopRecording();
    }
    setTranscript([]);
    onClose();
  };

  const toggleListening = () => {
    cancelAudio(); // Interrupt AI speech if user wants to talk
    if (isListening) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div 
      className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-all duration-500 ease-in-out ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div 
        className={`absolute top-0 left-0 h-full bg-white shadow-2xl transition-transform duration-500 ease-in-out w-full md:w-1/2 lg:w-1/3 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="relative w-full h-full flex flex-col">
          {/* Close Button - Top Right */}
          <div className="absolute top-6 right-6 z-30">
            <button
              onClick={handleClose}
              className="group p-3 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 hover:text-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <X size={20} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col items-center justify-center relative">
            {/* Voice Agent Orb */}
            <div className="relative">
              <div className="orb-canvas">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
                <div className="orb orb-3"></div>
              </div>
              
              {/* Mic Button - Positioned below orb */}
              <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2">
                <button
                  onClick={toggleListening}
                  className={`group relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 ${
                    isListening 
                      ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                      : 'bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
                  }`}
                >
                  {isListening ? (
                    <MicOff size={24} className="text-white" />
                  ) : (
                    <Mic size={24} className="text-white" />
                  )}
                  
                  {/* Ripple effect when listening */}
                  {isListening && (
                    <div className="absolute inset-0 rounded-full border-2 border-red-300 animate-ping opacity-75"></div>
                  )}
                </button>
                
                {/* Status Text */}
                <div className="mt-4 text-center">
                  <p className={`text-sm font-medium transition-colors ${
                    isListening ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {isListening ? 'Listening...' : 'Tap to speak'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Transcript Overlay - Translucent at bottom */}
          {transcript.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
              <div className="bg-white/80 backdrop-blur-md border border-gray-200/50 rounded-2xl shadow-xl max-h-48 overflow-y-auto">
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">Live Transcript</span>
                  </div>
                  
                  {transcript.slice(-5).map((line, index) => (
                    <div key={line.id} className={`animate-fade-in-up transition-all duration-300 ${
                      index === transcript.slice(-5).length - 1 ? 'opacity-100' : 'opacity-70'
                    }`}>
                      <div className={`p-3 rounded-xl ${
                        line.sender === 'user' 
                          ? 'bg-blue-50 border-l-3 border-blue-400' 
                          : 'bg-purple-50 border-l-3 border-purple-400'
                      }`}>
                        <div className="flex items-start gap-2">
                          <div className={`text-xs font-semibold uppercase tracking-wide mt-0.5 ${
                            line.sender === 'user' ? 'text-blue-600' : 'text-purple-600'
                          }`}>
                            {line.sender === 'user' ? 'You' : 'AI'}
                          </div>
                          <p className="text-sm text-gray-800 flex-1 leading-relaxed">
                            {line.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default LiveConversationOverlay;