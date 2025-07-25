import React, { useState, useRef, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { getSocket } from '../socket';
import { useNavigate, useParams } from 'react-router-dom';
import { Send, Mic, User, Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Maximize2, Minimize2, MessageSquare } from 'lucide-react';
import vikaaiBotIcon from '../../assets/logo-vika.svg';
import vikaaiIcon from '../../assets/logo-vika.svg';
import { Stage, Layer, Circle, Text as KonvaText, Rect, Arrow } from 'react-konva';
import AIVoiceAgent from './AIVoiceAgent';
import FileUploader from './FileUploader';
import FilePreview from './FilePreview';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import MessageFilePreview from './MessageFilePreview';
import LiveConversationOverlay from './LiveConversationOverlay';
import { useSettings } from '../contexts/SettingsContext';

// --- Main Component Interfaces ---

/**
 * Represents a file that has been successfully uploaded and is staged for the next message.
 */
interface UploadedFile {
  fileId: string;
  filename: string;
}

/**
 * Represents a file that is associated with a saved message in the database.
 */
interface MessageFile {
  _id: string;
  originalFilename: string; 
}

/**
 * Represents a single message in the chat interface, from either the user or the AI.
 */
interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  files?: { _id: string; filename: string; }[];
}

/**
 * Represents a single command received from the backend to be executed on the frontend.
 */
interface Command {
  command: string;
  payload: any;
  delay?: number;
}

/**
 * Props for the ChatPage component.
 */
interface ChatPageProps {
  /** The ID of the session, if it already exists. */
  sessionId?: string;
  /** Flag indicating if this is a new, unsaved session. */
  isNew: boolean;
  /** Callback function to refresh the session list in the parent component when a new session is created. */
  onSessionCreated: () => void;
}

/**
 * The core component for the conversational learning experience.
 * It manages the chat interface, the visual learning canvas, and all real-time communication
 * with the backend via Socket.IO for a specific learning session.
 */

const ChatPage: React.FC<ChatPageProps> = ({ sessionId: initialSessionId, isNew, onSessionCreated }) => {
  // --- State Management ---
  const [socket, setSocket] = useState<Socket | null>(null); // Socket.IO client instance for real-time communication.
  const [messages, setMessages] = useState<Message[]>([]); // Stores all chat messages (user and AI).
  const [inputValue, setInputValue] = useState(''); // Current text in the message input field.
  const [isLoading, setIsLoading] = useState(false); // Tracks when waiting for an AI response.
  const [isPlaying, setIsPlaying] = useState(false); // Controls the playback of canvas commands.
  const [currentTranscript, setCurrentTranscript] = useState(''); // Displays the AI's live speech text.
  const [canvasObjects, setCanvasObjects] = useState<any[]>([]); // Stores objects to be rendered on the Konva canvas.
  const [chatMinimized, setChatMinimized] = useState(false); // Controls the visibility/size of the chat panel.
  const [isTransitioning, setIsTransitioning] = useState(false); // For smooth UI animations during chat panel minimization.
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 }); // Dimensions of the Konva canvas.
  const [commandQueue, setCommandQueue] = useState<Command[]>([]); // Queue of commands received from the backend for canvas and speech.
  const [isProcessing, setIsProcessing] = useState(false); // Ensures commands are processed one at a time.
  const [lessonSteps, setLessonSteps] = useState({ current: 0, total: 0 }); // Tracks progress through the AI-generated lesson.
  const [stagedFiles, setStagedFiles] = useState<UploadedFile[]>([]); // Files selected by the user to be sent with the next message.
  const [isLiveConversationOpen, setIsLiveConversationOpen] = useState(false); // Controls visibility of the live conversation overlay.
  
  // --- Hooks and Refs ---
  const navigate = useNavigate(); // Hook for programmatic navigation.
  const { sessionId } = useParams<{ sessionId: string }>(); // Extracts session ID from the URL.
  const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for auto-scrolling chat messages.
  const canvasContainerRef = useRef<HTMLDivElement>(null); // Ref for the canvas container to determine its size.

  const { language } = useSettings(); // Retrieves current language setting from context.
  const { isSpeaking, play, cancel: cancelAudio } = useAudioPlayer(); // Hook for playing audio (TTS).
  const { isListening, transcript, startListening, stopListening, hasRecognitionSupport } = useSpeechRecognition(language); // Hook for speech-to-text.

  // --- Effects ---

  /**
   * Effect hook to update the input field with the live transcript from speech recognition.
   * This provides real-time feedback to the user as they speak.
   */
  useEffect(() => {
    if (transcript) {
      setInputValue(transcript);
    }
  }, [transcript]); // Dependency array: re-run when transcript changes.

  /**
   * Handles the click event for the microphone button.
   * Toggles between starting and stopping speech recognition.
   */
  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Calculates the total number of files associated with the current session,
  // including already sent files and newly staged files.
  const existingFileCount = messages.reduce((acc, msg) => acc + (msg.files?.length || 0), 0);
  const totalFiles = existingFileCount + stagedFiles.length;

  /**
   * Resets the component's state to a clean slate.
   * This is typically called when starting a new session or switching between existing sessions.
   */
  const handleReset = () => {
    setIsPlaying(false);
    setCommandQueue([]);
    setIsProcessing(false);
    setCanvasObjects([]);
    setCurrentTranscript('');
    cancelAudio(); // Stop any currently playing audio.
    setLessonSteps({ current: 0, total: 0 });
    setStagedFiles([]);
    if (isListening) {
      stopListening(); // Stop listening if active.
    }
  };

  /**
   * Effect hook to fetch historical messages and canvas state when a session ID is provided.
   * This loads the previous state of a learning session when the user navigates to it.
   */
  useEffect(() => {
    handleReset(); // Reset state when changing sessions to avoid stale data.
    if (!isNew && sessionId) { // Only fetch if it's an existing session.
      const fetchAndSetMessages = async (id: string) => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        try {
          const response = await fetch(`/api/sessions/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` } // Authenticate the request.
          });
          if (response.ok) {
            const data = await response.json();
            const backendMessages = data.messages;
            const session = data.session;

            // Restore canvas state if it exists in the fetched session data.
            if (session.canvasState) {
              setCanvasObjects(session.canvasState);
            }

            // Format backend messages for frontend display.
            const formattedMessages: Message[] = backendMessages.map((msg: any) => {
              let messageContent = msg.text;
              // For AI messages, parse the command stream to find the spoken text.
              // This is necessary because AI messages store the raw command JSON.
              if (msg.sender === 'ai') {
                try {
                  const commands = JSON.parse(msg.text);
                  const speakCommands = commands.filter((c: Command) => c.command === 'speak');
                  messageContent = speakCommands.length > 0 ? speakCommands.map((c: Command) => c.payload.text).join(' ') : '[AI visual response]';
                } catch (e) {
                  // Fallback for non-JSON AI messages or parsing errors.
                  messageContent = '[AI visual response]';
                }
              }
              return {
                id: msg._id,
                type: msg.sender as 'user' | 'ai',
                content: messageContent,
                timestamp: new Date(msg.createdAt),
                files: msg.fileIds ? msg.fileIds.map((f: MessageFile) => ({ _id: f._id, filename: f.originalFilename })) : []
              };
            });
            setMessages(formattedMessages);
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchAndSetMessages(sessionId);
    } else {
      // Clear messages for a new session to start fresh.
      setMessages([]);
    }
  }, [sessionId, isNew]); // Dependency array: re-run when sessionId or isNew changes.

  /**
   * Effect hook to set up and tear down Socket.IO event listeners for the session.
   * This handles real-time updates from the backend.
   */
  useEffect(() => {
    const currentSocket = getSocket(); // Get the singleton Socket.IO instance.
    setSocket(currentSocket);

    // Handles the creation of a new session, updating the URL and refreshing the sidebar.
    const handleSessionCreated = (data: { sessionId: string }) => {
      navigate(`/app/${data.sessionId}`, { replace: true }); // Update URL without adding to history.
      onSessionCreated(); // Refresh the session list in the sidebar.
    };

    // Handles receiving the stream of commands from the backend.
    // These commands drive the visual and audio responses.
    const handleCommandStreamReceived = (data: { sessionId: string; commands: Command[] }) => {
      if (data.sessionId === (sessionId || (isNew && data.sessionId))) { // Ensure commands are for the current session.
        setIsLoading(false);
        setCommandQueue(data.commands); // Load commands into the queue.
        // Calculate total lesson steps, excluding the 'session_end' command.
        setLessonSteps({ current: 0, total: data.commands.filter(c => c.command !== 'session_end').length });
        setIsPlaying(true); // Start playing the commands.
      }
    };

    // Handles session-related errors from the backend.
    const handleSessionError = (error: { message: string }) => {
      console.error("Session Error:", error.message);
      setIsLoading(false);
      // A toast notification would be appropriate here to inform the user.
    };

    // Register event listeners.
    currentSocket.on('session_created', handleSessionCreated);
    currentSocket.on('command_stream_received', handleCommandStreamReceived);
    currentSocket.on('session_error', handleSessionError);

    // Cleanup function: remove event listeners when the component unmounts or dependencies change.
    return () => {
      currentSocket.off('session_created', handleSessionCreated);
      currentSocket.off('command_stream_received', handleCommandStreamReceived);
      currentSocket.off('session_error', handleSessionError);
    };
  }, [onSessionCreated, navigate, sessionId, isNew]); // Dependency array.

  /**
   * Callback function for when files are successfully uploaded.
   * Adds the new files to the stagedFiles state.
   * @param {UploadedFile[]} newFiles - An array of newly uploaded files.
   */
  const handleUploadComplete = (newFiles: UploadedFile[]) => {
    setStagedFiles(prev => [...prev, ...newFiles]);
  };

  /**
   * Callback function to remove a staged file.
   * @param {string} fileIdToRemove - The ID of the file to remove.
   */
  const handleRemoveFile = (fileIdToRemove: string) => {
    setStagedFiles(prev => prev.filter(file => file.fileId !== fileIdToRemove));
  };

  /**
   * Effect hook to listen for a global 'triggerVisualization' event.
   * This event is dispatched from the LiveConversationOverlay to send a prompt
   * to the main chat interface, effectively triggering a visual explanation.
   */
  useEffect(() => {
    const handleTriggerVisualization = (event: Event) => {
      const customEvent = event as CustomEvent<{ prompt: string }>;
      if (customEvent.detail.prompt) {
        setInputValue(customEvent.detail.prompt); // Set the input value with the prompt from the event.
        // Use a timeout to ensure the state updates before programmatically sending the message.
        setTimeout(() => {
          const sendButton = document.getElementById('send-button');
          if (sendButton) {
            sendButton.click(); // Programmatically click the send button.
          } else {
            // Fallback if the button isn't found (e.g., for testing or unexpected DOM changes).
            handleSendMessage(customEvent.detail.prompt);
          }
        }, 100);
      }
    };

    window.addEventListener('triggerVisualization', handleTriggerVisualization);

    // Cleanup function to remove the event listener.
    return () => {
      window.removeEventListener('triggerVisualization', handleTriggerVisualization);
    };
  }, []);

  /**
   * Sends the user's message and any staged files to the backend to start or continue a session.
   * This function handles both text input and speech-to-text input.
   * @param {string} [promptOverride] - An optional prompt to use instead of the current input value.
   */
  const handleSendMessage = async (promptOverride?: string) => {
    // Determine the text to send: override, speech transcript, or current input value.
    const textToSend = promptOverride || (isListening ? transcript : inputValue);
    if (!textToSend.trim() || !socket) return; // Prevent sending empty messages or if socket is not ready.
    
    if (isListening) stopListening(); // Stop listening if speech recognition is active.
    handleReset(); // Reset canvas and audio states for the new interaction.

    // Optimistically update the UI with the user's message for immediate feedback.
    const tempUserMessage: Message = { 
      id: Date.now().toString(), 
      type: 'user', 
      content: textToSend, 
      timestamp: new Date(), 
      files: stagedFiles.map(f => ({ _id: f.fileId, filename: f.filename })) // Include staged files.
    };

    setMessages(prev => isNew ? [tempUserMessage] : [...prev, tempUserMessage]); // Add message to chat history.
    setIsLoading(true); // Indicate that an AI response is pending.

    // Prepare the payload for the 'start_session' Socket.IO event.
    const payload = {
      promptText: textToSend,
      sessionId: isNew ? undefined : sessionId, // Pass sessionId only for existing sessions.
      fileIds: stagedFiles.map(f => f.fileId), // Send IDs of staged files.
      languageCode: language // Include the current language setting.
    };

    socket.emit('start_session', payload); // Emit the event to the backend.
    setInputValue(''); // Clear the input field.
    setStagedFiles([]); // Clear staged files.
  };

  /**
   * Effect hook to process the command queue one command at a time.
   * This drives the sequential execution of AI-generated visual and audio responses.
   */
  useEffect(() => {
    // Only process if playing, not already processing, and there are commands in the queue.
    if (isPlaying && !isProcessing && commandQueue.length > 0) {
      setIsProcessing(true); // Set processing flag to prevent concurrent execution.
      const command = commandQueue[0]; // Get the first command.
      processCommand(command).then(() => { // Process the command asynchronously.
        if (command.command !== 'session_end') {
          setLessonSteps(prev => ({ ...prev, current: prev.current + 1 })); // Update lesson progress.
        }
        setCommandQueue(prev => prev.slice(1)); // Remove the processed command from the queue.
        setIsProcessing(false); // Reset processing flag.
      });
    } else if (commandQueue.length === 0 && isPlaying) {
      setIsPlaying(false); // Stop playing when the queue is empty.
    }
  }, [isPlaying, commandQueue, isProcessing]); // Dependency array: re-run when these states change.

  /**
   * Executes a single command from the command queue.
   * This function interprets the command type and updates the canvas or plays audio accordingly.
   * @param {Command} command - The command object to process.
   * @returns {Promise<void>} A promise that resolves when the command is finished executing.
   */
  const processCommand = (command: Command): Promise<void> => {
    return new Promise(resolve => {
      switch (command.command) {
        case 'speak':
          setCurrentTranscript(command.payload.text); // Display the AI's spoken text.
          const aiMessage: Message = { id: `${Date.now()}-ai`, type: 'ai', content: command.payload.text, timestamp: new Date() };
          setMessages(prev => [...prev, aiMessage]); // Add AI message to chat history.
          play(command.payload.audioContent, () => { // Play the audio content.
            setCurrentTranscript(''); // Clear transcript after speech.
            resolve(); // Resolve the promise when audio playback is complete.
          });
          break;
        
        case 'createText':
        case 'drawArrow':
        case 'drawRectangle':
        case 'drawCircle':
        case 'createTable':
          // Add the new object to the canvas state.
          setCanvasObjects(prev => [...prev, { ...command, id: `${command.command}-${Date.now()}` }]);
          setTimeout(resolve, command.delay || 500); // Resolve after a short delay for visual effect.
          break;

        case 'fillTable':
          // Update an existing table object on the canvas by adding new cells.
          setCanvasObjects(prev => prev.map(obj =>
            obj.payload.id === command.payload.tableId
            ? { ...obj, payload: { ...obj.payload, cells: [...(obj.payload.cells || []), { ...command.payload }] } } // Add new cells.
            : obj
          ));
          setTimeout(resolve, command.delay || 500); // Resolve after a short delay.
          break;

        case 'clearCanvas':
          setCanvasObjects([]); // Clear all objects from the canvas.
          setTimeout(resolve, command.delay || 500); // Resolve after a short delay.
          break;

        case 'session_end':
          setIsPlaying(false); // Stop playback.
          setIsProcessing(false); // Reset processing flag.
          // Persist the final canvas state to the database for later retrieval.
          if (sessionId) {
            const token = localStorage.getItem('token');
            fetch(`/api/sessions/${sessionId}/canvas`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ canvasState: canvasObjects }) // Send current canvas state.
            });
          }
          resolve(); // Resolve immediately as no further action is needed.
          break;

        default:
          console.warn(`Unknown command: ${command.command}`); // Log unknown commands.
          resolve(); // Resolve to continue processing the queue.
      }
    });
  };

  /**
   * Renders a single object on the Konva canvas based on its command type.
   * This function acts as a dispatcher to render different shapes and texts.
   * @param {any} obj - The canvas object to render, containing command and payload.
   * @returns {React.ReactNode | null} The corresponding Konva shape or null if the command is not recognized.
   */
  const renderCanvasObject = (obj: any) => {
    const { command, payload, id } = obj;
    switch (command) {
      case 'createText':
        return <KonvaText key={id} x={payload.x} y={payload.y} text={payload.text} fontSize={payload.fontSize || 18} fill={payload.color || '#333'} />;
      case 'drawArrow':
        return <Arrow key={id} points={payload.points} pointerLength={8} pointerWidth={8} fill={payload.color || '#333'} stroke={payload.color || '#333'} strokeWidth={3} />;
      case 'drawRectangle':
        return (
          <React.Fragment key={id}>
            <Rect x={payload.x} y={payload.y} width={payload.width} height={payload.height} fill={payload.color} stroke="#333" strokeWidth={2} cornerRadius={5}/>
            {payload.label && <KonvaText x={payload.x + 10} y={payload.y + 10} text={payload.label} fontSize={14} fill="#333" />}
          </React.Fragment>
        );
      case 'drawCircle':
        return (
          <React.Fragment key={id}>
            <Circle x={payload.x} y={payload.y} radius={payload.radius} fill={payload.color} stroke="#333" strokeWidth={2} />
            {payload.label && <KonvaText x={payload.x - (payload.label.length * 4)} y={payload.y + payload.radius + 5} text={payload.label} fontSize={12} fill="#333" />}
          </React.Fragment>
        );
      case 'createTable':
        const headerHeight = payload.rowHeight;
        return (
          <React.Fragment key={id}>
            {/* Render table headers */}
            {payload.headers.map((header: string, i: number) => {
              const colX = payload.x + payload.colWidths.slice(0, i).reduce((a: number, b: number) => a + b, 0);
              return (
                <React.Fragment key={`header-${i}`}>
                  <Rect x={colX} y={payload.y} width={payload.colWidths[i]} height={headerHeight} stroke="#333" strokeWidth={1} />
                  <KonvaText x={colX + 5} y={payload.y + 10} text={header} fontStyle="bold" fontSize={14} />
                </React.Fragment>
              );
            })}
            {/* Render table grid lines */}
            {[...Array(payload.rows -1)].map((_, rowIndex) => (
                 [...Array(payload.cols)].map((_, colIndex) => {
                    const cellX = payload.x + payload.colWidths.slice(0, colIndex).reduce((a:number, b:number) => a + b, 0);
                    const cellY = payload.y + headerHeight + (rowIndex * payload.rowHeight);
                    return <Rect key={`cell-${rowIndex}-${colIndex}`} x={cellX} y={cellY} width={payload.colWidths[colIndex]} height={payload.rowHeight} stroke="#333" strokeWidth={1} />
                 })
            ))}
            {/* Render filled table cells */}
            {payload.cells?.map((cell: any, i: number) => {
               const cellX = payload.x + payload.colWidths.slice(0, cell.col).reduce((a:number, b:number) => a + b, 0);
               const cellY = payload.y + (cell.row * payload.rowHeight);
               return <KonvaText key={`fill-${i}`} x={cellX + 5} y={cellY + 10} text={cell.text} fontSize={14} />
            })}
          </React.Fragment>
        );
      default:
        return null;
    }
  };

  /**
   * Handles key press events in the message input field.
   * Specifically, it sends the message when the 'Enter' key is pressed (without 'Shift').
   * @param {React.KeyboardEvent} e - The keyboard event.
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent default new line behavior.
      handleSendMessage();
    }
  };

  /**
   * Toggles the playback state of canvas commands (play/pause).
   */
  const handlePlayPause = () => setIsPlaying(!isPlaying);

  /**
   * Toggles the minimized state of the chat panel.
   * Includes a transition delay for smooth animation.
   */
  const toggleChatMinimize = () => {
    setIsTransitioning(true); // Start transition.
    setChatMinimized(!chatMinimized); // Toggle minimized state.
    setTimeout(() => setIsTransitioning(false), 500); // End transition after animation duration.
  };

  /**
   * Effect hook to automatically scroll the message list to the bottom when new messages are added.
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]); // Dependency array: re-run when messages array changes.

  /**
   * Effect hook to dynamically resize the Konva canvas when its container dimensions change.
   * This ensures the canvas always fits its parent element.
   */
  useEffect(() => {
    const canvasContainer = canvasContainerRef.current;
    if (!canvasContainer) return;
    
    // Create a ResizeObserver to watch for changes in the container's size.
    const resizeObserver = new ResizeObserver(entries => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setCanvasSize({ width, height }); // Update canvas size state.
      }
    });
    
    resizeObserver.observe(canvasContainer); // Start observing the container.
    
    // Cleanup function: disconnect the observer when the component unmounts.
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div className="h-screen flex bg-slate-100 overflow-hidden"> {/* Main container for the chat and canvas layout. */}
      <div className={`flex flex-col bg-gray-800 border-r border-gray-700 transition-all duration-500 ease-in-out flex-shrink-0 overflow-hidden ${chatMinimized ? 'w-0' : 'w-full md:w-1/2 lg:w-1/3'}`}> {/* Chat panel container. */}
        <div className={`w-full h-full flex flex-col transition-opacity duration-300 ${chatMinimized ? 'opacity-0' : 'opacity-100'}`}> {/* Inner container for chat content, handles opacity during minimization. */}
            <div className="p-4 border-b border-gray-700 bg-gray-900 flex items-center justify-between"> {/* Chat header. */}
                <div>
                  <h2 className="text-lg font-bold text-gray-200">Learning Session</h2>
                  <p className="text-xs text-gray-400 truncate max-w-xs">{isNew ? 'New Session' : sessionId}</p>
                </div>
                <button onClick={toggleChatMinimize} className="p-2 text-gray-400 hover:text-gray-200 transition-colors" title="Hide Chat">
                  <ChevronLeft size={20} />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4"> {/* Chat messages display area. */}
              {messages.length === 0 && !isLoading && (
                <div className="text-center text-gray-400 mt-20"> {/* Placeholder for empty chat. */}
                  <img src={vikaaiBotIcon} alt="Bot icon" className="w-16 h-16 mx-auto mb-4 rounded-lg" />
                  <p className="text-lg font-medium">{isNew ? 'Start a new session' : 'Session History'}</p>
                  <p className="text-sm">{isNew ? 'Ask me anything to get started!' : 'This is the history of your session.'}</p>
                </div>
              )}
              {messages.map((message) => (
                <div key={message.id} className={`flex flex-col ${message.type === 'user' ? 'items-end' : 'items-start'}`}> {/* Individual message container. */}
                    <div className={`flex gap-3 w-full ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}> {/* Message bubble and avatar alignment. */}
                        {message.type === 'ai' && <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0"><img src={vikaaiIcon} alt="Bot icon" className="w-6 h-6 rounded-sm" /></div>} {/* AI avatar. */}
                        <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${message.type === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}> {/* Message bubble styling. */}
                            {message.type === 'user' && message.files && message.files.length > 0 && <MessageFilePreview files={message.files} />} {/* Display file preview for user messages. */}
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                            <span className={`text-xs opacity-70 mt-1 block ${message.type === 'user' ? 'text-blue-100' : 'text-gray-400'}`}>{message.timestamp.toLocaleTimeString()}</span> {/* Message timestamp. */}
                        </div>
                        {message.type === 'user' && <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0"><User size={16} className="text-gray-300" /></div>} {/* User avatar. */}
                    </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start"> {/* Loading indicator for AI response. */}
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0"><img src={vikaaiIcon} alt="Bot icon" className="w-6 h-6 rounded-sm" /></div>
                  <div className="bg-slate-100 rounded-2xl px-4 py-3 flex items-center"><div className="flex space-x-1"><div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div><div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div><div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div></div></div>
                </div>
              )}
              <div ref={messagesEndRef} /> {/* Ref for auto-scrolling. */}
            </div>
            <div className="p-4 border-t border-gray-700 bg-gray-900"> {/* Message input area. */}
              <FilePreview files={stagedFiles} onRemoveFile={handleRemoveFile} /> {/* Display staged files. */}
              {isListening && (
                <div className="relative mb-2 animate-in fade-in slide-in-from-bottom-2 duration-300"> {/* Live speech recognition indicator. */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur-md opacity-60"></div>
                  <div className="relative px-4 py-2 bg-slate-800 rounded-lg leading-none flex items-center">
                    <div className="flex items-center gap-2 text-purple-300">
                        <div className="flex gap-0.5 items-center h-4">
                            <span className="w-1 h-1 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></span>
                            <span className="w-1 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></span>
                            <span className="w-1 h-3 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></span>
                            <span className="w-1 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></span>
                            <span className="w-1 h-1 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
                        </div>
                        <span className="text-sm font-medium text-white">VikaAI is listening...</span>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3"> {/* Input field and action buttons. */}
                <FileUploader onUploadComplete={handleUploadComplete} disabled={isLoading || totalFiles >= 5} sessionId={sessionId} existingFileCount={existingFileCount} />
                <div className="flex-1 relative">
                  <textarea
                    value={isListening ? transcript : inputValue}
                    onChange={(e) => {
                      if (isListening) stopListening();
                      setInputValue(e.target.value);
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder={isListening ? "Listening..." : (stagedFiles.length > 0 ? "Ask a question about the document(s)..." : "Ask me anything...")}
                    className="w-full p-3 pr-10 border border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-gray-700 text-gray-200 placeholder-gray-400"
                    rows={1}
                    disabled={isLoading}
                  />
                </div>
                <button 
                  onClick={handleMicClick} 
                  disabled={!hasRecognitionSupport || isLoading}
                  className={`p-3 transition-all duration-300 rounded-full disabled:opacity-50 disabled:cursor-not-allowed ${
                    isListening 
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50 ring-4 ring-purple-500/30' 
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                  }`}
                  title={hasRecognitionSupport ? (isListening ? "Stop listening" : "Start listening") : "Speech recognition not supported"}
                >
                  <Mic size={20} />
                </button>
                <button id="send-button" onClick={() => handleSendMessage()} disabled={!(isListening ? transcript : inputValue).trim() || isLoading} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                  <Send size={20} />
                </button>
              </div>
            </div>
        </div>
      </div>
      <div className={`bg-gray-900 relative flex flex-col transition-all duration-500 ease-in-out flex-1`}> {/* Canvas panel container. */}
        <div className="p-4 bg-gray-800 border-b border-gray-700 flex items-center gap-4 flex-shrink-0"> {/* Canvas header. */}
          <div className="flex items-center gap-3 min-w-0">
            {chatMinimized && <button onClick={toggleChatMinimize} className="p-2 text-gray-400 hover:bg-gray-700 rounded-lg flex-shrink-0" title="Show Chat"><ChevronRight size={20} /></button>}
            <h3 className="text-lg font-semibold text-gray-200 truncate">Visual Learning Canvas</h3>
          </div>
          <div className="flex items-center flex-shrink-0 gap-2 ml-auto"> {/* Canvas control buttons. */}
            <button 
              onClick={() => setIsLiveConversationOpen(true)}
              disabled={isNew}
              className={`
                flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300
                ${isNew
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50 blur-[1px]'
                  : 'bg-purple-100 text-purple-600 hover:bg-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.5)] hover:shadow-[0_0_20px_rgba(168,85,247,0.7)]'
                }
              `}

              title={isNew ? "Start a session first to enable live conversation" : "Start a live conversation with VikaAI"}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden md:inline font-semibold">Start Conversation</span>
            </button>
            <button onClick={handlePlayPause} disabled={commandQueue.length === 0 && !isPlaying} className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${isPlaying ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span className="hidden md:inline">{isPlaying ? 'Pause' : 'Play'}</span>
            </button>
            <button onClick={handleReset} className="flex items-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-all">
              <RotateCcw className="w-4 h-4" />
              <span className="hidden md:inline">Reset</span>
            </button>
            <button onClick={toggleChatMinimize} className="p-2 text-gray-400 hover:bg-gray-700 rounded-lg transition-all" title={chatMinimized ? "Show Chat" : "Focus Mode"}>
              {chatMinimized ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <div ref={canvasContainerRef} className="flex-1 overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900"> {/* Konva canvas rendering area. */}
          {canvasSize.width > 0 && !isTransitioning && (
            <Stage width={canvasSize.width} height={canvasSize.height}>
              <Layer>{canvasObjects.map(renderCanvasObject)}</Layer>
            </Stage>
          )}
        </div>
        {currentTranscript && (
          <div className="absolute bottom-20 left-4 right-4 bg-black/80 backdrop-blur-sm rounded-2xl p-6 text-white shadow-2xl border border-white/20 animate-in slide-in-from-bottom-4 duration-300"> {/* Live AI transcript display. */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0"><img src={vikaaiIcon} alt="Bot icon" className="w-7 h-7 rounded-sm" /></div>
              <div className="flex-1">

                <div className="flex items-center gap-2 mb-2"><span className="text-sm font-semibold text-blue-300">Vika</span><div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div><span className="text-xs text-white/70">LIVE</span></div></div>
                <p className="text-white leading-relaxed text-lg font-medium">{currentTranscript}</p>
              </div>
            </div>
          </div>
        )}
        <div className="p-4 bg-gray-900 border-t border-gray-700 flex-shrink-0"> {/* Lesson progress bar. */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-200">Lesson Progress</span>
            <span className="text-sm text-gray-400">{lessonSteps.current} / {lessonSteps.total} steps</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300" style={{ width: `${lessonSteps.total > 0 ? (lessonSteps.current / lessonSteps.total) * 100 : 0}%` }}></div></div>
        </div>
        <AIVoiceAgent isActive={isSpeaking} /> {/* AI Voice Agent visual component. */}
      </div>

      <LiveConversationOverlay 
        isOpen={isLiveConversationOpen} 
        onClose={() => setIsLiveConversationOpen(false)} 
        sessionId={sessionId}
      />
    </div>
  );
};

export default ChatPage;