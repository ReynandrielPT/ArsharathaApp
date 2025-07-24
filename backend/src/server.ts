import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import admin from 'firebase-admin';

import userRouter from './routes/user';

dotenv.config();

const serviceAccount = require('../google-credentials.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL,
        methods: ["GET", "POST"]
    }
});

const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI || 'mongodb://mongo:27017/cogniflow';

mongoose.connect(mongoUri)
    .then(() => console.log('MongoDB connected successfully.'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/user', userRouter);

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

    socket.on('start_session', (data) => {
        console.log('start_session event received (placeholder)', data);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected from session namespace: ${socket.id}`);
    });
});

const liveConversationNsp = io.of('/live-conversation');

liveConversationNsp.on('connection', (socket: CustomSocket) => {
    console.log(`[Live] INFO: User connected to live-conversation: ${socket.id}, userId: ${socket.userId}`);
    socket.on('audio_stream_from_client', (audioChunk) => {
        console.log('audio_stream_from_client received (placeholder)');
    });

    socket.on('disconnect', (reason) => {
        console.log(`[Live] INFO: User disconnected from live-conversation: ${socket.id}. Reason: ${reason}`);
    });
});

server.listen(port, () => {
    console.log(`Backend server is running at http://localhost:${port}`);
});

export { io };
