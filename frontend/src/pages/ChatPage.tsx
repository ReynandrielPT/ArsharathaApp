import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket } from '../socket';
import { useNavigate, useParams } from 'react-router-dom';
import { Send, Mic, User, Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Maximize2, Minimize2, MessageSquare } from 'lucide-react';
import { Stage, Layer, Circle, Text as KonvaText, Rect, Arrow } from 'react-konva';
import FileUploader from '../components/FileUploader';
import FilePreview from '../components/FilePreview';
import MessageFilePreview from '../components/MessageFilePreview';
import { useSettings } from '../contexts/SettingsContext';
import { useAudioPlayer } from '../hooks/useAudioPlayer';

interface UploadedFile {
  fileId: string;
  filename: string;
}

interface MessageFile {
  _id: string;
  originalFilename: string; 
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  files?: { _id: string; filename: string; }[];
}

interface Command {
  command: string;
  payload: any;
  delay?: number;
}

interface ChatPageProps {
  sessionId?: string;
  isNew: boolean;
  onSessionCreated: () => void;
}

const ChatPage: React.FC<ChatPageProps> = ({ sessionId: initialSessionId, isNew, onSessionCreated }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [canvasObjects, setCanvasObjects] = useState<any[]>([]);
  const [chatMinimized, setChatMinimized] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [commandQueue, setCommandQueue] = useState<Command[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lessonSteps, setLessonSteps] = useState({ current: 0, total: 0 });
  const [stagedFiles, setStagedFiles] = useState<UploadedFile[]>([]);
  const [isLiveConversationOpen, setIsLiveConversationOpen] = useState(false);
  
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const { varkMode, speechEnabled, adhdEnabled, setVarkMode } = useSettings();
  const { isSpeaking, play, cancel: cancelAudio } = useAudioPlayer();

  const handleSendMessage = async (promptOverride?: string) => {
    const textToSend = promptOverride || inputValue;
    if (!textToSend.trim() || !socket) return;

    const tempUserMessage: Message = { 
      id: Date.now().toString(), 
      type: 'user', 
      content: textToSend, 
      timestamp: new Date(), 
      files: stagedFiles.map(f => ({ _id: f.fileId, filename: f.filename }))
    };

    setMessages(prev => isNew ? [tempUserMessage] : [...prev, tempUserMessage]);
    setIsLoading(true);

    const payload = {
      promptText: textToSend,
      sessionId: isNew ? undefined : sessionId,
      fileIds: stagedFiles.map(f => f.fileId),
      varkMode,
      speechEnabled
    };

    socket.emit('start_session', payload);
    setInputValue('');
    setStagedFiles([]);
  };

  const processCommand = useCallback((command: Command): Promise<void> => {
    return new Promise(resolve => {
      switch (command.command) {
        case 'speak':
          break;
        case 'createText':
        case 'drawArrow':
        case 'drawRectangle':
        case 'drawCircle':
        case 'createTable':
          setCanvasObjects(prev => [...prev, { ...command, id: `${command.command}-${Date.now()}` }]);
          setTimeout(resolve, command.delay || 500);
          break;
        case 'fillTable':
          setCanvasObjects(prev => prev.map(obj =>
            obj.payload.id === command.payload.tableId
            ? { ...obj, payload: { ...obj.payload, cells: [...(obj.payload.cells || []), { ...command.payload }] } }
            : obj
          ));
          setTimeout(resolve, command.delay || 500);
          break;
        case 'clearCanvas':
          setCanvasObjects([]);
          setTimeout(resolve, command.delay || 500);
          break;
        case 'session_end':
          setIsPlaying(false);
          setIsProcessing(false);
          if (sessionId) {
            const token = localStorage.getItem('token');
            fetch(`/api/sessions/${sessionId}/canvas`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ canvasState: canvasObjects })
            });
          }
          resolve();
          break;
        default:
          console.warn(`Unknown command: ${command.command}`);
          resolve();
      }
    });
  }, [canvasObjects, play, sessionId]);

  useEffect(() => {
    if (isPlaying && !isProcessing && commandQueue.length > 0) {
      setIsProcessing(true);
      const command = commandQueue[0];
      processCommand(command).then(() => {
        if (command.command !== 'session_end') {
          setLessonSteps(prev => ({ ...prev, current: prev.current + 1 }));
        }
        setCommandQueue(prev => prev.slice(1));
        setIsProcessing(false);
      });
    } else if (commandQueue.length === 0 && isPlaying) {
      setIsPlaying(false);
    }
  }, [isPlaying, commandQueue, isProcessing, processCommand]);

  const renderCanvasObject = (obj: any) => {
    return null;
  };

  return (
    <div className="h-screen flex bg-slate-100 overflow-hidden">
      <div className={`flex flex-col bg-white border-r border-slate-200 transition-all duration-500 ease-in-out flex-shrink-0 overflow-hidden ${chatMinimized || varkMode === 'R' ? 'w-0' : 'w-full md:w-1/2 lg:w-1/3'}`}>
      </div>
      {varkMode !== 'R' && (
        <div className={`bg-slate-100 relative flex flex-col transition-all duration-500 ease-in-out flex-1`}>
          <div ref={canvasContainerRef} className="flex-1 overflow-hidden bg-gradient-to-br from-blue-50 to-purple-50">
            {canvasSize.width > 0 && (
              <Stage width={canvasSize.width} height={canvasSize.height}>
                <Layer>{canvasObjects.map(renderCanvasObject)}</Layer>
              </Stage>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;