import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import mongoose, { isValidObjectId } from 'mongoose';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import cors from 'cors';
import path from 'path';

// Import routers
import userRouter from './routes/user';
import sessionsRouter from './routes/sessions';
import uploadRouter from './routes/upload';

// Import models
import { Session } from './models/Session';
import { Message, IMessage } from './models/Message';
import { File } from './models/File';

// Import services and utilities
import { generateContentWithHistory, formatHistory, generativeModel } from './llm';
import { extractTextFromFile } from './fileprocessing';
import { synthesizeSpeech } from './services/ttsService';
import { createSpeechStream } from './services/sttService';
import { processUserUtterance } from './services/voiceAgentService';

dotenv.config();

const serviceAccount = require('../google-credentials.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"]
    }
});

const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI || 'mongodb://mongo:27017/arsharatha';

mongoose.connect(mongoUri)
    .then(() => console.log('MongoDB connected successfully.'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/user', userRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/upload', uploadRouter);

interface CustomSocket extends Socket {
    userId?: string;
}

io.use(async (socket: CustomSocket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error: Token not provided.'));
    
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        socket.userId = decodedToken.uid;
        next();
    } catch (err) {
        return next(new Error('Authentication error: Invalid token.'));
    }
});

const sessionNsp = io.of('/');

sessionNsp.on('connection', (socket: CustomSocket) => {
    console.log(`A user connected to session namespace: ${socket.id}, userId: ${socket.userId}`);

    socket.on('start_session', async (data: { promptText: string, sessionId?: string, fileIds?: string[], varkMode: 'V' | 'A' | 'R' | 'K', speechEnabled: boolean }) => {
        const { promptText, sessionId, fileIds, varkMode, speechEnabled } = data;
        const userId = socket.userId;
        const isNewSession = !sessionId || !isValidObjectId(sessionId);

        try {
            let currentSession: any;
            let aggregatedFileContent = '';
            let history: string | undefined = undefined;

            if (fileIds && fileIds.length > 0) {
                const validFileIds = fileIds.filter(id => isValidObjectId(id));
                const files = await File.find({ _id: { $in: validFileIds }, userId: userId });

                if (files.length !== validFileIds.length) {
                    throw new Error('File mismatch or access denied.');
                }

                const contentPromises = files.map(file =>
                    extractTextFromFile(file.path, file.mimetype).then(content =>
                        `--- START OF FILE: ${file.originalFilename} ---\n${content}\n--- END OF FILE: ${file.originalFilename} ---`
                    )
                );
                aggregatedFileContent = (await Promise.all(contentPromises)).join('\n\n');
            }

            if (isNewSession) {
                const titlePrompt = `Summarize the following user prompt into a short, descriptive title of no more than 5 words: "${promptText}"`;
                const titleResult = await generativeModel.generateContent(titlePrompt);
                const generatedTitle = (await titleResult.response).text().trim().replace(/['"]+/g, '');

                currentSession = new Session({ title: generatedTitle || promptText.substring(0, 30), userId, varkMode, speechEnabled });
                await currentSession.save();
                socket.emit('session_created', { sessionId: currentSession._id.toString(), title: currentSession.title, updatedAt: currentSession.updatedAt });
            } else {
                currentSession = await Session.findOne({ _id: sessionId, userId: userId });
                if (currentSession) {
                    const previousMessages = await Message.find({ sessionId: currentSession._id }).sort({ createdAt: -1 }).limit(5);
                    history = formatHistory(previousMessages.reverse());
                }
            }

            if (!currentSession) throw new Error("Session could not be found or created.");

            const userMessage = new Message({ sessionId: currentSession._id, sender: 'user', text: promptText, fileIds: fileIds ? fileIds.filter(id => isValidObjectId(id)) : [] });
            await userMessage.save();

            const rawText = await generateContentWithHistory(promptText, varkMode, history, aggregatedFileContent);

            if (varkMode === 'R') {
                const aiMessage = new Message({ sessionId: currentSession._id, sender: 'ai', text: rawText });
                await aiMessage.save();
                socket.emit('text_response', { sessionId: currentSession._id, message: rawText });
            } else {
                let commandStream: any[];
                try {
                    const jsonMatch = rawText.match(/\u005B[^]*\u005D/);
                    if (!jsonMatch) throw new Error("No valid JSON array found in LLM response.");
                    commandStream = JSON.parse(jsonMatch[0]);
                    if (!Array.isArray(commandStream)) throw new Error("LLM response was not a JSON array.");
                    
                    if(speechEnabled) {
                      //Orchestrate and emit commands with audio
                    } else {
                      socket.emit('command_stream_received', { sessionId: currentSession._id, commands: commandStream });
                    }

                } catch (jsonError) {
                    console.error('[Socket] FATAL: Error parsing LLM response as JSON:', jsonError);
                    socket.emit('session_error', { message: 'Failed to parse AI response.' });
                }
            }
            
            currentSession.updatedAt = new Date();
            await currentSession.save();

        } catch (error) {
            console.error('[Socket] FATAL: Unhandled error in start_session handler:', error);
            socket.emit('session_error', { message: 'Failed to process session. ' + (error instanceof Error ? error.message : 'Unknown error.') });
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected from session namespace: ${socket.id}`);
    });
});

const liveConversationNsp = io.of('/live-conversation');

liveConversationNsp.on('connection', (socket: CustomSocket) => {
    console.log(`[Live] INFO: User connected to live-conversation: ${socket.id}, userId: ${socket.userId}`);
    
    let speechStream: any = null;
    let liveHistory: IMessage[] = [];

    socket.on('start_conversation', (data: { sessionId: string }) => {
        liveHistory = [];
        
        speechStream = createSpeechStream(
            async (sttData) => {
                const result = sttData.results[0];
                if (!result || !result.alternatives[0]) return;

                const transcript = result.alternatives[0].transcript;
                const isFinal = result.isFinal;

                socket.emit('transcript_update', { transcript, isFinal });

                if (isFinal && transcript.trim()) {
                    liveHistory.push({ sender: 'user', text: transcript } as IMessage);
                    
                    const sessionMessages = await Message.find({ sessionId: data.sessionId }).sort({ createdAt: 1 });
                    const files = await File.find({ _id: { $in: sessionMessages.flatMap(m => m.fileIds || []) } });
                    const aggregatedFileContent = (await Promise.all(files.map(file => 
                        extractTextFromFile(file.path, file.mimetype).then(content => 
                            `--- START OF FILE: ${file.originalFilename} ---\n${content}\n--- END OF FILE: ${file.originalFilename} ---`
                        )
                    ))).join('\n\n');

                    const { verbalResponse, triggerVisualization, promptForLLM } = await processUserUtterance(transcript, liveHistory, sessionMessages, aggregatedFileContent);

                    if (!verbalResponse) return;

                    const audioContent = await synthesizeSpeech(verbalResponse);
                    socket.emit('ai_audio_response', { audioContent, transcript: verbalResponse });
                    liveHistory.push({ sender: 'ai', text: verbalResponse } as IMessage);

                    if (triggerVisualization && promptForLLM) {
                        socket.emit('trigger_visualization', { prompt: promptForLLM });
                    }
                }
            },
            (error) => {
                console.error('[Live] FATAL: STT Stream Error:', error);
                socket.emit('conversation_error', { message: 'Speech recognition error.' });
            },
            () => { speechStream = null; }
        );
    });

    socket.on('audio_stream_from_client', (audioChunk) => {
        if (speechStream && !speechStream.destroyed) {
            speechStream.write(audioChunk);
        }
    });

    socket.on('client_interruption', () => {
        if (speechStream) {
            speechStream.destroy();
            speechStream = null;
        }
    });

    socket.on('disconnect', (reason) => {
        if (speechStream) {
            speechStream.destroy();
            speechStream = null;
        }
    });
});

server.listen(port, () => {
    console.log(`Backend server is running at http://localhost:${port}`);
});

export { io };

